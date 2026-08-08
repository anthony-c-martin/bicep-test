from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True, slots=True)
class SnapshotMetadata:
    """Azure deployment context used to evaluate a snapshot."""

    tenant_id: str | None = None
    subscription_id: str | None = None
    resource_group: str | None = None
    location: str | None = None
    deployment_name: str | None = None

    def _as_rpc_dict(self) -> dict[str, str]:
        values = {
            "tenantId": self.tenant_id,
            "subscriptionId": self.subscription_id,
            "resourceGroup": self.resource_group,
            "location": self.location,
            "deploymentName": self.deployment_name,
        }
        return {name: value for name, value in values.items() if value is not None}


@dataclass(frozen=True, slots=True)
class SnapshotResource:
    """A resource predicted by a Bicep snapshot."""

    id: str
    type: str
    name: str
    api_version: str
    location: str | None = None
    properties: dict[str, Any] = field(default_factory=dict)
    additional_properties: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def _from_dict(cls, value: dict[str, Any]) -> SnapshotResource:
        known = {"id", "type", "name", "apiVersion", "location", "properties"}
        return cls(
            id=value["id"],
            type=value["type"],
            name=value["name"],
            api_version=value["apiVersion"],
            location=value.get("location"),
            properties=value.get("properties", {}),
            additional_properties={key: item for key, item in value.items() if key not in known},
        )


@dataclass(frozen=True, slots=True)
class SnapshotResult:
    """The predicted result of evaluating a Bicep parameters file."""

    predicted_resources: tuple[SnapshotResource, ...]
    diagnostics: tuple[str, ...]
    outputs: dict[str, Any]

    @classmethod
    def _from_dict(cls, value: dict[str, Any]) -> SnapshotResult:
        return cls(
            predicted_resources=tuple(
                SnapshotResource._from_dict(resource)
                for resource in value.get("predictedResources", [])
            ),
            diagnostics=tuple(value.get("diagnostics", [])),
            outputs=value.get("outputs", {}),
        )