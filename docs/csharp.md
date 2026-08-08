# C#

The C# library provides helpers for testing the predicted resources, outputs, and diagnostics of a Bicep deployment without deploying to Azure.

## Requirements

- .NET 8 or later
- A `.bicepparam` entry point for the Bicep deployment under test

## Installation

The package has not yet been published to NuGet. Until it is released, reference `packages/dotnet/src/BicepTest/BicepTest.csproj` from a local checkout.

## Usage

Create and dispose a tester within the test lifetime:

```csharp
await using var tester = await BicepTester.CreateAsync("0.43.1");
var snapshot = await tester.SnapshotAsync(
	"infra/main.bicepparam",
	subscriptionId: "00000000-0000-0000-0000-000000000000",
	resourceGroup: "my-resource-group",
	location: "eastus",
	deploymentName: "my-deployment");

var storageAccounts = snapshot.PredictedResources
	.Where(resource => resource.Type == "Microsoft.Storage/storageAccounts");

foreach (var storageAccount in storageAccounts)
{
	Assert.IsFalse(
		storageAccount.Properties.GetProperty("allowBlobPublicAccess").GetBoolean());
}
```

`BicepTester.CreateAsync` downloads and reuses the requested Bicep CLI version. Snapshot tests do not require Azure credentials or an Azure subscription.

## Snapshot result

A snapshot contains:

- `PredictedResources`: resources and resolved properties predicted for the deployment
- `Outputs`: resolved deployment outputs
- `Diagnostics`: compilation warnings and errors

## Sample

See the runnable [MSTest sample](../samples/dotnet/SnapshotTests.cs) for a complete consumer test using the shared example infrastructure.

## Public API

The complete exported C# API is available in [`api/dotnet/PublicAPI.Unshipped.txt`](../api/dotnet/PublicAPI.Unshipped.txt).