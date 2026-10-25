---
title: "Build a small Azure deployment with Bicep modules"
description: "Separate a Bicep entry point from a reusable storage module, pass parameters explicitly, and review a resource-group deployment before running it."
pubDate: 2024-01-22
category: automation
tags: [bicep, infrastructure-as-code, modules, azure-resource-manager]
translationKey: build-a-small-azure-deployment-with-bicep-modules
draft: false
---

A Bicep module gives a group of resources an explicit interface. The calling file supplies parameters, and the module returns only the outputs the caller needs. That makes a useful boundary even in a small deployment.

We can demonstrate it with one storage account. Keep the entry point responsible for choosing the deployment inputs, and put the account's configuration in a local module. There is no need to introduce a registry before the file boundary is understandable. Microsoft's [module guidance](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules) explains the syntax and deployment behaviour.

## Give each file one job

Use this illustrative directory structure:

```text
main.bicep
modules/
  storage.bicep
```

Both files below target a resource group. The example has not been deployed to an Azure subscription. It creates an account whose public data access is disabled; it does not create a private endpoint or provide an application with a data connection.

The complete `modules/storage.bicep` file is:

```bicep
targetScope = 'resourceGroup'

@minLength(3)
@maxLength(24)
param storageAccountName string

param location string

resource account 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    publicNetworkAccess: 'Disabled'
  }
}

output storageAccountId string = account.id
```

The resource provider still validates the account name, including its characters and global availability. The length decorators express part of the module's interface; they do not replace the provider's validation.

## Call the module explicitly

The complete `main.bicep` file is:

```bicep
targetScope = 'resourceGroup'

param location string = resourceGroup().location
param storageAccountName string = 'azc${uniqueString(resourceGroup().id)}'

module storage './modules/storage.bicep' = {
  name: 'storage-account'
  params: {
    storageAccountName: storageAccountName
    location: location
  }
}

output storageAccountId string = storage.outputs.storageAccountId
```

The path identifies the local module. The symbolic name `storage` is how the caller references it in Bicep, while the `name` property identifies the nested deployment. The parameters in the call must match the module's declared parameters.

The output returns a resource ID, which is useful for another part of a deployment. It does not return an account key or another secret. Keep sensitive values out of ordinary deployment outputs and history.

The deterministic name suffix is convenient for a lab, but it is not an account-name reservation. Check naming requirements and availability in the intended environment.

## Keep the scope consistent

A resource-group deployment uses an existing resource group. This example does not create one from inside the module. Creating resource groups belongs to a subscription-scope deployment, which introduces a different entry point and permission requirement.

That distinction is worth keeping visible when copying examples. Adding a resource-group resource to a file does not silently change that file's deployment scope.

Before using the example, create a dedicated lab resource group through your normal process. Confirm that the deployment identity has the required deployment and resource permissions. Being able to read the group does not establish permission to create its resources.

## Review before deploying

With Azure CLI and Bicep available, build the entry point locally:

```bash
az bicep build --file main.bicep
```

A successful build checks the Bicep structure and generates an ARM template. It does not prove that a subscription has sufficient permissions, that a name is available or that the resulting storage connectivity meets an application's requirements.

For an existing lab group named `rg-azc-bicep-lab`, the following commands are illustrative and have not been run against Azure:

```bash
az deployment group what-if \
  --resource-group rg-azc-bicep-lab \
  --template-file main.bicep

az deployment group create \
  --resource-group rg-azc-bicep-lab \
  --template-file main.bicep
```

Review the what-if result before creating resources. Afterwards, inspect the deployment, its output and the account settings. If this was a disposable exercise, remove its dedicated resources after checking that the group contains nothing the team needs to retain.
