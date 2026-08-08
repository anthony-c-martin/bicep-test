package rpcclient

// SnapshotMetadata describes the Azure deployment context used to evaluate a snapshot.
type SnapshotMetadata struct {
	TenantID       string `json:"tenantId,omitempty"`
	SubscriptionID string `json:"subscriptionId,omitempty"`
	ResourceGroup  string `json:"resourceGroup,omitempty"`
	Location       string `json:"location,omitempty"`
	DeploymentName string `json:"deploymentName,omitempty"`
}

// GetSnapshotRequest contains the path and deployment context for a Bicep snapshot.
type GetSnapshotRequest struct {
	Path           string                  `json:"path"`
	Metadata       SnapshotMetadata        `json:"metadata"`
	ExternalInputs []SnapshotExternalInput `json:"externalInputs,omitempty"`
}

// SnapshotExternalInput supplies a value for a Bicep external input.
type SnapshotExternalInput struct {
	Kind   string `json:"kind"`
	Config any    `json:"config,omitempty"`
	Value  any    `json:"value"`
}

// GetSnapshotResponse contains the serialized deployment snapshot.
type GetSnapshotResponse struct {
	Snapshot string `json:"snapshot"`
}
