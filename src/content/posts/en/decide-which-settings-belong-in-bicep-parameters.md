---
title: "Decide which settings belong in Bicep parameters"
description: "Design Bicep inputs around genuine deployment choices, derive related values from a configuration set, and keep fixed security settings explicit."
pubDate: 2024-03-13
category: automation
tags: [bicep, infrastructure-as-code, parameters, azure-resource-manager]
translationKey: decide-which-settings-belong-in-bicep-parameters
draft: false
---

A deployment parameter is a decision you are asking the caller to make. Exposing every resource property creates a large input form, but it does not necessarily create a reusable template. It can make valid combinations harder to identify and leave important policy decisions to each deployment.

Start with the decisions the caller owns. Resource names and an existing dependency may vary independently. An agreed security baseline may not. Related environment choices can sometimes be selected together rather than entered as separate, loosely coordinated values.

## Separate inputs, derived values and invariants

Microsoft's [parameter guidance](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/parameters) describes typed inputs, defaults and decorators. Its [best practices](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices) recommend thinking carefully about which values change between deployments.

Use that distinction to review each proposed input:

| Setting | A useful design question |
|---|---|
| Resource name | Does the caller need to select it to fit an existing naming scheme? |
| Location | Should it default to the resource group's location while remaining an explicit choice? |
| Environment | Does it select a small, maintained configuration agreed by the template owner? |
| Security baseline | Is this a caller choice, or a requirement the resource must retain? |
| Existing resource | Does the caller supply a name or ID for a dependency outside the template? |
| Secret | Can the deployment obtain it securely without storing it in source or ordinary outputs? |

A variable is useful when a value can be derived from those inputs. A fixed property is appropriate when the template deliberately enforces that setting.

## Group related choices when there is a real policy

The [configuration set pattern](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/patterns-configuration-set) uses a small input to select a predefined object of values. That can reduce invalid combinations, provided the map represents an actual maintained configuration.

The following complete resource-group template illustrates the boundary with a storage account. Save it as `main.bicep`:

```bicep
targetScope = 'resourceGroup'

@minLength(3)
@maxLength(24)
@description('Storage account name; provider naming and availability rules also apply.')
param storageAccountName string

param location string = resourceGroup().location

@allowed([
  'development'
  'production'
])
param environment string

var configurations = {
  development: {
    skuName: 'Standard_LRS'
  }
  production: {
    skuName: 'Standard_ZRS'
  }
}

resource account 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  tags: {
    environment: environment
  }
  sku: {
    name: configurations[environment].skuName
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

The two SKU values are illustrative configuration choices, not a universal development and production standard. Check the chosen redundancy option's availability and suitability in the intended region before deployment.

This template creates an account only. It does not create a private endpoint, grant data permissions or establish an application's connection to storage. Public network access is disabled deliberately, so those access requirements need separate design.

## Read the interface before expanding it

The caller supplies a name, a location if the default is unsuitable, and an environment choice. The selected configuration determines the SKU. The HTTPS, TLS and anonymous-access properties stay explicit rather than becoming optional switches.

The length decorators constrain part of the name's shape. They do not establish valid characters or global name availability. Resource-provider validation still applies.

Use `@allowed` where the template owns a genuine finite choice, such as the keys in this map. Avoid copying a long service SKU catalogue into an allowed list unless maintaining that restriction is part of the template's purpose. Otherwise, a service change can make the interface stale.

An environment name also does not prove that the configuration meets production requirements. The map needs an owner, review and deployment evidence.

## Keep secret handling separate from configuration convenience

If a later resource requires a sensitive input, Bicep's `@secure()` decorator is available for string and object parameters. The documented behaviour prevents the secure parameter value from being stored in deployment history.

That does not make a committed parameter file a safe place for a password. Nor does it prevent application code, pipeline commands or ordinary outputs from exposing a value after it has been passed along. Plan secret retrieval and handling across the full deployment path.

The storage example needs no secret input and returns a resource ID rather than an account key.

## Validate the contract before deploying

Build the template locally:

```bash
az bicep build --file main.bicep
```

Compilation checks the Bicep structure and generates an ARM template. It does not verify regional SKU availability, name availability, permissions or application connectivity.

Before using the template in a subscription, review the generated parameters and intended resource changes through the normal deployment process. Exercise the supported environment choices in an appropriate test environment and inspect the resulting settings.

No resources have been deployed for this article. Keep the interface small enough that its choices can be explained, validated and maintained as the template changes.

