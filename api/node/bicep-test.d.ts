import { Bicep } from '@azure/bicep-rpc-client';
import { TokenCredential } from '@azure/core-auth';
export declare class BicepTester {
    private bicep;
    constructor(bicep: Bicep);
    static create(bicepVersion: string): Promise<BicepTester>;
    snapshot(filePath: string, tenantId?: string, subscriptionId?: string, resourceGroup?: string, location?: string, deploymentName?: string): Promise<SnapshotResult>;
    deploy(credential: TokenCredential, subscriptionId: string, resourceGroup: string, stackName: string): Promise<void>;
    dispose(): void;
}
export declare class DeployResult {
    private credential;
    private subscriptionId;
    private resourceGroup;
    private stackName;
    constructor(credential: TokenCredential, subscriptionId: string, resourceGroup: string, stackName: string);
    teardown(): Promise<void>;
}
export type SnapshotResource = {
    id: string;
    type: string;
    name: string;
    apiVersion: string;
    location?: string;
    [key: string]: any;
};
export type SnapshotResult = {
    predictedResources: SnapshotResource[];
    diagnostics: string[];
    outputs: Record<string, unknown>;
};