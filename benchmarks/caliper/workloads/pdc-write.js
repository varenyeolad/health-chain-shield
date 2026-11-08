'use strict';
const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('node:crypto');

/** Synthetic private writes using Fabric transient input, never transaction arguments. */
class PdcWriteWorkload extends WorkloadModuleBase {
  async initializeWorkloadModule(workerIndex,totalWorkers,roundIndex,roundArguments,sutAdapter,sutContext) {
    await super.initializeWorkloadModule(workerIndex,totalWorkers,roundIndex,roundArguments,sutAdapter,sutContext);
    this.workerIndex=workerIndex;this.sequence=0;
    this.operation=roundArguments?.operation || 'PutRecordKey';
  }
  async submitTransaction() {
    const id='pdc-'+this.workerIndex+'-'+this.sequence+++'-'+crypto.randomUUID();
    const operations={
      PutRecordKey:'recordKey',AddDiagnosis:'diagnosis',AddLabResults:'labResults'
    };
    const key=operations[this.operation];
    if (!key) throw new Error('Unsupported PDC operation '+this.operation);
    const value=key==='recordKey' ? crypto.randomBytes(32).toString('base64')
      : JSON.stringify({ synthetic:true,recordId:id,resourceType:key==='diagnosis'?'Condition':'Observation' });
    return this.sutAdapter.sendRequests({
      contractId:'healthchain',
      contractFunction:'RegistryContract:'+this.operation,
      contractArguments:[id],
      transientMap:{[key]: Buffer.from(value)},
      readOnly:false
    });
  }
}
module.exports.createWorkloadModule=()=>new PdcWriteWorkload();
