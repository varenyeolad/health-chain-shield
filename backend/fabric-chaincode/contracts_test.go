package main

import (
 "crypto/x509"
 "encoding/json"
 "testing"
 "time"

 "github.com/hyperledger/fabric-chaincode-go/shimtest"
 "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type testIdentity struct{ id, msp string }
func (i testIdentity) GetID() (string,error) { return i.id,nil }
func (i testIdentity) GetMSPID() (string,error) { return i.msp,nil }
func (i testIdentity) GetAttributeValue(string) (string,bool,error) { return "",false,nil }
func (i testIdentity) AssertAttributeValue(string,string) error { return nil }
func (i testIdentity) GetX509Certificate() (*x509.Certificate,error) { return nil,nil }

func newTestContext(stub *shimtest.MockStub, id, msp string) *contractapi.TransactionContext {
 ctx:=new(contractapi.TransactionContext)
 ctx.SetStub(stub)
 ctx.SetClientIdentity(testIdentity{id:id,msp:msp})
 return ctx
}

func TestRegistryStoresMetadataAndRejectsDuplicate(t *testing.T) {
 stub:=shimtest.NewMockStub("healthchain",nil)
 ctx:=newTestContext(stub,"provider","Org1MSP")
 record:=RecordMeta{RecordId:"r1",PatientPseudoId:"patient1",OwnerOrgId:"Org1MSP",RecordType:"DiagnosticReport",ContentType:"application/fhir+json",ObjectUri:"s3://synthetic/r1",CipherHash:"abc123",CreatedAt:time.Now().UTC().Format(time.RFC3339),Version:1}
 b,_:=json.Marshal(record)
 stub.MockTransactionStart("tx-register")
 if _,err:=new(RegistryContract).RegisterRecord(ctx,string(b));err!=nil{t.Fatalf("register: %v",err)}
 if _,err:=new(RegistryContract).RegisterRecord(ctx,string(b));err==nil{t.Fatal("duplicate accepted")}
 got,err:=new(RegistryContract).GetRecord(ctx,"r1")
 if err!=nil||got==""{t.Fatalf("lookup: %v",err)}
 stub.MockTransactionEnd("tx-register")
 other:=newTestContext(stub,"provider","Org2MSP")
 stub.MockTransactionStart("tx-unauthorized")
 record.RecordId="r2"
 b,_=json.Marshal(record)
 if _,err:=new(RegistryContract).RegisterRecord(other,string(b));err==nil{t.Fatal("unauthorized provider registered record")}
 stub.MockTransactionEnd("tx-unauthorized")
}

func TestConsentCanOnlyBeGrantedAndRevokedByPatient(t *testing.T) {
 stub:=shimtest.NewMockStub("healthchain",nil)
 patient:=newTestContext(stub,"patient-id","Org1MSP")
 attacker:=newTestContext(stub,"other-id","Org2MSP")
 policy:=ConsentPolicy{
  PolicyId:"p1",PatientPseudoId:"patient-id",GranteeOrgId:"Org2MSP",
  RecordTypes:[]string{"DiagnosticReport"},Purpose:[]string{"treatment"},
  ValidFrom:"2025-01-01T00:00:00Z",ValidTo:"2030-01-01T00:00:00Z",
 }
 data,_:=json.Marshal(policy)
 stub.MockTransactionStart("tx-consent")
 if _,err:=new(ConsentContract).GrantConsent(attacker,string(data));err==nil{t.Fatal("unauthorized consent grant accepted")}
 if _,err:=new(ConsentContract).GrantConsent(patient,string(data));err!=nil{t.Fatalf("grant: %v",err)}
 if _,err:=new(ConsentContract).RevokeConsent(attacker,"p1");err==nil{t.Fatal("unauthorized revocation accepted")}
 if _,err:=new(ConsentContract).RevokeConsent(patient,"p1");err!=nil{t.Fatalf("revoke: %v",err)}
 stored,err:=new(ConsentContract).GetConsent(patient,"p1")
 if err!=nil{t.Fatal(err)}
 var actual ConsentPolicy
 if err:=json.Unmarshal([]byte(stored),&actual);err!=nil{t.Fatal(err)}
 if actual.Status!="REVOKED"{t.Fatalf("expected revoked, got %s",actual.Status)}
 stub.MockTransactionEnd("tx-consent")
}

func TestAuditEntriesAreAppendOnly(t *testing.T) {
 stub:=shimtest.NewMockStub("healthchain",nil)
 ctx:=newTestContext(stub,"consumer","Org2MSP")
 evt:=AccessEvent{EventId:"a1",RecordId:"r1",PatientPseudoId:"patient-id",RequesterOrgId:"Org2MSP",Purpose:"treatment",Outcome:"ALLOW",At:time.Now().UTC().Format(time.RFC3339)}
 b,_:=json.Marshal(evt)
 stub.MockTransactionStart("tx-audit")
 if _,err:=new(AuditContract).LogAccess(ctx,string(b));err!=nil{t.Fatalf("log: %v",err)}
 if _,err:=new(AuditContract).LogAccess(ctx,string(b));err==nil{t.Fatal("audit overwrite accepted")}
 stub.MockTransactionEnd("tx-audit")
}
