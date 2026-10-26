---
title: "Separate staging and production identities for a PaaS application"
description: "Separate staging and production identities using user-assigned managed identities to prevent shared access risks."
pubDate: 2026-09-26
category: app-paas
tags: ["azure-app-service", "managed-identities", "azure-container-apps", "azure-key-vault", "containers"]
translationKey: separate-staging-and-production-identities-for-a-paas-application
draft: false
---

You are deploying a PaaS application across staging and production environments, and you need to ensure that the staging instance cannot access production data. The most direct way to enforce this boundary is to assign separate managed identities to each environment. Using a single system-assigned identity for both slots or deployments creates a shared credential that makes it difficult to restrict access at the resource level. By using user-assigned identities, you can grant the production identity access to sensitive resources while leaving the staging identity with no access or limited access to test data.

## Why separate identities matter

A system-assigned managed identity is tied to the lifecycle of the App Service or Container App. If you use the same system-assigned identity for both staging and production, any role assignment you make to that identity applies to both environments. This means that if you grant the production app access to a Key Vault or a database, the staging app inherits that same access. This is rarely desirable, as staging often requires different data sets, configurations, or access levels.

User-assigned managed identities are standalone Azure resources. They can be assigned to multiple apps, but each app can also have its own unique user-assigned identity. This allows you to create a distinct identity for staging and another for production. You can then manage their permissions independently. For example, you can assign the production identity a role on the production Key Vault, while the staging identity has no such assignment or is assigned to a separate staging Key Vault.

## Create user-assigned identities

The first step is to create the user-assigned identities. You can do this via the Azure portal, Azure CLI, or ARM templates. Here is an example using Azure CLI to create two identities, one for staging and one for production:

```bash
az identity create --resource-group myResourceGroup --name staging-identity
az identity create --resource-group myResourceGroup --name production-identity
```

Record the resource IDs of these identities, as you will need them when assigning the identities to your apps.

## Assign identities to your apps

Next, assign the appropriate identity to each app. For App Service, you can use the Azure portal or Azure CLI. For Container Apps, the process is similar.

### App Service

To assign a user-assigned identity to an App Service app, use the `az webapp identity assign` command. You must specify the identity's resource ID.

```bash
# Assign staging identity to the staging app
az webapp identity assign --resource-group myResourceGroup --name my-staging-app --identities <staging-identity-resource-id>

# Assign production identity to the production app
az webapp identity assign --resource-group myResourceGroup --name my-production-app --identities <production-identity-resource-id>
```

Note that adding a user-assigned identity to an App Service app triggers a restart of the app ([Managed Identities](https://learn.microsoft.com/en-us/azure/app-service/overview-managed-identity)(https://learn.microsoft.com/en-us/azure/app-service/overview-managed-identity)).

### Container Apps

For Container Apps, use the `az containerapp identity assign` command.

```bash
# Assign staging identity to the staging container app
az containerapp identity assign --resource-group myResourceGroup --name my-staging-app --user-assigned <staging-identity-resource-id>

# Assign production identity to the production container app
az containerapp identity assign --resource-group myResourceGroup --name my-production-app --user-assigned <production-identity-resource-id>
```

Unlike App Service, when a managed identity is added, deleted, or modified on a running Container App, the app does not automatically restart and a new revision is not created ([Managed identities in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/managed-identity)(https://learn.microsoft.com/en-us/azure/container-apps/managed-identity)).

## Configure access policies

Now that each app has its own identity, you can configure access to your resources. For example, if your apps need to access Azure Key Vault, you can assign roles to each identity separately.

### Key Vault access

To grant the production identity access to the production Key Vault, assign the `Key Vault Secrets User` role to the production identity on the Key Vault. Do not assign this role to the staging identity, or assign it to a separate staging Key Vault.

```bash
# Get the principal ID of the production identity
PROD_PRINCIPAL_ID=$(az identity show --resource-group myResourceGroup --name production-identity --query principalId --output tsv)

# Assign role to the production identity on the production Key Vault
az role assignment create --role "Key Vault Secrets User" --assignee $PROD_PRINCIPAL_ID --scope /subscriptions/<subscription-id>/resourceGroups/myResourceGroup/providers/Microsoft.KeyVault/vaults/my-production-kv
```

For the staging identity, you might assign it to a staging Key Vault or leave it without access to production secrets.

## Verify the separation

To verify that the separation is working, attempt to access a production resource from the staging app. The request should fail because the staging identity does not have the necessary permissions. You can test this by running a simple script that attempts to retrieve a secret from the production Key Vault using the staging app's identity.

If the staging app is configured correctly, it should receive an access denied error. This confirms that the identities are separate and that permissions are applied correctly.

## Considerations

- **Token Caching**: Managed identity tokens are cached for up to 24 hours. If you change permissions, it may take some time for the changes to take effect. Plan for this delay when testing.
- **Multiple Identities**: An app can have both system-assigned and user-assigned identities. However, for clear separation, it is best to use only user-assigned identities for staging and production.
- **Cost**: User-assigned identities have a small monthly cost. Ensure that this cost is acceptable for your environment.

By using user-assigned identities, you create a clear boundary between staging and production, reducing the risk of accidental data exposure or unauthorized access. This approach is scalable and aligns with best practices for managing access in Azure.

References for Separate staging and production identities for a PaaS application: [Managed Identities](https://learn.microsoft.com/en-us/azure/app-service/overview-managed-identity), [App Service authentication recommendations](https://learn.microsoft.com/en-us/azure/app-service/identity-scenarios), [Managed identities in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/managed-identity).
