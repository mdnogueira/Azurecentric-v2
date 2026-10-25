---
title: "Review drift before applying another infrastructure deployment"
description: "Use Bicep What-If to review infrastructure drift and validate changes before committing them to Azure."
pubDate: 2025-09-24
category: automation
tags: ["bicep", "azure-resource-manager", "infrastructure-as-code", "deployment", "what-if", "azure-cli"]
translationKey: review-drift-before-applying-another-infrastructure-deployment
draft: false
---

You are about to run a Bicep deployment that modifies an existing virtual network. The template looks correct, but you need to know exactly which resources will change, which will be deleted, and whether the operation will break a dependency before you hit enter.

Azure Resource Manager provides a What-If operation that predicts these changes without modifying any resources. It is the standard way to review drift and validate templates before deployment.

## Prerequisites and permissions

To run What-If, you need the same permissions as a live deployment. You require write access on the resources you are deploying and access to all operations on the `Microsoft.Resources/deployments` resource type. For example, deploying a virtual machine requires `Microsoft.Compute/virtualMachines/write` and `Microsoft.Resources/deployments/*` permissions [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

You also need a supported version of your CLI tool. Azure CLI 2.14.0 or later is required for basic What-If operations [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if). For better diagnostics and validation controls, use Azure CLI 2.76.0 or later, or Azure PowerShell 13.4.0 or later [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

## Running the What-If operation

The What-If operation is available for resource group, subscription, management group, and tenant level deployments [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if). It does not make changes to existing resources; it only predicts them [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

### Using Azure CLI

For a resource group deployment, use the `az deployment group what-if` command. This command accepts a `--template-file` parameter pointing to your Bicep file.

```azurecli
az deployment group what-if \
  --resource-group ExampleGroup \
  --template-file "what-if-after.bicep"
```

The output uses symbols to indicate change types: `-` for Delete, `+` for Create, and `~` for Modify [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

### Using Azure PowerShell

For resource group deployments, use the `New-AzResourceGroupDeployment` cmdlet with the `-Whatif` switch.

```powershell
New-AzResourceGroupDeployment `
  -Whatif `
  -ResourceGroupName ExampleGroup `
  -TemplateFile "what-if-after.bicep"
```

You can capture the results in a variable for programmatic inspection using `Get-AzResourceGroupDeploymentWhatIfResult` [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

## Validating templates with ValidationLevel

Azure CLI 2.76.0 and Azure PowerShell 13.4.0 introduced the `--validation-level` (CLI) or `-ValidationLevel` (PowerShell) switch. This controls how thoroughly ARM validates the template during the What-If process [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

- **Provider** (default): Performs full validation, including template syntax, resource definitions, dependencies, and permission checks [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).
- **ProviderNoRbac**: Performs full validation but only checks for read permissions on each resource instead of full deployment permissions. This is useful for validating configurations without requiring full access [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).
- **Template**: Performs static validation only, checking template syntax and structure while skipping preflight checks and permission checks. This is less thorough and may miss issues that cause deployment failures [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

Using a higher validation level helps catch permission errors or resource availability issues before you attempt a live deployment.

## Confirming deployments

You can preview changes and get prompted to continue with the deployment by using the `--confirm-with-what-if` switch (or `-c` in CLI) with the deployment command [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

```azurecli
az deployment group create \
  --resource-group ExampleGroup \
  --confirm-with-what-if \
  --template-file "what-if-after.bicep"
```

This approach ensures you see the predicted changes and can confirm the deployment manually [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

## Understanding limitations and noise

What-If has limitations. It expands nested templates up to 500 nested templates, 800 resource groups in cross-resource-group deployments, and 5 minutes for expansion [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if). Beyond these limits, remaining resources are set to **Ignore** [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

Short-circuiting can occur when ARM cannot fully analyze a module or resource due to unresolved expressions or external dependencies. In such cases, the API response includes a diagnostic message [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

Some properties may be incorrectly reported as deleted if they are not in the Bicep file but are automatically set as default values during deployment. This is considered "noise" in the What-If response [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

The What-If operation cannot resolve the `reference` function. Every time you set a property to a template expression that includes the `reference` function, What-If reports the property will change because it compares the current value with the unresolved expression. The property will only change when the template expression resolves to a different value during actual deployment [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

## Programmatic evaluation

For automated pipelines, you can programmatically evaluate What-If results. In Azure CLI, use the `--no-pretty-print` switch to get a JSON object [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

```azurecli
results=$(az deployment group what-if --resource-group ExampleGroup --template-file "what-if-after.bicep" --no-pretty-print)
```

In PowerShell, you can use `Get-AzResourceGroupDeploymentWhatIfResult` to capture the results and iterate through changes [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).

```powershell
$results = Get-AzResourceGroupDeploymentWhatIfResult `
  -ResourceGroupName ExampleGroup `
  --template-file "what-if-after.bicep"

foreach ($change in $results.Changes)
{
  $change.Delta
}
```

This allows you to build checks into your CI/CD pipelines to fail deployments if unexpected changes are detected.

## Next steps

Review the What-If output carefully. Check for unexpected deletions, modifications to critical properties, or noise from default values. If the changes are as expected, proceed with the deployment. If not, adjust your Bicep file and run What-If again.

For more information on Bicep best practices, refer to the [Bicep best practices documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices) [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices).
