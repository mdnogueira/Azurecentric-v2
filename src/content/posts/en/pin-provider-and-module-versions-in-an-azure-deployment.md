---
title: "Pin provider and module versions in an Azure deployment"
description: "Pin Bicep module versions to ensure reproducible deployments and prevent drift from upstream changes."
pubDate: 2026-04-27
category: automation
tags: ["bicep", "infrastructure-as-code", "azure-container-registry", "template-specs", "versioning"]
translationKey: pin-provider-and-module-versions-in-an-azure-deployment
draft: false
---

You are deploying a Bicep file that references a module from a registry. The deployment succeeds, but a colleague updates the module to fix a minor bug. You redeploy the same Bicep file, and suddenly your storage account is recreated with a different SKU, or your logic app fails because a parameter name changed. The root cause is simple: you did not pin the module version.

In infrastructure as code, reproducibility is not optional. If your deployment script does not explicitly state which version of a module it uses, it will resolve to a default version. This is convenient for development, but it introduces drift in production. Pinning versions ensures that a deployment today behaves exactly the same way a year from now, unless you explicitly choose to update.

## Why pinning matters

Modules are not static. Whether they come from a public registry, a private Azure Container Registry (ACR), or a template spec, they evolve. A new version might introduce a breaking change, such as removing a deprecated property or changing the default value of a parameter. Without a pinned version, your deployment is dependent on external changes you did not review.

The Bicep documentation notes that module registries show the latest version by default, and that tags are used to specify a version for the module [Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules). This implies that without a tag, or with a tag that points to the latest, you are subject to change. Pinning is the act of fixing that tag to a specific, tested version.

## How to pin versions in different sources

The method for pinning depends on where your module lives. The syntax is consistent, but the source determines how you manage the version lifecycle.

### Public modules

If you use Azure Verified Modules from the public registry, the reference syntax uses the `br/public` alias. To pin the version, you append a tag to the module path.

```bicep
module storage 'br/public:avm/res/storage/storage-account:0.18.0' = {
  name: 'myStorage'
  params: {
    name: 'store${resourceGroup().name}'
  }
}
```

In this example, `0.18.0` is the pinned version. If the public registry updates the `latest` tag or if a new version `0.19.0` is released, your deployment will continue to use `0.18.0` until you manually update the tag in your Bicep file. This gives you control over when to adopt new features or fixes.

### Private registries

For private modules hosted in an Azure Container Registry, the syntax is similar but uses your registry's login server. You define the tag explicitly in the reference.

```bicep
module stgModule 'br:exampleregistry.azurecr.io/bicep/modules/storage:v1' = {
  name: 'storageDeploy'
  params: {
    storagePrefix: 'examplestg1'
  }
}
```

Here, `v1` is the pinned tag. When you publish a module to ACR, you assign a tag using the Bicep CLI [Create a private container registry in Azure for Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/private-module-registry). You can publish multiple versions, such as `v1`, `v1.1`, and `v2`. Your Bicep file should reference the specific tag you have tested. If you need to update, you change the tag in the Bicep file and redeploy. This process is explicit and auditable.

### Template specs

Template specs offer another way to share modules. They are stored in a resource group and have their own versioning system. To pin a template spec, you include the version in the reference.

```bicep
module stgModule 'ts/ContosoSpecs:storageSpec:2.0' = {
  name: 'storageDeploy'
  params: {
    storagePrefix: 'examplestg1'
  }
}
```

The `2.0` at the end is the version. Template specs allow you to manage versions independently of the Bicep file that uses them. This is useful if you want to update the module content without changing the Bicep file in every repository. However, you still need to update the Bicep file to point to the new version when you are ready to deploy it.

## Managing updates and drift

Pinning versions does not mean you never update. It means you update deliberately. When a new version of a module is available, you should:

1. Review the changelog or release notes for the module.
2. Test the new version in a non-production environment.
3. Update the tag in your Bicep file.
4. Deploy and verify.

This process prevents unexpected changes from breaking your infrastructure. It also makes it easier to troubleshoot issues, because you know exactly which version of the module was used in each deployment.

## Verification

To verify that your modules are pinned, inspect the module references in your Bicep files. Ensure that every external module reference includes a tag or version number. If you see a reference without a tag, such as `br/public:avm/res/storage/storage-account`, it will resolve to the latest version, which is not pinned.

You can also check the local cache to see which version was downloaded. The Bicep extension stores modules in a local cache directory [Create a private container registry in Azure for Bicep modules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/private-module-registry). If you run `az bicep restore`, it will download the version specified in your Bicep file. If the tag is missing, it will download the latest available version.

By pinning versions, you take control of your deployment pipeline. You stop relying on external changes and start managing your infrastructure with precision. This is a small step that makes a big difference in reliability.

Cheers.
