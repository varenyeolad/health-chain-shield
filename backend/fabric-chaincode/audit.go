package main

import (
 "encoding/json"
 "fmt"
 "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type AuditContract struct{contractapi.Contract}
type AccessEvent struct{
 EventId string `json:"eventId"`
 RecordId string `json:"recordId"`
 PatientPseudoId string `json:"patientPseudoId"`
 RequesterOrgId string `json:"requesterOrgId"`
 Purpose string `json:"purpose"`
 Outcome string `json:"outcome"`
 At string `json:"at"`
}
func (c *AuditContract) LogAccess(ctx contractapi.TransactionContextInterface,raw string)(string,error){
 var event AccessEvent
 if err:=json.Unmarshal([]byte(raw),&event);err!=nil{return "",err}
 if event.EventId==""||event.RecordId==""||event.PatientPseudoId==""||event.RequesterOrgId==""||!contains([]string{"ALLOW","DENY"},event.Outcome){return "",fmt.Errorf("invalid audit event")}
 key:="audit:"+event.EventId
 exists,err:=ctx.GetStub().GetState(key);if err!=nil{return "",err};if exists!=nil{return "",fmt.Errorf("audit events are append-only")}
 data,_:=json.Marshal(event);if err:=ctx.GetStub().PutState(key,data);err!=nil{return "",err}
 return ctx.GetStub().GetTxID(),nil
}
func (c *AuditContract) GetAuditByPatient(ctx contractapi.TransactionContextInterface,patient string)(string,error){
 iter,err:=ctx.GetStub().GetStateByRange("audit:","audit;");if err!=nil{return "",err};defer iter.Close()
 out:=[]AccessEvent{}
 for iter.HasNext(){e,err:=iter.Next();if err!=nil{return "",err};var a AccessEvent;if err:=json.Unmarshal(e.Value,&a);err!=nil{return "",err};if a.PatientPseudoId==patient{out=append(out,a)}}
 b,err:=json.Marshal(out);return string(b),err
}
