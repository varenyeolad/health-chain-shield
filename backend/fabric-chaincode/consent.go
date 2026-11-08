package main

import (
 "encoding/json"
 "fmt"
 "time"
 "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type ConsentContract struct{contractapi.Contract}
type ConsentPolicy struct {
 PolicyId string `json:"policyId"`
 PatientPseudoId string `json:"patientPseudoId"`
 GranteeOrgId string `json:"granteeOrgId"`
 RecordTypes []string `json:"recordTypes"`
 Purpose []string `json:"purpose"`
 ValidFrom string `json:"validFrom"`
 ValidTo string `json:"validTo"`
 Status string `json:"status"`
}
func consentKey(id string)string{return "consent:"+id}
func contains(xs []string,x string)bool{for _,s:=range xs{if s==x{return true}};return false}
func (c *ConsentContract) GrantConsent(ctx contractapi.TransactionContextInterface,raw string)(string,error){
 var p ConsentPolicy;if err:=json.Unmarshal([]byte(raw),&p);err!=nil{return "",err}
 if p.PolicyId==""||p.PatientPseudoId==""||p.GranteeOrgId==""||len(p.RecordTypes)==0||len(p.Purpose)==0{return "",fmt.Errorf("invalid policy")}
 patientID,err:=ctx.GetClientIdentity().GetID();if err!=nil{return "",err}
 if p.PatientPseudoId!=patientID{return "",fmt.Errorf("patient signature required: patientPseudoId must equal client identity")}
 from,err:=time.Parse(time.RFC3339,p.ValidFrom);if err!=nil{return "",err}
 to,err:=time.Parse(time.RFC3339,p.ValidTo);if err!=nil{return "",err}
 if !to.After(from){return "",fmt.Errorf("invalid validity interval")}
 x,err:=ctx.GetStub().GetState(consentKey(p.PolicyId));if err!=nil{return "",err};if x!=nil{return "",fmt.Errorf("policy exists")}
 p.Status="ACTIVE";data,_:=json.Marshal(p)
 if err:=ctx.GetStub().PutState(consentKey(p.PolicyId),data);err!=nil{return "",err}
 return ctx.GetStub().GetTxID(),nil
}
func (c *ConsentContract) GetConsent(ctx contractapi.TransactionContextInterface,id string)(string,error){
 data,err:=ctx.GetStub().GetState(consentKey(id));if err!=nil{return "",err};if data==nil{return "",fmt.Errorf("consent not found")};return string(data),nil
}
func (c *ConsentContract) RevokeConsent(ctx contractapi.TransactionContextInterface,id string)(string,error){
 raw,err:=c.GetConsent(ctx,id);if err!=nil{return "",err}
 var p ConsentPolicy;if err:=json.Unmarshal([]byte(raw),&p);err!=nil{return "",err}
 patientID,err:=ctx.GetClientIdentity().GetID();if err!=nil{return "",err}
 if p.PatientPseudoId!=patientID{return "",fmt.Errorf("only patient may revoke")}
 p.Status="REVOKED";data,_:=json.Marshal(p)
 if err:=ctx.GetStub().PutState(consentKey(id),data);err!=nil{return "",err}
 return ctx.GetStub().GetTxID(),nil
}
func (c *ConsentContract) CheckAccess(ctx contractapi.TransactionContextInterface,patient,grantee,recordType,recordTime,purpose string)(string,error){
 // Use the transaction timestamp to prevent the submitter from selecting an earlier date.
 ts,err:=ctx.GetStub().GetTxTimestamp();if err!=nil{return "",err}
 now:=time.Unix(ts.Seconds,int64(ts.Nanos))
 iter,err:=ctx.GetStub().GetStateByRange("consent:","consent;");if err!=nil{return "",err};defer iter.Close()
 allowed:="false"
 var id string
 for iter.HasNext(){item,err:=iter.Next();if err!=nil{return "",err};var p ConsentPolicy;if err:=json.Unmarshal(item.Value,&p);err!=nil{return "",err}
 from,e1:=time.Parse(time.RFC3339,p.ValidFrom);to,e2:=time.Parse(time.RFC3339,p.ValidTo)
 if e1==nil&&e2==nil&&p.Status=="ACTIVE"&&p.PatientPseudoId==patient&&p.GranteeOrgId==grantee&&contains(p.RecordTypes,recordType)&&contains(p.Purpose,purpose)&&!now.Before(from)&&!now.After(to){allowed="true";id=p.PolicyId;break}
 }
 // recordTime is retained in the interface for compatibility; it does not override tx time.
 _=recordTime
 b,_:=json.Marshal(map[string]interface{}{"allowed":allowed=="true","policyId":id});return string(b),nil
}

 
// CallerID exposes only the public Fabric identity reference. It is useful for
// integration tests and enrolling patient aliases; it does not reveal private keys.
func (c *ConsentContract) CallerID(ctx contractapi.TransactionContextInterface) (string,error) {
 return ctx.GetClientIdentity().GetID()
}
