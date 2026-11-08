/**
 * Live integration smoke test for the NestJS Fabric Gateway adapter.
 * Requires a deployed Fabric test network and an Org1 identity with access to healthchannel.
 * Uses synthetic metadata only. No clinical data is created or transmitted.
 */
import { randomUUID, createHash } from 'crypto';
import { HyperledgerFabricGateway } from '../src/fabric/gateway/hyperledger-fabric.gateway';
import type { RecordMeta } from '../src/fabric/gateway/fabric-gateway.port';

async function main(): Promise<void> {
  if (process.env.FABRIC_MODE !== 'fabric') {
    throw new Error('Live integration requires FABRIC_MODE=fabric');
  }
  const id = 'sdk-' + randomUUID();
  const meta: RecordMeta = {
    recordId: id,
    patientPseudoId: 'synthetic-patient',
    ownerOrgId: process.env.FABRIC_MSP_ID ?? '',
    recordType: 'DiagnosticReport',
    contentType: 'application/fhir+json',
    objectUri: 's3://synthetic-benchmark/' + id,
    cipherHash: createHash('sha256').update(id).digest('hex'),
    createdAt: new Date().toISOString(),
    version: 1,
  };
  const gateway = new HyperledgerFabricGateway();
  try {
    const tx = await gateway.registerRecord(meta);
    if (!tx.txId || tx.txId.startsWith('fabric-reg-')) {
      throw new Error('Gateway did not return a real Fabric transaction ID');
    }
    const fromLedger = await gateway.getRecord(id);
    if (!fromLedger || fromLedger.recordId !== id || fromLedger.cipherHash !== meta.cipherHash) {
      throw new Error('On-chain record retrieval failed after SDK commit');
    }
    console.log(JSON.stringify({ status: 'PASS', operation: 'Fabric Gateway SDK submit + committed read', transactionId: tx.txId }));
  } finally {
    gateway.onModuleDestroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
