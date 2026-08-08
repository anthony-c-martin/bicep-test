# Samples

Each sample tests the same Bicep deployment through the target language's standard testing workflow:

- [Node](node/snapshot.test.js) uses Jest.
- [C#](dotnet/SnapshotTests.cs) uses MSTest.
- [Go](go/snapshot_test.go) uses the standard `testing` package.
- [PowerShell](powershell/BicepTest.Sample.Tests.ps1) uses Pester.
- [Python](python/test_snapshot.py) uses pytest.
- [Java](java/src/test/java/com/github/anthonycmartin/samples/SnapshotTest.java) uses JUnit 5.

The samples share [`infra/main.bicepparam`](infra/main.bicepparam) and verify that the snapshot predicts the expected resources without deploying to Azure.

Run every sample from the repository root:

```powershell
./scripts/ValidateSamples.ps1
```

The validator restores and builds each local library, then invokes Jest, MSTest, `go test`, Pester, pytest, and JUnit. It exits with a nonzero status if any sample cannot compile or does not pass.