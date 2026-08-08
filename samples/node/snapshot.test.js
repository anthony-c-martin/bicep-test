const path = require('node:path');
const { BicepTester } = require('bicep-test');

describe('Bicep infrastructure', () => {
  let tester;
  let snapshot;

  beforeAll(async () => {
    tester = await BicepTester.create('0.43.1');
    snapshot = await tester.snapshot(
      path.resolve(__dirname, '../infra/main.bicepparam'),
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000000',
      'sample-rg',
      'eastus',
      'sample-deployment',
    );
  }, 60_000);

  afterAll(() => tester.dispose());

  test('predicts the expected resources without diagnostics', () => {
    expect(snapshot.diagnostics).toHaveLength(0);
    expect(snapshot.predictedResources).toHaveLength(3);
    expect(snapshot.predictedResources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'Microsoft.Storage/storageAccounts', name: 'sampleprimary' }),
        expect.objectContaining({ type: 'Microsoft.Storage/storageAccounts', name: 'samplebackup' }),
        expect.objectContaining({ type: 'Microsoft.KeyVault/vaults', name: 'samplekv' }),
      ]),
    );
  });
});