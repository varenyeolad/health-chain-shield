'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('node:crypto');

class PrivateReadWorkload extends WorkloadModuleBase {
  async initializeWorkloadModule(workerIndex,totalWorkers,roundIndex,roundArguments,sutAdapter,sutContext) {
    await super.initializeWorkloadModule(workerIndex,totalWorkers,roundIndex,roundArguments,sutAdapter,sutContext);
    this.id = 'pdc-read-'+workerIndex+'-'+crypto.randomUUID();
    // Seed a synthetic record key outside the measured read transactions.
    await this.sutAdapter.sendRequests({
      contractId:'healthchain',
      contractFunction:'RegistryContract:PutRecordKey',
      contractArguments:[this.id],
      transientMap:{recordKey:crypto.randomBytes(32)},
      readOnly:false
    });
  }
  async submitTransaction() {
    return this.sutAdapter.sendRequests({
      contractId:'healthchain',
      contractFunction:'RegistryContract:GetRecordKey',
      contractArguments:[this.id],
      readOnly:true
    });
  }
}
module.exports.createWorkloadModule=()=>new PrivateReadWorkload();
