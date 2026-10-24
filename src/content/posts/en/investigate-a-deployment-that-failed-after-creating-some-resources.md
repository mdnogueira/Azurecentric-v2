---
title: "Investigate a deployment that failed after creating some resources"
description: "Troubleshoot a failed Bicep deployment by validating permissions, linting the template, and using what-if to identify conflicts before applying changes."
pubDate: 2024-12-21
category: automation
tags: ["bicep", "troubleshooting", "azure-cli", "deployment", "what-if"]
translationKey: investigate-a-deployment-that-failed-after-creating-some-resources
draft: false
---

A deployment fails after creating some resources. The error message points to a specific resource, but the cause is not immediately obvious. Is it a permission issue? A naming conflict? Or a dependency that hasn't resolved yet?

The first thing to do is not to guess. You need to isolate whether the failure is in the validation phase, the permission check, or the actual resource creation. Microsoft's deployment documentation outlines a clear path for this: check what the deployment *would* do before it actually tries to do it, and ensure your template follows the established best practices.

[![Bicep Deployment Troubleshooting Flow](/images/posts/2024/azc-127-checkpoints.svg)](/images/posts/2024/azc-127-checkpoints.svg)

## Check permissions first

Before you even look at the template syntax, confirm you have the right permissions. A deployment failure often masquerades as a resource error when it is actually an identity issue. To deploy a Bicep file, you need write access on the resources you're deploying and access to all operations on the `Microsoft.Resources/deployments` resource type [Deploy resources with Azure CLI and Bicep files | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template).

For example, if you are deploying a virtual machine, you need `Microsoft.Compute/virtualMachines/write` and `Microsoft.Resources/deployments/*` permissions [Deploy resources with Azure CLI and Bicep files | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template). If you are deploying to a resource group, you need at least Contributor role on that group. If you are deploying at the subscription level, you need Contributor or Owner on the subscription. The [permissions include](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template) in the official documentation explicitly state this requirement.

If you are unsure, run a simple command to test your access. Try to list the resources in the target scope. If you can't list them, you can't deploy to them.

## Validate the template with the linter

If permissions are correct, the next step is to validate the template itself. The Bicep linter checks for syntax errors and best practice violations [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter). It is integrated into the Bicep CLI and the Visual Studio Code extension [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter).

You can run the linter from the command line:

```bash
bicep lint main.bicep
```

Or, if you are using Visual Studio Code, the linter runs automatically as you type. The PROBLEMS pane will show any errors or warnings [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter). The default rules are minimal but cover common pitfalls like hardcoded locations, unused parameters, and insecure default values [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter).

The linter can also be customised. If you have specific coding standards, you can create a `bicepconfig.json` file to override the default rules [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter). For example, you might want to enforce the use of recent API versions or suppress certain warnings that are false positives in your context [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter).

## Use what-if to preview changes

The most powerful tool for troubleshooting a failed deployment is the `what-if` operation. It validates the Bicep file for errors and shows you exactly what changes the deployment will make to your environment [Deploy resources with Azure CLI and Bicep files | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template).

To run a what-if operation for a resource group deployment, use:

```bash
az deployment group what-if --resource-group ExampleGroup --template-file main.bicep
```

This command will return a list of resources that will be created, updated, or deleted. If there is a conflict, such as a resource name that already exists, the what-if operation will highlight it before you attempt the actual deployment [Deploy resources with Azure CLI and Bicep files | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template).

The what-if operation also helps you understand dependencies. If a resource fails to deploy because a dependency hasn't been created yet, the what-if output will show the order of operations [Deploy resources with Azure CLI and Bicep files | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template).

## Check deployment history

If the deployment has already failed, check the deployment history. Every time you run a deployment, an entry is added to the resource group's deployment history with the deployment name [Deploy resources with Azure CLI and Bicep files | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template). If you don't provide a name, the name of the Bicep file is used [Deploy resources with Azure CLI and Bicep files | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template).

You can retrieve the deployment history using:

```bash
az deployment group list --resource-group ExampleGroup
```

This will show you the status of previous deployments. If a deployment failed, the output will include the error message and the resource that caused the failure [Deploy resources with Azure CLI and Bicep files | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template).

## Common pitfalls

There are a few common pitfalls that can cause deployment failures:

1. **Naming conflicts**: Azure resources often have unique naming requirements. For example, storage account names must be lowercase and between 3 and 24 characters [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices). If you use the `uniqueString()` function, remember that it doesn't guarantee globally unique names [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices).

2. **Permissions**: As mentioned earlier, you need the right permissions to deploy resources. If you are deploying to a resource group, you need at least Contributor role on that group [Deploy resources with Azure CLI and Bicep files | Microsoft Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template).

3. **Dependencies**: If a resource depends on another resource that hasn't been created yet, the deployment will fail. Bicep handles implicit dependencies automatically, but if you use explicit `dependsOn` statements, make sure they are correct [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices).

4. **API versions**: Using an outdated API version can cause deployment failures. It's a best practice to use the most recent API version for each resource [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices).

By following these steps, you can quickly identify and resolve the cause of a failed Bicep deployment. The key is to use the tools provided by Azure and Bicep to validate your template and preview your changes before you deploy.

### Diagram

{
  "title": "Bicep Deployment Troubleshooting Flow",
  "nodes": [
    "Deployment Fails",
    "Check Permissions",
    "Run Bicep Linter",
    "Run What-If",
    "Check Deployment History",
    "Fix & Redeploy"
  ]
}

### Claims

["To deploy a Bicep file, you need write access on the resources you're deploying and access to all operations on the Microsoft.Resources/deployments resource type.", "S2", "To deploy a Bicep file or ARM template, you need write access on the resources you're deploying and access to all operations on the Microsoft.Resources/deployments resource type."],
["The Bicep linter checks Bicep files for syntax errors and best practice violations.", "S3", "The Bicep linter checks Bicep files for syntax errors and best practice violations."],
["You can preview the changes the Bicep file will make to your environment using the what-if operation.", "S2", "Before deploying your Bicep file, you can preview the changes the Bicep file will make to your environment. Use the what-if operation to verify that the Bicep file makes the changes that you expect."],
["Every time you run a deployment, an entry is added to the resource group's deployment history with the deployment name.", "S2", "Every time you run a deployment, an entry is added to the resource group's deployment history with the deployment name."],
["The uniqueString() function doesn't guarantee globally unique names.", "S1", "The uniqueString() function doesn't guarantee globally unique names."],

### Review_questions

["Does the user have Contributor role on the target resource group or subscription?", "Is the Bicep file using the most recent API versions for all resources?", "Are there any naming conflicts with existing resources in the target scope?", "Is the deployment history showing any previous failed deployments that might be related?", "Are there any explicit dependsOn statements that might be causing dependency issues?"]
}

### Tags

[bicep, troubleshooting, azure-cli, deployment, what-if]

### Source URLs

- [Best practices for Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices)
- [How to deploy resources with Bicep and Azure CLI](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-cli#deploy-remote-template)
- [Use Bicep linter](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/linter)

### Code Example

```bash
# Check permissions
az group list --query "[?name=='ExampleGroup']"

# Run linter
bicep lint main.bicep

# Run what-if
az deployment group what-if --resource-group ExampleGroup --template-file main.bicep

# Check deployment history
az deployment group list --resource-group ExampleGroup
```
