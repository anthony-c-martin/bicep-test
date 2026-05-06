import { Bicep } from 'bicep-node';
import { mkdir } from 'fs/promises';
import os from 'os';
import path from 'path';


export class SnapshotHelper {
  constructor(private bicep: Bicep) {}

  public static async create(bicepVersion: string) {
    const basePath = path.join(os.homedir(), '.bicep', 'bin', `v${bicepVersion}`);
    await mkdir(basePath, { recursive: true });
    const bicepPath = await Bicep.install(basePath, bicepVersion);
    const bicep = await Bicep.initialize(bicepPath);

    return new SnapshotHelper(bicep);
  }

  async capture(filePath: string, tenantId?: string, subscriptionId?: string, resourceGroup?: string, location?: string, deploymentName?: string) {
    const response = await this.bicep.getSnapshot({
      path: filePath,
      metadata: {
        tenantId: tenantId,
        location: location,
        subscriptionId: subscriptionId,
        resourceGroup: resourceGroup,
        deploymentName: deploymentName
      }
    });

    return new Snapshot(JSON.parse(response.snapshot));
  }

  dispose() {
    this.bicep.dispose();
  }
}

type SnapshotContent = {
  predictedResources: Record<string, unknown>;
  diagnostics: string[],
  outputs: Record<string, unknown>;
};

export class Snapshot {
  constructor(private content: SnapshotContent) {}

  getResources() {
    return this.content.predictedResources;
  }
}