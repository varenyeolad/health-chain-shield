package main

import (
 "encoding/json"
 "fmt"
 "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type RegistryContract struct{ contractapi.Contract }
type RecordMeta struct {
 RecordId string `json:"recordId"`
 PatientPseudoId string `json:"patientPseudoId"`
 OwnerOrgId string `json:"ownerOrgId"`
 RecordType string `json:"recordType"`
 ContentType string `json:"contentType"`
 ObjectUri string `json:"objectUri"`
 CipherHash string `json:"cipherHash"`
 CreatedAt string `json:"createdAt"`
 Version int `json:"version"`
}
func recordKey(id string) string { return "record:"+id }
func (c *RegistryContract) RegisterRecord(ctx contractapi.TransactionContextInterface, metaJSON string) (string,error) {
 var r RecordMeta
 if err:=json.Unmarshal([]byte(metaJSON),&r); err!=nil{return "",err}
 if r.RecordId=="" || r.PatientPseudoId=="" || r.OwnerOrgId=="" || r.CipherHash=="" || r.ObjectUri=="" {return "",fmt.Errorf("required record metadata missing")}
 msp,err:=ctx.GetClientIdentity().GetMSPID();if err!=nil{return "",err}
 if msp=="" {return "",fmt.Errorf("unauthenticated identity")}
 // A network membership policy should additionally map identity MSP to provider organizations.
 if r.OwnerOrgId!=msp{return "",fmt.Errorf("ownerOrgId must match submitter MSP")}
 existing,err:=ctx.GetStub().GetState(recordKey(r.RecordId));if err!=nil{return "",err}
 if existing!=nil{return "",fmt.Errorf("record already registered")}
 data,err:=json.Marshal(r);if err!=nil{return "",err}
 if err:=ctx.GetStub().PutState(recordKey(r.RecordId),data);err!=nil{return "",err}
 return ctx.GetStub().GetTxID(),nil
}
func (c *RegistryContract) GetRecord(ctx contractapi.TransactionContextInterface,id string)(string,error){
 data,err:=ctx.GetStub().GetState(recordKey(id));if err!=nil{return "",err}
 if data==nil{return "",fmt.Errorf("record not found")}
 return string(data),nil
}
func (c *RegistryContract) QueryRecordsByScope(ctx contractapi.TransactionContextInterface,patient string)(string,error){
 iter,err:=ctx.GetStub().GetStateByRange("record:","record;");if err!=nil{return "",err};defer iter.Close()
 out:=[]RecordMeta{}
 for iter.HasNext(){x,err:=iter.Next();if err!=nil{return "",err};var r RecordMeta;if err:=json.Unmarshal(x.Value,&r);err!=nil{return "",err};if r.PatientPseudoId==patient{out=append(out,r)}}
 data,err:=json.Marshal(out);return string(data),err
}
func (c *RegistryContract) CreateRecord(ctx contractapi.TransactionContextInterface,metaJSON string)(string,error){return c.RegisterRecord(ctx,metaJSON)}
func (c *RegistryContract) ReadRecord(ctx contractapi.TransactionContextInterface,id string)(string,error){return c.GetRecord(ctx,id)}
