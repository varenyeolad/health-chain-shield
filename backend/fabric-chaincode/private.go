package main

import (
 "encoding/json"
 "fmt"
 "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// These operations use transient data so private values do not enter public transaction arguments.
func (c *RegistryContract) PutRecordKey(ctx contractapi.TransactionContextInterface,id string)(string,error){
 transient,err:=ctx.GetStub().GetTransient();if err!=nil{return "",err}
 value:=transient["recordKey"];if len(value)==0{return "",fmt.Errorf("recordKey transient value required")}
 if err:=ctx.GetStub().PutPrivateData("recordKeys","key:"+id,value);err!=nil{return "",err}
 return ctx.GetStub().GetTxID(),nil
}
func (c *RegistryContract) GetRecordKey(ctx contractapi.TransactionContextInterface,id string)(string,error){
 value,err:=ctx.GetStub().GetPrivateData("recordKeys","key:"+id);if err!=nil{return "",err}
 if len(value)==0{return "",fmt.Errorf("key not found")}
 encoded,_:=json.Marshal(value)
 return string(encoded),nil
}

func (c *RegistryContract) AddDiagnosis(ctx contractapi.TransactionContextInterface,id string)(string,error){
 return putPrivateClinical(ctx,"diagnosis:"+id,"diagnosis")
}
func (c *RegistryContract) AddLabResults(ctx contractapi.TransactionContextInterface,id string)(string,error){
 return putPrivateClinical(ctx,"lab:"+id,"labResults")
}
func putPrivateClinical(ctx contractapi.TransactionContextInterface,key,transientName string)(string,error){
 values,err:=ctx.GetStub().GetTransient();if err!=nil{return "",err}
 payload:=values[transientName];if len(payload)==0{return "",fmt.Errorf("%s transient payload required",transientName)}
 if len(payload)>4*1024*1024{return "",fmt.Errorf("private payload exceeds test limit")}
 if err:=ctx.GetStub().PutPrivateData("recordKeys",key,payload);err!=nil{return "",err}
 return ctx.GetStub().GetTxID(),nil
}
