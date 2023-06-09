@maxLength(20)
@minLength(4)
@description('Used to generate names for all resources in this file')
param resourceBaseName string

param webAppSku string

param serverfarmsName string = resourceBaseName
param webAppName string = resourceBaseName
param storageName string = resourceBaseName
param tableName string = 'RubberDuckDev'
param location string = resourceGroup().location

// Compute resources for your Web App
resource serverfarm 'Microsoft.Web/serverfarms@2021-02-01' = {
  kind: 'app'
  location: location
  name: serverfarmsName
  sku: {
    name: webAppSku
  }
}

// Azure Web App that hosts your website
resource webApp 'Microsoft.Web/sites@2021-02-01' = {
  kind: 'app'
  location: location
  name: webAppName
  properties: {
    serverFarmId: serverfarm.id
    httpsOnly: true
    siteConfig: {
      appSettings: [
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1' // Run Azure APP Service from a package file
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18' // Set NodeJS version to 18.x for your site
        }
        {
          name: 'RUNNING_ON_AZURE'
          value: '1'
        }
        {
          name: 'TABLE_STORAGE'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${accountKey};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          name: 'TABLE_NAME'
          value: tableName
        }
      ]
      ftpsState: 'FtpsOnly'
    }
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2021-02-01' = {
  name: storageName
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
  }
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2021-02-01' = {
  name: 'default'
  parent: storageAccount
}

resource table 'Microsoft.Storage/storageAccounts/tableServices/tables@2021-02-01' = {
  name: tableName
  parent: tableService
}

var accountKey = storageAccount.listKeys().keys[0].value

// The output will be persisted in .env.{envName}. Visit https://aka.ms/teamsfx-actions/arm-deploy for more details.
output TAB_AZURE_APP_SERVICE_RESOURCE_ID string = webApp.id // used in deploy stage
output TAB_DOMAIN string = webApp.properties.defaultHostName
output TAB_ENDPOINT string = 'https://${webApp.properties.defaultHostName}'
