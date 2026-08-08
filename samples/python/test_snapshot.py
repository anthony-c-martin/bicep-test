from pathlib import Path

from bicep_test import BicepTester, SnapshotMetadata


def test_infrastructure_snapshot() -> None:
    parameters = Path(__file__).parents[1] / "infra" / "main.bicepparam"
    metadata = SnapshotMetadata(
        tenant_id="00000000-0000-0000-0000-000000000000",
        subscription_id="00000000-0000-0000-0000-000000000000",
        resource_group="sample-rg",
        location="eastus",
        deployment_name="sample-deployment",
    )

    with BicepTester.create("0.43.1") as tester:
        snapshot = tester.snapshot(parameters, metadata)

    assert snapshot.diagnostics == ()
    assert {resource.name for resource in snapshot.predicted_resources} == {
        "sampleprimary",
        "samplebackup",
        "samplekv",
    }