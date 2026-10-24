---
title: "Resolve a Terraform state lock without losing deployment history"
description: "Resolve Azure Resource Manager deployment name collisions by using unique identifiers and the What-If operation to verify changes."
pubDate: 2026-10-06
category: automation
tags: ["bicep", "azure-resource-manager", "deployment", "what-if", "terraform"]
translationKey: resolve-a-terraform-state-lock-without-losing-deployment-history
draft: true
---

You are trying to deploy a Bicep file, but the operation fails or produces unexpected results because a deployment with the same name is already in progress or has recently completed. This is not a state lock in the traditional sense of a database transaction; it is an Azure Resource Manager (ARM) concurrency guard. The service prevents two deployments with the same name from running simultaneously against the same scope to avoid overwriting each other's history and resource states.

The immediate fix is to use a unique deployment name. The secondary, and more important, practice is to ensure your deployment history remains distinct so you can trace exactly what changed and when. If you are using Terraform, this behaviour mirrors the state locking mechanism, but the resolution is handled at the deployment operation level rather than a backend state file.

[![Deployment Name Conflict Resolution Flow](/images/posts/2026/azc-361-checkpoints.svg)](/images/posts/2026/azc-361-checkpoints.svg)

## Why deployment names matter

Every time you run a deployment, ARM adds an entry to the deployment history for that scope. If you do not provide a name, ARM uses the name of the Bicep file as the deployment name. For example, if you deploy a file named `main.bicep` without specifying a name, the deployment is recorded as `main`.

If you run another deployment with the same name, the earlier entry is replaced. More critically, if you run concurrent deployments with the same name, only the last one completes. The others are effectively cancelled or overwritten. This is why you see a conflict error: ARM detects that a deployment with that identifier is already active or has recently completed, and it blocks the new attempt to maintain consistency.

To avoid this, give each deployment a unique name. You can do this by appending a random number or a timestamp. In Bash, for example:

```bash
deploymentName='ExampleDeployment'$RANDOM
```

Or using a date value:

```bash
deploymentName='ExampleDeployment'$(date +"%d-%b-%Y")
```

This ensures that every deployment creates a new, distinct entry in the history. It also allows you to run concurrent deployments without conflict, provided each has a unique name. If you run `newStorage1` and `newStorage2` at the same time, both can proceed independently.

## Using What-If to verify changes

Before you deploy, especially when resolving a conflict or making significant changes, use the What-If operation. This command previews the changes that will happen without actually applying them. It validates the Bicep file and checks your permissions.

To use What-If, you need Azure CLI version 2.14.0 or later, or Azure PowerShell version 4.2 or later. The command structure depends on your deployment scope. For a resource group deployment, you would use:

```bash
az deployment group what-if \
  --resource-group ExampleGroup \
  --template-file main.bicep
```

The output shows you exactly what will be created, modified, or deleted. It uses symbols to indicate the type of change: `-` for delete, `+` for create, and `~` for modify. This helps you catch unintended logic changes before they affect your environment.

If you want to preview the changes and get prompted to continue with the deployment, you can add the `--confirm-with-what-if` switch to the create command. This is useful for manual deployments where you want to review the impact before committing.

```bash
az deployment group create \
  --resource-group ExampleGroup \
  --confirm-with-what-if \
  --template-file main.bicep
```

## Permissions and prerequisites

To deploy a Bicep file or use the What-If operation, you need write access on the resources you're deploying and access to all operations on the `Microsoft.Resources/deployments` resource type. For example, to deploy a virtual machine, you need `Microsoft.Compute/virtualMachines/write` and `Microsoft.Resources/deployments/*` permissions.

The What-If operation has the same permission requirements. If you do not have sufficient permissions, the operation will fail. Azure CLI version 2.76.0 or later and Azure PowerShell version 13.4.0 or later introduce a `--validation-level` switch that allows you to control how thoroughly ARM validates the template. You can choose between `Provider` (full validation), `ProviderNoRbac` (validation without RBAC checks), or `Template` (static validation only).

## Resolving the conflict

If you are blocked by a deployment name conflict, follow these steps:

1. **Identify the conflicting deployment.** Check the deployment history for the scope you are targeting. Look for deployments with the same name that are still in progress or have recently completed.

2. **Use a unique name.** Modify your deployment command to include a unique name. Use a timestamp or random suffix to ensure it does not collide with existing entries.

3. **Run What-If.** Before deploying, run the What-If operation with the new unique name. This verifies that the changes are correct and that you have the necessary permissions.

4. **Deploy.** Once you are satisfied with the What-If output, run the deployment command with the unique name.

This approach ensures that your deployment history remains intact and that you can trace every change back to a specific deployment operation. It also prevents the concurrency issues that arise from reusing deployment names.

## Verification

After the deployment completes, check the deployment history to confirm that the new entry was created with the unique name. You can do this by listing the deployments for the scope:

```bash
az deployment group list --resource-group ExampleGroup
```

Verify that the deployment name matches the unique identifier you used. This confirms that the conflict was resolved and that the deployment history is accurate.

If you are using Terraform, this process is analogous to resolving a state lock by ensuring that each apply operation uses a unique identifier, preventing concurrent modifications to the state file. In Azure, the deployment name serves as that identifier, and the What-If operation provides the safety net to verify changes before they are applied.

References for Resolve a Terraform state lock without losing deployment history: [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices), [Deploy Bicep files with the Azure CLI](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template), [Bicep What-If: Preview Changes Before Deployment](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if).
