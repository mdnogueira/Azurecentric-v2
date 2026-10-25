---
title: "Plan ownership and deletion behaviour for an infrastructure stack"
description: "Plan ownership, scope, and deletion behaviour for Azure deployment stacks using Bicep and RBAC."
pubDate: 2026-03-02
category: automation
tags: ["azure-deployment-stacks", "bicep", "infrastructure-as-code", "azure-rbac", "resource-management"]
translationKey: plan-ownership-and-deletion-behaviour-for-an-infrastructure-stack
draft: false
---

An Azure deployment stack is a resource that manages a group of Azure resources as a single unit. It lets you define what resources the stack manages, and what happens to them when they are removed from the template or when the stack itself is deleted. The key decision is whether unmanaged resources should be detached or deleted, and who has permission to make that choice.

The stack transpiles Bicep files into ARM JSON templates and deploys them as a deployment object. It offers additional capabilities beyond familiar deployment resources, such as preventing undesired modifications via deny settings and efficient environment cleanup using delete flags during stack updates [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).

## Planning the ownership model

A deployment stack can be created at resource group, subscription, or management group scope. The scope you choose determines where the stack resource lives and where it can deploy resources.

- A stack at resource group scope can deploy the template to the same resource group where the stack exists [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- A stack at subscription scope can deploy the template to a resource group or to the same subscription where the stack exists [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- A stack at management group scope can deploy the template to the subscription [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).

It is important to note that where a deployment stack exists, so is the deny-assignment created with the deny settings capability. For example, by creating a deployment stack at subscription scope that deploys the template to resource group scope and with deny settings mode `DenyDelete`, you can easily provision managed resources to the specified resource group and block delete attempts to those resources. This approach helps to enhance the security of the deployment stack by separating it at the subscription level instead of at the resource-group level. This separation ensures that the developer teams working with the provisioned resources only have visibility and write access to the resource groups. The deployment stack remains isolated at a higher level. This configuration minimises the number of users that can edit a deployment stack and make changes to its deny-assignment [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).

There are two built-in roles for deployment stacks:

- **Azure Deployment Stack Contributor**: Users can manage deployment stacks, but can't create or delete deny-assignments within the deployment stacks [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- **Azure Deployment Stack Owner**: Users can manage deployment stacks, including those users with deny-assignments [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).

## Controlling detachment and deletion

A detached resource (or unmanaged resource) refers to a resource that the deployment stack doesn't track or manage but still exists within Azure. To instruct Azure to delete unmanaged resources, update the stack with the create stack command and include the `ActionOnUnmanage` switch [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).

Allowed values for `ActionOnUnmanage` are:

- `deleteAll`: Use delete rather than detach for managed resources and resource groups [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- `deleteResources`: Use delete rather than detach for managed resources only [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- `detachAll`: Detach the managed resources and resource groups [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).

For example, to create a subscription-scoped stack that deletes managed resources and resource groups:

```azurepowershell
New-AzSubscriptionDeploymentStack `
  -Name "<deployment-stack-name>" `
  -TemplateFile "<bicep-file-name>" `
  -DenySettingsMode "none" `
  -ActionOnUnmanage "deleteAll" 
```

When deleting resource groups with the `action-on-unmanage` switch set to `deleteAll`, you delete the managed resource groups and all the resources contained within them [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).

## Updating and deleting stacks

To update a deployment stack, which might involve adding or deleting a managed resource, you need to make changes to the underlying Bicep files. Once you make the modifications, you can update the deployment stack by either running the update command or rerunning the create command [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).

To update a deployment stack at the resource group scope:

```azurepowershell
Set-AzResourceGroupDeploymentStack `
  -Name "<deployment-stack-name>" `
  -ResourceGroupName "<resource-group-name>" `
  -TemplateFile "<bicep-file-name>" `
  -ActionOnUnmanage "detachAll" `
  -DenySettingsMode "none"
```

The Azure CLI doesn't have a deployment stack set command. Use the New command instead [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).

To delete the deployment stack, and the managed resources:

```azurecli
az stack group delete \
  --name 'demoStack' \
  --resource-group 'demoRg' \
  --action-on-unmanage 'deleteAll' 
```

To delete the deployment stack, but detach the managed resources:

```azurecli
az stack group delete \
  --name 'demoStack' \
  --resource-group 'demoRg' \
  --action-on-unmanage 'detachAll' 
```

The remove command only removes the managed resources and managed resource groups. You still need to delete the resource group [Create and deploy a deployment stack with Bicep from template specs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/quickstart-create-deployment-stacks-template-specs).

## Known limitations and issues

There are several known limitations and issues to be aware of:

- There is a limit of 800 deployment stacks that can be created within a single scope [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- A maximum of 2,000 Deny Assignments can exist at any given scope [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- The deployment stack doesn't manage implicitly created resources. Therefore, you can't use deny-assignments or cleanup for these resources [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- Deny-assignments don't support tags [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- Deny-assignments aren't supported at the management group scope. However, they're supported in a management group stack if the deployment is pointed at the subscription scope [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- Deployment stacks can't delete Key vault secrets. If you're removing key vault secrets from a template, make sure to also execute the deployment stack update/delete command with detach mode [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- Deleting resource groups currently bypasses deny-assignments. When you create a deployment stack in the resource group scope, the Bicep file doesn't contain the definition for the resource group. Despite the deny-assignment setting, you can delete the resource group and its contained stack. However, if a lock is active on any resource within the group, the delete operation fails [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- The What-if support isn't yet available [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- A management group-scoped stack can't deploy to another management group. It can only deploy to the management group of the stack itself or to a child subscription [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- The Azure PowerShell command help lists a `DeleteResourcesAndResourcesGroups` value for the `ActionOnUnmanage` switch. When you use this value, the command detaches the managed resources and the resource groups. This value is removed in the next update. Don't use this value [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- In some cases, the New and Set Azure PowerShell cmdlets might return a generic template validation error that isn't clearly actionable. This bug will be fixed in the next release. If the error isn't clear, run the cmdlet in debug mode to see a more detailed error in the raw response [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).
- Microsoft Graph provider doesn't support deploy stacks [Create and deploy Azure deployment stacks in Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deployment-stacks).

## Verification

To verify the deployment, you can list the deployed deployment stacks at the subscription level:

```azurecli
az stack group show \
  --resource-group 'demoRg' \
  --name 'demoStack'
```

The output shows two managed resources - one storage account and one virtual network [Create and deploy a deployment stack with Bicep from template specs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/quickstart-create-deployment-stacks-template-specs).

You can also verify the deployment by list the managed resources in the deployment stack:

```azurecli
az stack group show \
  --name 'demoStack' \
  --resource-group 'demoRg' \
  --output 'json'
```

The output is similar to [Create and deploy a deployment stack with Bicep from template specs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/quickstart-create-deployment-stacks-template-specs):

```output
{
  "actionOnUnmanage": {
    "managementGroups": "detach",
    "resourceGroups": "detach",
    "resources": "detach"
  },
  ...
  "resources": [
    {
      "denyStatus": "none",
      "id": "/subscriptions/aaaa0a0a-bb1b-cc2c-dd3d-eeeeee4e4e4e/resourceGroups/demoRg/providers/Microsoft.Network/virtualNetworks/vnetthmimleef5fwk",
      "resourceGroup": "demoRg",
      "status": "managed"
    },
    ...
  ]
}
```

## Cleanup

```azurecli
az group delete \
  --name 'demoRg'
```

To delete the template spec and the resource group:

```azurecli
az group delete \
  --name 'templateSpecRG'
```
}
