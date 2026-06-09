import { Bicep } from '@azure/bicep-rpc-client';
import { mkdir } from 'fs/promises';
import os from 'os';
import path from 'path';
import { TokenCredential } from '@azure/core-auth';
import { DeploymentStacksClient } from '@azure/arm-resourcesdeploymentstacks';

export class BicepTester {
  constructor(private bicep: Bicep) {}

  public static async create(bicepVersion: string) {
    const basePath = path.join(os.homedir(), '.bicep', 'bin', `v${bicepVersion}`);
    await mkdir(basePath, { recursive: true });
    const bicepPath = await Bicep.install(basePath, bicepVersion);
    const bicep = await Bicep.initialize(bicepPath);

    return new BicepTester(bicep);
  }

  async snapshot(filePath: string, tenantId?: string, subscriptionId?: string, resourceGroup?: string, location?: string, deploymentName?: string): Promise<SnapshotResult> {
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

    return JSON.parse(response.snapshot);
  }

  async deploy(credential: TokenCredential, subscriptionId: string, resourceGroup: string, stackName: string) {
    const client = new DeploymentStacksClient(credential, subscriptionId);

    await client.deploymentStacks.beginCreateOrUpdateAtResourceGroupAndWait(resourceGroup, stackName, {
      properties: {
        actionOnUnmanage: {
          managementGroups: 'Delete',
          resourceGroups: 'Delete',
          resources: 'Delete',
        },
        denySettings: {
          mode: 'None'
        }
      }
    });
  }

  dispose() {
    this.bicep.dispose();
  }
}

export class DeployResult {
  constructor(
    private credential: TokenCredential,
    private subscriptionId: string, 
    private resourceGroup: string, 
    private stackName: string
  ) {}

  async teardown() {
    const client = new DeploymentStacksClient(this.credential, this.subscriptionId);

    await client.deploymentStacks.beginDeleteAtResourceGroupAndWait(this.resourceGroup, this.stackName);
  }
}

export type SnapshotResource = {
  id: string;
  type: string;
  name: string;
  apiVersion: string;
  location?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type SnapshotResult = {
  predictedResources: SnapshotResource[];
  diagnostics: string[];
  outputs: Record<string, unknown>;
};