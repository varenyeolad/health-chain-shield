package main

import "testing"

func TestContains(t *testing.T) {
 if !contains([]string{"DiagnosticReport","ImagingStudy"},"ImagingStudy") {t.Fatal("expected included type")}
 if contains([]string{"DiagnosticReport"},"MedicationRequest") {t.Fatal("unexpected type")}
}
func TestLedgerKeyPrefixes(t *testing.T) {
 if recordKey("r1")!="record:r1"{t.Fatal("incorrect registry prefix")}
 if consentKey("p1")!="consent:p1"{t.Fatal("incorrect consent prefix")}
}
