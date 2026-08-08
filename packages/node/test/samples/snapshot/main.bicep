@description('The environment prefix, used to name resources.')
param env string

@description('The Azure region for all resources.')
param location string = 'eastus'

resource primaryStorage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${env}primary'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
  }
}

resource backupStorage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${env}backup'
  location: location
  sku: { name: 'Standard_GRS' }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${env}kv'
  location: location
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: tenant().tenantId
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
  }
}

output primaryStorageId string = primaryStorage.id
output keyVaultUri string = keyVault.properties.vaultUri
