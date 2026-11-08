'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('node:crypto');

class ReadRecordWorkload extends WorkloadModuleBase {
  async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
    await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    this.workerIndex = workerIndex;
    this.id = 'caliper-read-' + crypto.randomUUID();
    this.counter = 0;
    const record = {
      recordId: this.id, patientPseudoId: 'synthetic-read',
      ownerOrgId: 'Org1MSP', recordType: 'DiagnosticReport',
      contentType: 'application/fhir+json', objectUri: 's3://synthetic-benchmark/' + this.id,
      cipherHash: crypto.createHash('sha256').update(this.id).digest('hex'),
      createdAt: new Date().toISOString(), version: 1
    };
    await this.sutAdapter.sendRequests({
      contractId: 'healthchain', contractFunction: 'RegistryContract:CreateRecord',
      contractArguments: [JSON.stringify(record)], readOnly: false
    });
  }
  async submitTransaction() {
    return this.sutAdapter.sendRequests({
      contractId: 'healthchain',
      contractFunction: 'RegistryContract:ReadRecord',
      contractArguments: [this.id],
      readOnly: true
    });
  }
}
module.exports.createWorkloadModule = () => new ReadRecordWorkload();
