---
title: "Use what-if to review an Azure deployment"
description: "Preview Bicep deployment changes using the Azure Resource Manager what-if operation to verify creates, modifications, and deletions before applying them."
pubDate: 2024-05-11
category: automation
tags: ["bicep", "azure-cli", "azure-powershell", "deployment", "what-if", "azure-resource-manager"]
translationKey: use-what-if-to-review-an-azure-deployment
draft: false
---

You are about to change a virtual network address space or remove a subnet. The first thing to check is whether the change will actually delete the resources you expect, or if it will trigger a silent redeployment that breaks connectivity. Azure Resource Manager provides a what-if operation that predicts these changes without modifying any existing resources.

The what-if operation is not a dry run that validates syntax in isolation; it compares your Bicep file against the current state of the target scope. It tells you which resources will be created, modified, or deleted. For a Bicep file that uses complete mode, it can even identify resources that exist in the scope but are missing from the template, marking them for deletion.

[![What-If Operation Flow](/images/posts/2024/azc-047-checkpoints.svg)](/images/posts/2024/azc-047-checkpoints.svg)

## Prerequisites and permissions

To run a what-if operation, you need the same permissions as a live deployment. You must have write access to the resources you are deploying and access to all operations on the `Microsoft.Resources/deployments` resource type. For example, deploying a virtual machine requires `Microsoft.Compute/virtualMachines/write` and `Microsoft.Resources/deployments/*` permissions [S1, S2].

You also need a local Bicep file. Azure CLI does not support deploying remote Bicep files directly, so the file must be available on your machine [Deploy resources with Azure CLI and Bicep files | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template). Ensure you are using Azure CLI version 2.14.0 or later, or Azure PowerShell with Az module version 4.2 or later [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

## Understanding the output

The what-if operation returns a list of changes with specific types. Understanding these types prevents misinterpretation of the results.

*   **Create**: The resource does not currently exist but is defined in the Bicep file.
*   **Delete**: The resource exists but is not defined in the Bicep file. This only applies when using complete mode deployment [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).
*   **Modify**: The resource exists and is defined in the Bicep file, and its properties will change.
*   **NoChange**: The resource exists and is defined, but no properties will change. This is returned when the result format is `FullResourcePayloads` [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).
*   **NoEffect**: The property is read-only and will be ignored by the service [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).
*   **Ignore**: The resource exists but is not defined in the Bicep file, and will not be deployed or modified. This also appears when the operation hits limits for expanding nested templates [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).
*   **Deploy**: The resource will be redeployed, but the operation lacks enough information to determine if properties will change. This appears only with `ResourceIdOnly` format [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

A common source of confusion is the `reference` function. The what-if operation cannot resolve `reference` calls. If your Bicep file uses `reference()` to fetch a property from another resource, what-if will report that property as changing every time, because it compares the current value against the unresolved expression [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if). This does not mean the property will actually change during deployment; it is a limitation of the preview mechanism.

## Running the operation

You can run the what-if operation using Azure CLI or PowerShell. The output is colour-coded in the terminal to help distinguish between creates, deletes, and modifications.

### Azure CLI

To preview changes for a resource group deployment, use `az deployment group what-if` [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

```azurecli
az deployment group what-if \
  --resource-group ExampleGroup \
  --template-file main.bicep
```

If you want to programmatically inspect the results, use the `--no-pretty-print` switch to return a JSON object [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

```azurecli
results=$(az deployment group what-if --resource-group ExampleGroup --template-file main.bicep --no-pretty-print)
```

### Azure PowerShell

For PowerShell, use `New-AzResourceGroupDeployment` with the `-Whatif` switch [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

```powershell
New-AzResourceGroupDeployment `
  -Whatif `
  -ResourceGroupName ExampleGroup `
  -TemplateFile main.bicep
```

To get an object for programmatic inspection, use `Get-AzResourceGroupDeploymentWhatIfResult` [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

```powershell
$results = Get-AzResourceGroupDeploymentWhatIfResult `
  -ResourceGroupName ExampleGroup `
  -TemplateFile main.bicep
```

## Confirming before deployment

If the preview looks correct, you can combine the what-if check with the deployment command using the confirm switch. This prompts you to proceed after seeing the changes.

In Azure CLI, use `--confirm-with-what-if` (or `-c`) with the create command [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

```azurecli
az deployment group create \
  --resource-group ExampleGroup \
  --template-file main.bicep \
  --confirm-with-what-if
```

In PowerShell, use the `-Confirm` switch [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

```powershell
New-AzResourceGroupDeployment `
  -ResourceGroupName ExampleGroup `
  -TemplateFile main.bicep `
  -Confirm
```

This approach ensures you see the predicted changes and can decide whether to proceed. It does not guarantee that the deployment will succeed, as runtime errors or permission issues can still occur. However, it catches structural changes like accidental deletions or unintended modifications to critical properties like address spaces or subnet configurations.

## Limits and noise

The what-if operation has limits. It expands nested templates up to 500 levels or 800 resource groups, and takes up to 5 minutes for expansion. If these limits are reached, remaining resources are marked as **Ignore** [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

You may also see "noise" in the output. Properties that are not in your Bicep file but are set as defaults during deployment might be reported as deleted. These are not actual deletions; the final deployed resource will have the default values. As the operation matures, this noise is expected to be filtered out [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

To reduce output verbosity, you can use the `ResourceIdOnly` result format, which lists only the resources that will change, without property details [Bicep deployment what-if](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if). This is useful for quick checks in pipelines where you only need to know if any resources are affected.

## Verification

After running the what-if operation, verify the following:

1.  Check for **Delete** changes if you are using complete mode. Ensure no critical resources are marked for deletion.
2.  Review **Modify** changes for properties that affect connectivity or performance, such as address spaces, SKU changes, or firewall rules.
3.  Ignore **NoChange** entries if you are using `FullResourcePayloads`, as they indicate no functional change.
4.  Be cautious with **Deploy** entries, as they indicate a redeployment but do not specify property changes.

If the preview matches your intent, proceed with the deployment. If not, adjust your Bicep file and run the what-if operation again. This iterative process helps prevent accidental disruptions to your Azure environment.
