---
title: "Import an existing Azure resource into a Terraform workflow"
description: "Reference existing Azure resources in Bicep without taking ownership, distinguishing compile-time imports from deployment-time references."
pubDate: 2025-08-02
category: automation
tags: ["bicep", "azure-resource-manager", "existing-resources", "infrastructure-as-code", "azure"]
translationKey: import-an-existing-azure-resource-into-a-terraform-workflow
draft: true
---

You have an Azure resource that was created outside of your current Bicep file, perhaps by Terraform or a previous deployment, but your new template needs to read its properties. You do not need to import the entire resource definition into your state. You can reference it directly using the `existing` keyword.

This approach is distinct from Bicep's compile-time `import` feature, which brings in types, variables, and functions from other `.bicep` files. The `existing` keyword operates at the Azure Resource Manager (ARM) deployment level, allowing your template to read properties from a resource that already exists in the target scope without attempting to create or modify it.

[![Bicep Existing Resource Reference Flow](/images/posts/2025/azc-207-checkpoints.svg)](/images/posts/2025/azc-207-checkpoints.svg)

## Why use the `existing` keyword?

When you deploy a Bicep file, ARM expects to manage the lifecycle of every resource declared in that file. If you declare a resource without the `existing` keyword, ARM will attempt to create it if it does not exist, or update it if it does. This is not what you want when you are simply reading a value, such as a storage account endpoint or a private endpoint ID, from a resource managed by a different team or a previous deployment.

Using `existing` tells ARM: "This resource is already here. Do not touch it. Just let me read its properties."

## Prerequisites

*   **Bicep CLI**: Ensure you are using a recent version of the Bicep CLI. The `existing` keyword has been supported for several years, but newer language features (like language version 2.0) may be enabled by default in recent releases.
*   **Permissions**: You need `Reader` access to the resource or its scope to read metadata. However, retrieving sensitive properties like keys or secrets often requires specific data plane roles or resource-specific read permissions. For example, reading a storage account key typically requires `Storage Account Key Operator Service Role` or similar, not just generic `Reader` access. Check the specific service documentation for the permissions required to read the properties you need.
*   **Resource ID or Name**: You must know the name of the resource and its scope (resource group, subscription, or management group).

## Referencing a resource in the same scope

If the existing resource is in the same resource group as your current deployment, you only need to provide the resource name. ARM infers the scope from the deployment context.

```bicep
resource stg 'Microsoft.Storage/storageAccounts@2023-04-01' existing = {
  name: 'examplestorage'
}

output blobEndpoint string = stg.properties.primaryEndpoints.blob
```

In this example, `stg` is the symbolic name. You can access any property exposed by the API version specified in the declaration. The deployment will fail with a `NotFound` error if the resource does not exist.

## Referencing a resource in a different scope

If the resource is in a different resource group, subscription, or management group, you must explicitly set the `scope` property. You can use scope functions like `resourceGroup()`, `subscription()`, or `managementGroup()` to define the target.

```bicep
resource stg 'Microsoft.Storage/storageAccounts@2023-04-01' existing = {
  name: 'examplestorage'
  scope: resourceGroup('other-resource-group')
}

output blobEndpoint string = stg.properties.primaryEndpoints.blob
```

This is particularly useful when you are deploying a new resource in one resource group that needs to connect to an existing resource in another. For example, a new App Service plan might need the connection string of a storage account in a shared infrastructure resource group.

## Accessing properties and outputs

Once you have declared the resource with `existing`, you can access its properties just like any other resource in your template. Use the symbolic name followed by `.properties` to access the resource-specific attributes.

It is a best practice to use these properties in outputs or as inputs to other resources, rather than hardcoding values. This ensures that if the existing resource's properties change (e.g., a new endpoint URL), your deployment will always use the current value.

```bicep
param existingStorageName string = 'myexistingstorage'

resource stg 'Microsoft.Storage/storageAccounts@2023-04-01' existing = {
  name: existingStorageName
}

resource newAppService 'Microsoft.Web/sites@2023-01-01' = {
  name: 'myapp'
  location: resourceGroup().location
  properties: {
    siteConfig: {
      connectionStrings: [
        {
          name: 'StorageConnection'
          connectionString: 'DefaultEndpointsProtocol=https;AccountName=${stg.name};AccountKey=${listKeys(stg.id, stg.apiVersion).keys[0].value};EndpointSuffix=core.windows.net'
          type: 'AzureStorage'
        }
      ]
    }
  }
}
```

### Warning on sensitive data

The example above uses `listKeys` to retrieve a storage account key. This function triggers a runtime secret retrieval which can cause deployment failures if permissions are insufficient or if the resource is not yet deployed. It requires specific permissions (e.g., `Contributor` or specific data plane roles) to execute. 

As a best practice, mark sensitive data in outputs by using the `@secure()` decorator, which prevents sensitive outputs from being logged or displayed. Otherwise, output values can be accessed by anyone who has access to the deployment history. If possible, prefer referencing existing resources via `existing` for non-sensitive properties to avoid these permission complexities.

## Troubleshooting

If your deployment fails with a `NotFound` error, check the following:

1.  **Name**: Verify the resource name is correct. It is case-sensitive for some resource types.
2.  **Scope**: Ensure the `scope` property matches the actual location of the resource. If you omit `scope`, ARM looks in the current resource group.
3.  **API Version**: The API version in your `existing` declaration determines which properties are exposed. If the declared API version is too old, the requested property (e.g., `primaryEndpoints`) might not exist in that schema, causing a deployment error. Use a recent API version to ensure property availability.
4.  **Permissions**: Confirm that the deployment identity has read access to the resource and any specific permissions required for the properties you are trying to read.


Reference: [Imports in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-import).
