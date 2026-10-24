---
title: "Choose a state boundary for Azure Terraform deployments"
description: "How to scope Bicep modules to different management boundaries and resolve cross-scope dependencies."
pubDate: 2024-08-28
category: automation
tags: []
translationKey: choose-a-state-boundary-for-azure-terraform-deployments
draft: true
---

You are writing a Bicep file to deploy a storage account, but the resource group already exists in a different subscription, or perhaps in a separate management group. The default behaviour of a Bicep file is to deploy everything at the scope defined by `targetScope`. If you try to deploy a resource to a scope that differs from the file's target scope without explicit configuration, the deployment fails. The solution is to use the `scope` property on the module or resource definition.

This distinction matters because many teams separate identity, policy, and resource grouping. A central team might manage the management group hierarchy, while application teams own the resource groups within those groups. If your main Bicep file is scoped to a subscription, you cannot directly create a resource group in a different subscription unless you use a module with an explicit scope.

## Define the boundary with `targetScope`

Every Bicep file has a target scope. If you do not declare it, the file defaults to `resourceGroup`. This means all resources in that file are deployed to the resource group you specify when running the deployment command. If you need to deploy resources at the subscription, management group, or tenant level, you must declare `targetScope` at the top of the file.

```bicep
targetScope = 'subscription'
```

This declaration tells the Bicep compiler that the resources in this file, and any modules without an explicit `scope` property, should be deployed at the subscription level. You can set `targetScope` to `resourceGroup`, `subscription`, or `managementGroup`.

## Use modules to cross boundaries

When you need to deploy resources to a scope different from the main file's `targetScope`, you use a module. A module is a separate Bicep file that encapsulates a set of resources. By adding the `scope` property to the module definition, you can deploy that module to a different boundary.

For example, suppose your main file is scoped to a subscription, but you want to deploy a storage account into a specific resource group. You can define a module for the storage account and set its scope to the resource group.

```bicep
// Main file scoped to subscription
targetScope = 'subscription'

param namePrefix string

// Reference an existing resource group
resource demoRG 'Microsoft.Resources/resourceGroups@2024-03-01' existing = {
  name: 'demogroup1'
}

// Deploy storage account module to the resource group scope
module stgModule '../storageAccount.bicep' = {
  name: 'storageDeploy'
  scope: demoRG
  params: {
    storagePrefix: namePrefix
    location: demoRG.location
  }
}
```

In this example, `stgModule` is deployed to the `demoRG` resource group, even though the main file is deployed to the subscription. The `scope` property accepts a scope object, which can be a resource, subscription, management group, or tenant object.

## Reference existing resources across scopes

Sometimes you need to reference a resource that already exists in a different scope. You can use the `existing` keyword to declare a resource that is not deployed by the current Bicep file. This allows you to access its properties, such as its ID or location, without deploying it.

```bicep
resource existingRG 'Microsoft.Resources/resourceGroups@2024-03-01' existing = {
  name: 'existing-rg'
  scope: subscription('subscription-id')
}
```

Here, `existingRG` is declared as an existing resource in a specific subscription. You can then use `existingRG.id` or `existingRG.location` in your module parameters or other resource definitions.

## Publish and share modules

Once you have defined your modules, you might want to share them with your team. You can publish Bicep modules to a private registry hosted on Azure Container Registry (ACR). This allows you to version your modules and control access.

To publish a module, you use the `az bicep publish` command. You need to have the Bicep CLI version 0.4.1008 or later, and Azure CLI version 2.31.0 or later.

```bash
az bicep publish --file storageAccount.bicep --target br:exampleregistry.azurecr.io/bicep/modules/storage:v1 --documentationUri https://www.contoso.com/exampleregistry.html
```

This command compiles the Bicep file into an ARM template and publishes it to the specified ACR repository. You can then reference this module in other Bicep files using the `br` scheme.

```bicep
module stgModule 'br:exampleregistry.azurecr.io/bicep/modules/storage:v1' = {
  name: 'storageDeploy'
  scope: resourceGroup('demogroup1')
  params: {
    storagePrefix: 'examplestg1'
  }
}
```

## Verify the deployment

After writing your Bicep file, you can validate it using the `az bicep lint` command. This checks for syntax errors and ensures that the file compiles correctly.

```bash
az bicep lint --file main.bicep
```

Once validated, you can deploy the file using `az deployment`. Make sure to specify the correct scope for the deployment command. If your main file is scoped to a subscription, you use the `--subscription` flag. If you are deploying a module to a resource group, you still use the subscription-level deployment command, but the module's `scope` property handles the resource group boundary.

```bash
az deployment sub create --location eastus --template-file main.bicep --name my-deployment
```

This approach allows you to manage complex deployments across multiple boundaries while keeping your code modular and reusable. By explicitly defining scopes, you avoid common pitfalls and ensure that your resources are deployed to the correct locations.

For more details on Bicep best practices, see the [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices) documentation. For information on Bicep modules, refer to the [Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules) guide. To set up a private registry, follow the [Create private registry for Bicep module](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/private-module-registry) instructions.

tags: [bicep, azure-resource-manager, modules, deployment, infrastructure-as-code]
diagram: {title:
