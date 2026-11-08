'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('node:crypto');

class CreateRecordWorkload extends WorkloadModuleBase {
  async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
    await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    this.workerIndex = workerIndex;
    this.counter = 0;
  }
  async submitTransaction() {
    const id = 'caliper-' + this.workerIndex + '-' + Date.now() + '-' + this.counter++ + '-' + crypto.randomUUID();
    const record = {
      recordId: id, patientPseudoId: 'synthetic-' + this.workerIndex, ownerOrgId: 'Org1MSP',
      recordType: 'DiagnosticReport', contentType: 'application/fhir+json',
      objectUri: 's3://synthetic-benchmark/' + id,
      cipherHash: crypto.createHash('sha256').update(id).digest('hex'),
      createdAt: new Date().toISOString(), version: 1
    };
    return this.sutAdapter.sendRequests({
      contractId: 'healthchain',
      contractFunction: 'RegistryContract:CreateRecord',
      contractArguments: [JSON.stringify(record)],
      readOnly: false
    });
  }
}
function createWorkloadModule() { return new CreateRecordWorkload(); }
module.exports.createWorkloadModule = createWorkloadModule;
