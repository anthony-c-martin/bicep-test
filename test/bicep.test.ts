import * as path from 'path';
import { SnapshotHelper } from "../src";

let snapshotHelper: SnapshotHelper;
async function onBeforeAll() {
  snapshotHelper = await SnapshotHelper.create('0.43.1');
}

function onAfterAll() {
  snapshotHelper?.dispose();
}

beforeAll(onBeforeAll, 60000);
afterAll(onAfterAll);

describe("Snapshot helper", () => {
  it('can return the Bicep CLI download URL', async () => {

    const bicepPath = path.join(__dirname, "samples/bicepparam/main.bicepparam");

    const snapshot = await snapshotHelper.capture(
      bicepPath,
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000000',
      'test-rg',
      'eastus',
      'test-deployment');

      snapshot.getResources();
  }, 60000);
});