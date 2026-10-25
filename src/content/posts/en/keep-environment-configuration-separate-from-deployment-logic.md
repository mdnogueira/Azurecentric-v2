---
title: "Keep environment configuration separate from deployment logic"
description: "Apply the configuration set pattern in Bicep to decouple environment-specific settings from resource definitions."
pubDate: 2024-07-03
category: automation
tags: ["bicep", "configuration-set-pattern", "infrastructure-as-code", "azure-resource-manager", "best-practices"]
translationKey: keep-environment-configuration-separate-from-deployment-logic
draft: false
---

You are writing a Bicep file to deploy an App Service plan and a storage account. You need to support both non-production and production environments. The obvious approach is to add parameters for every property: SKU, capacity, replication type, and so on. This works, but it quickly becomes unwieldy. Users must understand the impact of every individual setting, and the risk of selecting an invalid combination increases as the template grows.

The configuration set pattern offers a cleaner alternative. Instead of exposing every configuration detail, you accept a single parameter that indicates the environment type. A variable then maps that type to a predefined set of values. This keeps the deployment logic decoupled from the environment-specific configuration.

## Define the environment parameter

Start by defining a parameter that restricts the user to known environment types. Using the `@allowed` decorator ensures that the deployment fails early if an unexpected value is provided.

```bicep
@allowed([
  'non-production'
  'production'
])
param environmentType string
```

This parameter acts as the switch for your configuration map. It does not dictate how resources are created; it only selects which configuration to apply.

## Create the configuration map

Next, define a variable that acts as a map. This variable contains objects named after the allowed environment types. Each object holds the specific configuration values for that environment.

```bicep
var configurations = {
  'non-production': {
    appServiceSku: 'S2'
    appServiceCapacity: 1
    storageSku: 'Standard_LRS'
  }
  'production': {
    appServiceSku: 'P2V3'
    appServiceCapacity: 3
    storageSku: 'Standard_ZRS'
  }
}
```

You can group properties by resource or by environment. Grouping by environment keeps all the settings for a specific context together, which can be easier to read when reviewing the differences between environments.

## Apply the configuration to resources

When you define your resources, reference the configuration map using the environment parameter. This approach keeps the resource definitions clean and focused on the structure of the resource, not the specific values.

```bicep
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: 'my-app-service-plan'
  location: resourceGroup().location
  sku: {
    name: configurations[environmentType].appServiceSku
    capacity: configurations[environmentType].appServiceCapacity
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: 'mystorageaccount'
  location: resourceGroup().location
  sku: {
    name: configurations[environmentType].storageSku
  }
  kind: 'StorageV2'
}
```

This code is an illustrative example. It demonstrates how the configuration map is accessed. In a real deployment, you would need to ensure that the resource names are unique and that the SKU values are valid for the selected region.

## Considerations

The configuration set pattern is useful when you have a small number of distinct environment profiles. If you have many environments with subtle differences, this pattern might become hard to maintain. In that case, you might prefer to use individual parameters or a shared variable file.

You can also combine this pattern with resource conditions. This allows you to deploy certain resources only for specific environments. For example, you might deploy a monitoring resource only in production.

```bicep
resource monitoringResource 'Microsoft.Insights/components@2020-02-02' = if (environmentType == 'production') {
  name: 'my-monitoring-resource'
  location: resourceGroup().location
  kind: 'web'
}
```

This conditional deployment is a powerful way to keep non-production environments lean. It ensures that you only pay for resources that are necessary for the specific environment.

## Verification

To verify that your configuration set pattern is working correctly, deploy the template to both non-production and production environments. Check the resulting resources to ensure that the correct SKUs and capacities were applied.

You can also test the `@allowed` decorator by providing an invalid environment type. The deployment should fail during validation, preventing you from accidentally deploying an unsupported configuration.

This pattern helps you keep your Bicep files clean and maintainable. By separating environment configuration from deployment logic, you make it easier to manage changes and reduce the risk of errors.

### Prerequisites

* Azure CLI or PowerShell installed.
* Permission to create resource groups and the specified resources.
* A Bicep file with the configuration set pattern implemented.

### Steps

1. Create a resource group for the non-production environment.
2. Deploy the Bicep file with `environmentType` set to `non-production`.
3. Verify the resources in the non-production resource group.
4. Create a resource group for the production environment.
5. Deploy the Bicep file with `environmentType` set to `production`.
6. Verify the resources in the production resource group.

### Cleanup

Delete the resource groups to avoid incurring further costs.

[Configuration set pattern](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/patterns-configuration-set)
[Parameters in Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/parameters)
[Best practices for Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices)
