package sample_test

import (
	"context"
	"path/filepath"
	"testing"

	biceptest "github.com/anthony-c-martin/bicep-test/packages/go"
)

func TestInfrastructureHasExpectedResourcesAndNoDiagnostics(t *testing.T) {
	tester, err := biceptest.New(context.Background(), "0.43.1")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := tester.Close(); err != nil {
			t.Errorf("close tester: %v", err)
		}
	})

	parametersPath, err := filepath.Abs(filepath.Join("..", "infra", "main.bicepparam"))
	if err != nil {
		t.Fatal(err)
	}
	snapshot, err := tester.Snapshot(context.Background(), parametersPath, biceptest.SnapshotMetadata{
		TenantID:       "00000000-0000-0000-0000-000000000000",
		SubscriptionID: "00000000-0000-0000-0000-000000000000",
		ResourceGroup:  "sample-rg",
		Location:       "eastus",
		DeploymentName: "sample-deployment",
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(snapshot.Diagnostics) != 0 {
		t.Errorf("got %d diagnostics, want none", len(snapshot.Diagnostics))
	}
	if len(snapshot.PredictedResources) != 3 {
		t.Fatalf("got %d resources, want 3", len(snapshot.PredictedResources))
	}

	wantResources := map[string]string{
		"sampleprimary": "Microsoft.Storage/storageAccounts",
		"samplebackup":  "Microsoft.Storage/storageAccounts",
		"samplekv":      "Microsoft.KeyVault/vaults",
	}
	for _, resource := range snapshot.PredictedResources {
		if wantType, ok := wantResources[resource.Name]; !ok || resource.Type != wantType {
			t.Errorf("unexpected resource %q of type %q", resource.Name, resource.Type)
		}
	}
}
