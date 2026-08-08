package com.github.anthonycmartin.biceptest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Objects;

/** Installs and invokes a pinned Bicep CLI for infrastructure tests. */
public final class BicepTester implements AutoCloseable {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final RpcClient client;

    private BicepTester(RpcClient client) {
        this.client = client;
    }

    /** Installs a Bicep CLI version if needed and starts its RPC client. */
    public static BicepTester create(String bicepVersion) throws IOException {
        if (bicepVersion == null || bicepVersion.isBlank()) {
            throw new IllegalArgumentException("bicepVersion must not be empty");
        }
        RpcClient client = new RpcClient(BicepInstaller.install(bicepVersion));
        String version = client.call("bicep/version", MAPPER.createObjectNode()).get("version").asText();
        if (compareVersions(version, "0.36.1") < 0) {
            client.close();
            throw new IOException("Bicep CLI 0.36.1 or later is required; detected " + version);
        }
        return new BicepTester(client);
    }

    /** Evaluates a Bicep parameters file without deploying it. */
    public SnapshotResult snapshot(Path filePath, SnapshotMetadata metadata) throws IOException {
        Objects.requireNonNull(filePath, "filePath");
        ObjectNode request = MAPPER.createObjectNode();
        request.put("path", filePath.toAbsolutePath().normalize().toString());
        request.set("metadata", MAPPER.valueToTree(metadata == null ? SnapshotMetadata.builder().build().toRpcMap() : metadata.toRpcMap()));
        JsonNode response = client.call("bicep/getSnapshot", request);
        return MAPPER.readValue(response.get("snapshot").asText(), SnapshotResult.class);
    }

    @Override
    public void close() {
        client.close();
    }

    private static int compareVersions(String first, String second) {
        String[] firstParts = first.split("\\.");
        String[] secondParts = second.split("\\.");
        for (int index = 0; index < Math.max(firstParts.length, secondParts.length); index++) {
            int firstPart = index < firstParts.length ? numericPrefix(firstParts[index]) : 0;
            int secondPart = index < secondParts.length ? numericPrefix(secondParts[index]) : 0;
            if (firstPart != secondPart) {
                return Integer.compare(firstPart, secondPart);
            }
        }
        return 0;
    }

    private static int numericPrefix(String value) {
        int end = 0;
        while (end < value.length() && Character.isDigit(value.charAt(end))) {
            end++;
        }
        return end == 0 ? 0 : Integer.parseInt(value.substring(0, end));
    }
}