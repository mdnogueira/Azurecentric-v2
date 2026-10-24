---
title: "Choose where reusable infrastructure modules should live"
description: "Decide between Bicep private registries and template specs by evaluating tooling constraints and artifact requirements."
pubDate: 2025-04-14
category: automation
tags: ["bicep", "infrastructure-as-code", "azure-container-registry", "template-specs", "devops"]
translationKey: choose-where-reusable-infrastructure-modules-should-live
draft: true
---

Where should reusable infrastructure modules live? The answer depends on whether your team uses Bicep exclusively, whether you need to package non-template artifacts, and how you want to control access. Microsoft provides two primary mechanisms for sharing modules: the Bicep private module registry and template specs. Choosing between them is not about which is technically superior, but which fits your tooling and governance requirements.

## Understand the core differences

[![Module Sharing Decision Flow](/images/posts/2025/azc-168-checkpoints.svg)](/images/posts/2025/azc-168-checkpoints.svg)

The Bicep private module registry is built on Azure Container Registry (ACR). It is designed specifically for Bicep. If you are not using Bicep, you cannot use this registry. Conversely, template specs are a broader Azure Resource Manager (ARM) feature. They can be deployed from the Azure portal, Azure PowerShell, the Azure CLI, and via the API, not just from Bicep files.

A critical distinction lies in artifact packaging. Bicep allows you to embed non-template files, such as PowerShell scripts or binaries, using functions like `loadTextContent`. The Bicep private registry preserves this capability. Template specs cannot package these additional artifacts; they only store the compiled ARM template JSON. If your modules rely on embedding scripts, the private registry is the only viable option among the two.

Access control also differs. Both mechanisms require permissions. The private registry restricts access to users with pull permissions on the ACR. Template specs restrict access to users with read permissions on the template spec resource. Neither is inherently more secure; both rely on Azure role-based access control (RBAC) or Azure AD groups to limit visibility.

## When to use the Bicep private module registry

Use the private registry if your organisation is standardising on Bicep and you need to share modules that include embedded scripts or binaries. It is also suitable if you prefer the familiar container registry model for versioning and distribution.

To set up a private registry, you need an Azure Container Registry. You can use any of the available registry SKUs. Registry geo-replication provides users with a local presence or as a hot-backup, but this feature is only available in Standard or Premium SKUs. Basic SKUs do not offer geo-replication or audit logs. Select a SKU appropriate for your organisation's scale and security needs.

The registry must have the `azureADAuthenticationAsArmPolicy` set to `enabled`. If this policy is disabled, you will receive a 401 Unauthorized error when publishing modules. You can enforce private endpoint access to the registry to prevent public internet access, which is a common requirement for secure environments.

Publishing a module requires the Bicep CLI version 0.4.1008 or later. You use the `publish` command to upload the module. You can also publish the Bicep source code alongside the compiled JSON, which allows developers to use "Go to Definition" in Visual Studio Code. This requires Bicep CLI version 0.27.1 or later and the Bicep extension version 0.27 or newer.

```bicep
// Example: Referencing a module from a private registry
module stgModule 'br:exampleregistry.azurecr.io/bicep/modules/storage:v1' = {
  name: 'storageDeploy'
  params: {
    storagePrefix: 'examplestg1'
  }
}
```

This code is an illustrative example. It assumes `exampleregistry.azurecr.io` is your registry's login server and you have configured aliases in your `bicepconfig.json` to shorten the path. Without the alias, the full path must be used. The Bicep extension in Visual Studio Code will automatically call `bicep restore` to download the module to your local cache when you first reference it. In CI/CD environments, explicit `bicep restore` commands or pre-download steps are required, as the IDE extension is not present.

## When to use template specs

Choose template specs if you need to deploy modules from non-Bicep tools, such as the Azure portal or Azure PowerShell. They are also useful if you want to customise the portal deployment experience using `UiFormDefinition`. Template specs are ideal for scenarios where you want to share ARM templates directly without requiring the consumer to use Bicep.

Creating a template spec involves defining a resource of type `Microsoft.Resources/templateSpecs`. You then publish the ARM template JSON to this resource. Consumers reference the template spec using a specific syntax that includes the subscription ID, resource group, template spec name, and version.

```bicep
// Example: Referencing a module from a template spec
module stgModule 'ts/ContosoSpecs:storageSpec:2.0' = {
  name: 'storageDeploy'
  params: {
    storagePrefix: 'examplestg1'
  }
}
```

This code is an illustrative example. It assumes an alias named `ContosoSpecs` is configured in `bicepconfig.json` to point to the resource group containing the template specs. The full syntax without an alias would be `ts:<sub-id>/<rg-name>/<template-spec-name>:<version>`.

Template specs do not support embedding non-template artifacts. If your module requires a script to be deployed alongside the infrastructure, you must handle this separately. Since ARM templates cannot embed arbitrary binaries or scripts in the same way Bicep's `loadTextContent` does, you would need to host the script externally and reference it by URI within the ARM template.

## Decision criteria

The choice between the two mechanisms can be summarised by the following questions:

1. **Do you use Bicep exclusively?** If yes, and you need to embed scripts, use the private registry. If you only deploy ARM templates, either works, but template specs offer broader tooling support.
2. **Do you need to embed non-template artifacts?** If yes, use the private registry. Template specs cannot package these files.
3. **Do you need to deploy from the Azure portal?** If yes, use template specs. The private registry is only accessible from Bicep files.
4. **Do you have existing ACR infrastructure?** If yes, the private registry may be easier to integrate. If you prefer a dedicated resource type for templates, template specs are more explicit.

## Verification

After choosing a mechanism, verify access and deployment. For the private registry, ensure the `azureADAuthenticationAsArmPolicy` is enabled and that your user has pull permissions. Test a `bicep restore` command to confirm the module downloads correctly. For template specs, verify that the user has read permissions on the template spec resource and test a deployment from the intended tool, such as the Azure CLI or PowerShell.

Neither mechanism contributes to security controls on its own. Both require proper RBAC configuration. The private registry can be secured with private endpoints, but this is an additional configuration step, not a default. Template specs rely on standard ARM resource permissions. Choose the mechanism that aligns with your existing governance and tooling, and ensure access controls are tested before widespread adoption.

References for Choose where reusable infrastructure modules should live: [Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules), [Create a private container registry in Azure for Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/private-module-registry), [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices).
