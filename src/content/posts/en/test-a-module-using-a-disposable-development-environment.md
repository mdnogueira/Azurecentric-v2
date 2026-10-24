---
title: "Test a module using a disposable development environment"
description: "Test Bicep modules safely using a disposable resource group, matching the module's target scope and cleaning up correctly."
pubDate: 2026-08-14
category: automation
tags: []
translationKey: test-a-module-using-a-disposable-development-environment
draft: false
---

You are writing a Bicep module and need to verify it works before sharing it with the team. The safest way to test is to deploy it into a disposable resource group that you create specifically for that test and delete immediately after. This approach isolates the test from your production or shared development environments and prevents lingering resources from incurring cost or causing naming conflicts.

The core decision here is scope. Your module might target a resource group, a subscription, or even a management group. Your test harness must match that scope. If you deploy a subscription-scoped module into a resource group, the deployment will fail. If you deploy a resource-group-scoped module into a subscription, it will also fail. The first step is to ensure your test deployment command targets the correct scope for the module you are testing.

## Prerequisites

Before you begin, ensure you have the necessary tools installed. You need the Azure CLI and the Bicep CLI. The Bicep CLI must be installed and accessible in your PATH for the deployment command to compile and resolve local module references successfully. If the Bicep CLI is not installed, the `az deployment` commands will fail with a compilation error.

You also need permission to create and delete resource groups in your Azure subscription. Typically, this requires the Contributor role or a custom role with permissions to perform `Microsoft.Resources/subscriptions/resourceGroups/*` operations.

## Create a disposable environment

Start by creating a resource group that exists only for the duration of your test. Use a naming convention that makes it obvious this is a temporary test environment. Include your initials or a ticket number so you can identify it if it persists longer than expected.

```azurecli
az group create --name test-rg-mn-001 --location eastus
```

This command creates the container for your test. It does not yet deploy your module. You now have a clean slate. If your module is subscription-scoped, you would deploy directly to the subscription instead, but resource groups are the most common scope for application modules.

## Deploy the module

Use the `az deployment group create` command to deploy your module into the disposable resource group. You need to provide the path to your Bicep file and any parameters it requires. If your module references other local modules, the Bicep compiler resolves them automatically based on the file path provided to `--template-file`.

```azurecli
az deployment group create \
  --resource-group test-rg-mn-001 \
  --template-file ./my-module.bicep \
  --parameters namePrefix="test" location="eastus"
```

This command compiles the Bicep file, resolves any local module references, and deploys the resulting ARM template to the resource group. If the deployment fails, the error message will tell you exactly which resource or parameter caused the issue. You can fix the Bicep file and run the command again. The disposable resource group ensures that any partially created resources are cleaned up when you delete the group.

## Verify the deployment

After the deployment succeeds, check that the resources were created as expected. You can list the resources in the resource group to see what was deployed.

```azurecli
az group list --query '[].{Name:name, Type:type}' --resource-group test-rg-mn-001 --output table
```

Compare the output with your expectations. Did the storage account get the correct name? Did the network security group have the right rules? If something is missing or incorrect, you need to adjust your Bicep file and redeploy. This iterative process is much safer in a disposable environment than in a shared one.

## Clean up

Once you are satisfied with the test, delete the resource group. This removes all resources scoped to that resource group and ensures no lingering costs or conflicts.

```azurecli
az group delete --name test-rg-mn-001 --yes
```

The `--yes` flag skips the confirmation prompt. This is useful for scripting, but be careful not to run this command in a production environment. Double-check the resource group name before executing. Without `--no-wait`, you will see the deletion progress and any potential errors.

## Handling subscription-scoped modules

If your module is subscription-scoped, you cannot use `az deployment group create`. Instead, use `az deployment sub create`. The process is similar, but you deploy to the subscription level. You still need a way to isolate the test. One approach is to use a dedicated test subscription. Another is to use a management group if your module applies policies or role assignments across the organization.

```azurecli
az deployment sub create \
  --location eastus \
  --template-file ./subscription-module.bicep \
  --parameters tenantId="your-tenant-id"
```

In this case, cleanup involves deleting the resources created at the subscription level. You might need to delete them individually or use a management group deletion if appropriate. Be cautious with subscription-scoped deletions, as they can affect multiple teams. Deleting the resource group used for the test does not remove these subscription-level resources. You must explicitly delete the subscription-scoped resources or the subscription itself if it was created solely for the test.

## Testing with private registries

If your module references other modules from a private registry, you need to ensure your local environment can access the registry. The Bicep CLI uses the Azure CLI credentials by default. Make sure you are logged in with an account that has pull permissions for the registry.

```azurecli
az login
```

If you need to use specific credentials, you can configure the `bicepconfig.json` file. This is useful in CI/CD pipelines where you might use a service principal. For local testing, the default Azure CLI credentials are usually sufficient.

When you deploy a module that references a private registry, the Bicep CLI will automatically restore the module from the registry to your local cache. This ensures that the deployment uses the correct version of the module. If you make changes to the module in the registry, you need to run `az bicep restore` to update your local cache.

## Conditional deployment

Sometimes you only want to deploy certain resources based on a parameter. You can use conditional deployment in your Bicep file to achieve this. For example, you might want to deploy a premium storage account in production but a standard one in test.

```bicep
param environment string = 'test'

resource storageAccount 'Microsoft.Storage/storageAccounts@2025-06-01' = if (environment == 'prod') {
  name: 'prodstorage${uniqueString(resourceGroup().id)}'
  location: resourceGroup().location
  sku: {
    name: 'Premium_LRS'
  }
  kind: 'StorageV2'
} else {
  name: 'teststorage${uniqueString(resourceGroup().id)}'
  location: resourceGroup().location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}
```

This approach allows you to test the same module in different environments without maintaining separate files. You can pass the `environment` parameter during deployment to control the behaviour.

## Next steps

Once you have verified your module in a disposable environment, you can publish it to a private registry or template spec for sharing with your team. Ensure you have the necessary permissions to publish and that the registry is configured correctly. For more information on best practices for Bicep development, refer to the [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices) documentation.

For details on how to define and use modules, including setting scopes and using decorators, see the [Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules) article. If you need to share modules within your organization, consider setting up a [private container registry in Azure for Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/private-module-registry).

### Diagram

{
  "title": "Disposable Test Environment Flow",
  "nodes": [
    "Developer writes Bicep module",
    "Create disposable resource group",
    "Deploy module to resource group",
    "Verify resources created correctly",
    "Delete resource group and clean up"
  ]
},
