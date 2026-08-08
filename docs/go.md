# Go

The Go package provides helpers for testing the predicted resources, outputs, and diagnostics of a Bicep deployment without deploying to Azure.

## Requirements

- Go 1.24 or later
- A `.bicepparam` entry point for the Bicep deployment under test

## Installation

Until a versioned module is released, reference the repository source from a local checkout. After release, install it with:

```sh
go get github.com/anthony-c-martin/bicep-test/packages/go
```

## Usage

Create one tester for the test, capture the snapshot, and close the Bicep process when the test completes:

```go
package infra_test

import (
	"context"
	"testing"

	biceptest "github.com/anthony-c-martin/bicep-test/packages/go"
)

func TestStorageAccountsDisablePublicAccess(t *testing.T) {
	tester, err := biceptest.New(context.Background(), "0.43.1")
	if err != nil {
		t.Fatal(err)
	}
	defer tester.Close()

	snapshot, err := tester.Snapshot(
		context.Background(),
		"infra/main.bicepparam",
		biceptest.SnapshotMetadata{
			SubscriptionID: "00000000-0000-0000-0000-000000000000",
			ResourceGroup:  "my-resource-group",
			Location:       "eastus",
			DeploymentName: "my-deployment",
		},
	)
	if err != nil {
		t.Fatal(err)
	}

	for _, resource := range snapshot.PredictedResources {
		if resource.Type == "Microsoft.Storage/storageAccounts" &&
			resource.Properties["allowBlobPublicAccess"] != false {
			t.Errorf("storage account %q allows public blob access", resource.Name)
		}
	}
}
```

`biceptest.New` downloads the requested Bicep CLI version into `~/.bicep/bin` and reuses it on later runs. Snapshot tests do not require Azure credentials or an Azure subscription.

## Snapshot result

A snapshot contains:

- `PredictedResources`: resources and resolved properties predicted for the deployment
- `Outputs`: resolved deployment outputs
- `Diagnostics`: compilation warnings and errors