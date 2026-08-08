using Bicep.RpcClient;
using Bicep.RpcClient.Models;
using System.Text.Json;

namespace BicepTest;

public sealed class BicepTester : IDisposable, IAsyncDisposable
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly IBicepClient client;

    private BicepTester(IBicepClient client)
    {
        this.client = client;
    }

    public static async Task<BicepTester> CreateAsync(
        string bicepVersion,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(bicepVersion);

        var factory = new BicepClientFactory();
        var client = await factory.Initialize(
            BicepClientConfiguration.Default with { BicepVersion = bicepVersion },
            cancellationToken);
        return new BicepTester(client);
    }

    public async Task<SnapshotResult> SnapshotAsync(
        string filePath,
        string? tenantId = null,
        string? subscriptionId = null,
        string? resourceGroup = null,
        string? location = null,
        string? deploymentName = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(filePath);

        var response = await client.GetSnapshot(
            new GetSnapshotRequest(
                Path.GetFullPath(filePath),
                new GetSnapshotRequest.MetadataDefinition(
                    tenantId,
                    subscriptionId,
                    resourceGroup,
                    location,
                    deploymentName),
                ExternalInputs: null),
            cancellationToken);

        return JsonSerializer.Deserialize<SnapshotResult>(response.Snapshot, SerializerOptions)
            ?? throw new InvalidDataException("The Bicep snapshot response could not be deserialized.");
    }

    public void Dispose() => client.Dispose();

    public ValueTask DisposeAsync()
    {
        Dispose();
        return ValueTask.CompletedTask;
    }
}