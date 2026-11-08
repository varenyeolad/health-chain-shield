import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { connect, Contract, Gateway, Identity, signers } from '@hyperledger/fabric-gateway';
import * as grpc from '@grpc/grpc-js';
import { createPrivateKey, X509Certificate } from 'crypto';
import { readFileSync } from 'fs';
import {
  AccessCheckInput, AccessLogEntry, ConsentPolicy, FabricGatewayPort, RecordMeta, RecordQuery,
} from './fabric-gateway.port';

@Injectable()
export class HyperledgerFabricGateway implements FabricGatewayPort, OnModuleDestroy {
  private readonly logger = new Logger(HyperledgerFabricGateway.name);
  private client?: grpc.Client;
  private gateway?: Gateway;
  private contract?: Contract;

  private async getContract(): Promise<Contract> {
    if (this.contract) return this.contract;
    const peerEndpoint = this.requireEnv('FABRIC_PEER_ENDPOINT');
    const tlsRootCert = readFileSync(this.requireEnv('FABRIC_TLS_CERT_PATH'));
    const certificate = readFileSync(this.requireEnv('FABRIC_CERT_PATH'));
    const privateKeyPem = readFileSync(this.requireEnv('FABRIC_KEY_PATH'));
    const identity: Identity = {
      mspId: this.requireEnv('FABRIC_MSP_ID'),
      credentials: certificate,
    };
    // Validate the files early, before connecting to peers.
    new X509Certificate(certificate);
    const signer = signers.newPrivateKeySigner(createPrivateKey(privateKeyPem));
    const client = new grpc.Client(
      peerEndpoint,
      grpc.credentials.createSsl(tlsRootCert),
      { 'grpc.ssl_target_name_override': this.requireEnv('FABRIC_PEER_HOST_ALIAS') },
    );
    this.client = client;
    this.gateway = connect({
      client,
      identity,
      signer,
      evaluateOptions: () => ({ deadline: Date.now() + 10000 }),
      endorseOptions: () => ({ deadline: Date.now() + 20000 }),
      submitOptions: () => ({ deadline: Date.now() + 20000 }),
      commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
    });
    this.contract = this.gateway.getNetwork(this.requireEnv('FABRIC_CHANNEL')).getContract(this.requireEnv('FABRIC_CHAINCODE'));
    this.logger.log('Connected to Hyperledger Fabric Gateway');
    return this.contract;
  }

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(name + ' is required for FABRIC_MODE=fabric');
    return value;
  }

  private async submit(functionName: string, ...args: string[]): Promise<{ txId: string }> {
    const contract = await this.getContract();
    // submitAsync + getStatus ensures that success is only reported after VALID commit.
    const proposal = contract.newProposal(functionName, { arguments: args });
    const endorsed = await proposal.endorse();
    const submitted = await endorsed.submit();
    const status = await submitted.getStatus();
    if (!status.successful) throw new Error('Fabric transaction failed: ' + submitted.getTransactionId() + ', code ' + status.code);
    return { txId: submitted.getTransactionId() };
  }

  private async evaluate(functionName: string, ...args: string[]): Promise<string> {
    const contract = await this.getContract();
    const bytes = await contract.evaluateTransaction(functionName, ...args);
    return new TextDecoder().decode(bytes);
  }

  registerRecord(meta: RecordMeta) {
    return this.submit('RegistryContract:RegisterRecord', JSON.stringify(meta));
  }
  async getRecord(recordId: string): Promise<RecordMeta | null> {
    try { return JSON.parse(await this.evaluate('RegistryContract:GetRecord', recordId)) as RecordMeta; }
    catch (error) {
      // Do not disguise connection/authorization errors as a "not found" response.
      throw error;
    }
  }
  async queryRecordsByScope(scope: RecordQuery): Promise<RecordMeta[]> {
    const rows = JSON.parse(await this.evaluate('RegistryContract:QueryRecordsByScope', scope.patientPseudoId)) as RecordMeta[];
    return rows.filter(row =>
      (!scope.recordTypes?.length || scope.recordTypes.includes(row.recordType)) &&
      (!scope.from || row.createdAt >= scope.from) &&
      (!scope.to || row.createdAt <= scope.to));
  }
  grantConsent(policy: ConsentPolicy) {
    return this.submit('ConsentContract:GrantConsent', JSON.stringify(policy));
  }
  revokeConsent(policyId: string) {
    return this.submit('ConsentContract:RevokeConsent', policyId);
  }
  async checkAccess(input: AccessCheckInput): Promise<{ allowed: boolean; policyId?: string }> {
    return JSON.parse(await this.evaluate(
      'ConsentContract:CheckAccess',
      input.patientPseudoId, input.granteeOrgId, input.recordType, input.recordTime, input.purpose,
    ));
  }
  logAccess(entry: AccessLogEntry) {
    return this.submit('AuditContract:LogAccess', JSON.stringify(entry));
  }
  onModuleDestroy() {
    this.gateway?.close();
    this.client?.close();
  }
}
