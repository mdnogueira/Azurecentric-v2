---
title: "Use a remote backend for Terraform state in Azure"
description: "Host private Bicep modules in Azure Container Registry for controlled sharing and versioning."
pubDate: 2024-10-23
category: automation
tags: ["bicep", "azure-container-registry", "iac", "private-registry", "modules"]
translationKey: use-a-remote-backend-for-terraform-state-in-azure
draft: false
---

## Why a private registry?

If your team shares Bicep modules, you need a place to store them that enforces access control and versioning. The Azure Bicep module registry provides that capability. You publish compiled templates (and optionally the source Bicep files) to an Azure Container Registry (ACR) instance, then reference them from your deployment files using a `br:` URI.

[![Bicep Module Registry Workflow](/images/posts/2024/azc-106-checkpoints.svg)](/images/posts/2024/azc-106-checkpoints.svg)

This approach keeps your IaC assets under your own governance. It avoids the pitfalls of storing templates in public repositories where versioning and access control might not align with your security requirements. It also ensures that the modules you consume are the ones your organisation has reviewed and approved.

## Prerequisites and permissions

Before you begin, ensure you have the following:

*   An Azure Container Registry instance. You can use any SKU, but consider geo-replication if your team is distributed.
*   Bicep CLI version 0.4.1008 or later. If you are using Azure CLI, you need version 2.31.0 or later; for Azure PowerShell, version 7.0.0 or later.
*   Permissions to push to the ACR repository. Typically, this means the **AcrPush** role.
*   Permissions to pull from the ACR repository. Typically, this means the **AcrPull** role.

Note that the private container registry is accessed over the public internet. If your security policy requires it, you can configure the ACR to be accessible only via a private endpoint. Additionally, the registry must have the `azureADAuthenticationAsArmPolicy` set to `enabled`. If this policy is disabled, you will receive a 401 Unauthorized error when attempting to publish modules.

## Publishing a module

To publish a module, you use the `publish` command. This command compiles the Bicep file into an ARM template JSON and pushes it to the specified ACR repository.

```azurecli
az bicep publish --file storage.bicep --target br:exampleregistry.azurecr.io/bicep/modules/storage:v1 --documentationUri https://www.contoso.com/exampleregistry.html
```

You can also publish the original Bicep source code alongside the compiled template. This allows developers to use "Go to Definition" in Visual Studio Code to inspect the source of the module. To do this, add the `--with-source` flag:

```azurecli
az bicep publish --file storage.bicep --target br:exampleregistry.azurecr.io/bicep/modules/storage:v1 --documentationUri https://www.contoso.com/exampleregistry.html --with-source
```

When you publish with source, the manifest in the ACR includes an additional layer containing the Bicep code. This is visible in the registry's artifact details.

[![Bicep module registry with source code included in the manifest.](/images/posts/2024/azc-106-learn-2.png)](/images/posts/2024/azc-106-learn-2.png)

## Referencing the module

Once the module is published, you can reference it in your Bicep files using the `br:` scheme. The syntax is:

```bicep
module stgModule 'br:exampleregistry.azurecr.io/bicep/modules/storage:v1' = {
  name: 'storageDeploy'
  params: {
    storagePrefix: 'examplestg1'
  }
}
```

The `br:` prefix indicates a Bicep registry. The path follows the standard ACR repository structure. You can use tags to specify the version of the module you want to consume.

If the full path is cumbersome, you can define an alias in your `bicepconfig.json` file. This simplifies the reference in your code:

```json
{
  "moduleAliases": {
    "br/ContosoModules": {
      "storage": "br:exampleregistry.azurecr.io/bicep/modules/storage:v1"
    }
  }
}
```

With this alias, your module declaration becomes:

```bicep
module stgModule 'br/ContosoModules:storage:v1' = {
  name: 'storageDeploy'
  params: {
    storagePrefix: 'examplestg1'
  }
}
```

## Local caching and updates

When you declare a reference to a remote module, the Bicep extension in Visual Studio Code automatically attempts to download the module to your local cache. The cache location depends on your operating system:

*   **Windows:** `%USERPROFILE%\.bicep\br\<registry-name>.azurecr.io\<module-path\<tag>`
*   **Linux/Mac:** `~/.bicep`

Your local environment will use the cached version until you explicitly refresh it. To update your local cache, run:

```azurecli
az bicep restore --file <bicep-file> [--force]
```

This ensures that your local development environment reflects the latest published version of the module. If you encounter issues with IntelliSense or compilation, running a restore is often the first step to resolve them.

## Verification

To verify that your module is published and accessible:

1.  Sign in to the Azure portal.
2.  Navigate to your Azure Container Registry.
3.  Select **Services** > **Repositories**.
4.  Locate the repository path you specified (e.g., `bicep/modules/storage`).
5.  Select the tag (e.g., `v1`).
6.  Check the **Artifact reference**. It should match the URI you used in your Bicep file.

If the artifact reference matches, your module is ready for consumption. You can now test the deployment using your main Bicep file. Remember that the module is converted into a nested template during deployment, so the deployment history will show the nested deployment with the name you specified in the `name` property of the module declaration.

## Common pitfalls

*   **Authentication errors:** Ensure `azureADAuthenticationAsArmPolicy` is enabled on your ACR. If it is disabled, publishing will fail with a 401 error.
*   **Version mismatches:** If you update a module in the registry, your local cache will not automatically update. You must run `az bicep restore` to fetch the latest version.
*   **Scope mismatches:** When referencing a module, ensure that the scope of the module (if specified) aligns with the resources it creates. A module deployed to a resource group cannot create resources in a different subscription unless explicitly scoped to do so.
*   **Public vs. Private:** Remember that the public module registry is being retired for non-Azure Verified Modules. For internal organisational use, a private registry is the recommended approach.

References for Use a remote backend for Terraform state in Azure: [Learn best practices when developing Bicep files](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices), [Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules), [Create private registry for Bicep module](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/private-module-registry).
