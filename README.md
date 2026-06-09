# bicep-test

A POC test library for asserting on [Bicep](https://github.com/Azure/bicep) templates without deploying to Azure.

## Overview

`bicep-test` provides a Jest-based testing workflow for Bicep infrastructure code. It uses the [@azure/bicep-rpc-client](https://github.com/Azure/bicep-deploy) library to invoke the Bicep CLI locally and capture a **snapshot** of what a deployment _would_ produce — the predicted resources, outputs, and diagnostics — so you can write fast, offline assertions against your templates.

## How it works

1. `BicepTester.create(version)` downloads and initialises the Bicep CLI (cached to `~/.bicep/bin`).
2. `tester.snapshot(filePath, ...)` compiles a `.bicepparam` file and returns a `SnapshotResult` containing:
   - `predictedResources` — every resource the template would deploy, with all properties resolved.
   - `outputs` — the resolved output values.
   - `diagnostics` — any warnings or errors emitted during compilation.
3. Write standard Jest `expect` assertions against the snapshot.

No Azure subscription or credentials are required for snapshot tests.

## Installation

```sh
npm install --save-dev bicep-test
```

## Usage

```ts
import * as path from 'path';
import { BicepTester, SnapshotResult } from 'bicep-test';

let tester: BicepTester;
let snapshot: SnapshotResult;

beforeAll(async () => {
  tester = await BicepTester.create('0.43.1');
  snapshot = await tester.snapshot(
    path.join(__dirname, 'infra/main.bicepparam'),
    '00000000-0000-0000-0000-000000000000', // tenantId
    '00000000-0000-0000-0000-000000000000', // subscriptionId
    'my-resource-group',
    'eastus',
    'my-deployment',
  );
}, 60000);

afterAll(() => tester?.dispose());

describe('my infrastructure', () => {
  // No compilation errors
  it('has no diagnostics', () => {
    expect(snapshot.diagnostics).toHaveLength(0);
  });

  // Resource counts
  it('deploys exactly 2 storage accounts', () => {
    expect(
      snapshot.predictedResources.filter(r => r.type === 'Microsoft.Storage/storageAccounts')
    ).toHaveLength(2);
  });

  // Property assertions across all resources of a type
  it('all storage accounts have public blob access disabled', () => {
    snapshot.predictedResources
      .filter(r => r.type === 'Microsoft.Storage/storageAccounts')
      .forEach(r => {
        expect(r.properties?.allowBlobPublicAccess).toBe(false);
      });
  });

  // Location assertions
  it('all resources are deployed to eastus', () => {
    snapshot.predictedResources.forEach(r => {
      expect(r.location?.toLowerCase()).toBe('eastus');
    });
  });

  // Output assertions
  it('exposes a primaryStorageId output', () => {
    expect(snapshot.outputs['primaryStorageId']).toBeDefined();
  });
});
```