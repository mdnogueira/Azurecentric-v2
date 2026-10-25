---
title: "Use managed identity to read an application secret from Key Vault"
description: "Use App Service managed identities and Key Vault references to read secrets without storing connection strings in app settings."
pubDate: 2024-04-29
category: app-paas
tags: ["azure-key-vault", "azure-app-service", "managed-identities", "azure-cli"]
translationKey: use-managed-identity-to-read-an-application-secret-from-key-vault
draft: false
---

You have an application running on Azure App Service that needs to read a secret from Azure Key Vault. The most common mistake is to store the secret value directly in an app setting or to embed it in the application code. Both approaches require you to manage the secret's lifecycle, rotation, and access control outside of Azure's native identity system.

The correct approach is to use a managed identity for the App Service app and Key Vault references for the application settings. This allows the app to retrieve the secret at runtime without the secret value ever appearing in your configuration or code.

## Why use Key Vault references?

If you use the Azure Identity client library in your code to fetch a secret, you must write code to handle the token acquisition, error handling, and caching. This adds complexity to your application.

Key Vault references offer a simpler alternative for many scenarios. When you configure an app setting as a Key Vault reference, App Service resolves the reference into the actual secret value and populates the app setting environment variable. Your application code reads the app setting as if it were a plain string. This means you do not need to change your application code to use a specific client library for Key Vault.

This approach relies on the App Service platform itself to authenticate with Key Vault. The platform uses the managed identity assigned to the app to request the secret. This separates the concern of identity management from application logic.

## Prerequisites

Before you begin, ensure you have the following:

1. An Azure subscription.
2. An App Service app (web app or function app) deployed to Azure.
3. An Azure Key Vault instance.
4. The Azure CLI installed and configured with access to your subscription.
5. A user-assigned or system-assigned managed identity configured on the App Service app. If you do not have one, you will need to create it.

## Step 1: Enable the managed identity

If your App Service app does not already have a managed identity, you need to enable one. A system-assigned identity is tied to the lifecycle of the app. If the app is deleted, the identity is deleted. This is often the simplest choice for a single app.

You can enable a system-assigned identity using the Azure CLI:

```azurecli-interactive
az webapp identity assign --name <app-name> --resource-group <resource-group-name>
```

This command creates the identity and assigns it to the app. The output will include the `principalId` and `tenantId`, which you may need for the next step.

## Step 2: Grant the identity access to Key Vault

The managed identity is now created, but it has no permissions to read secrets from Key Vault. You must grant it the appropriate role.

Azure Key Vault supports two permission models: access policies and Azure role-based access control (RBAC). RBAC is the recommended model because it integrates with Azure's native role system and allows for more granular control.

To grant the managed identity permission to read secrets, assign the "Key Vault Secrets User" role to the identity at the Key Vault scope. You can do this using the Azure CLI:

```azurecli-interactive
vaultResourceId=$(az keyvault show --name <vault-name> --query id --output tsv)
appPrincipalId=$(az webapp identity show --name <app-name> --resource-group <resource-group-name> --query principalId --output tsv)

az role assignment create \
    --role "Key Vault Secrets User" \
    --assignee-object-id $appPrincipalId \
    --assignee-principal-type ServicePrincipal \
    --scope $vaultResourceId
```

This command retrieves the resource ID of the Key Vault and the principal ID of the managed identity. It then creates a role assignment that allows the identity to read secret values.

> [!NOTE]
> The back-end services for managed identities maintain a cache per resource URI for around 24 hours. If you update the access policy of a particular target resource and immediately retrieve a token for that resource, you may continue to get a cached token with outdated permissions until that token expires. There's currently no way to force a token refresh. 

## Step 3: Store the secret in Key Vault

If the secret is not already in Key Vault, you need to add it. You can use the Azure CLI to set the secret:

```azurecli-interactive
secretUri=$(az keyvault secret set --vault-name <vault-name> --name <secret-name> --value <secret-value> --query id --output tsv)
```

This command creates the secret and returns its URI. You will need this URI in the next step.

## Step 4: Configure the app setting as a Key Vault reference

Now you can configure the App Service app to read the secret from Key Vault. Instead of setting the app setting value to the secret itself, you set it to a reference string.

The format of the reference is `@Microsoft.KeyVault(SecretUri=<secret-uri>)`. You can update the app setting using the Azure CLI:

```azurecli-interactive
az webapp config appsettings set \
    --name <app-name> \
    --resource-group <resource-group-name> \
    --settings <app-setting-name>="@Microsoft.KeyVault(SecretUri=$secretUri)"
```

Replace `<app-setting-name>` with the name of the app setting your application expects. For example, if your application expects a connection string in `DatabaseConnectionString`, you would set that name to the Key Vault reference.

When the App Service app starts, it will detect the reference, use the managed identity to authenticate with Key Vault, retrieve the secret value, and inject it into the app setting. Your application code reads the app setting as usual.

## Verification

To verify that the configuration is working, you can restart the App Service app and check the logs. If the reference is configured correctly, the app should start without errors related to missing secrets.

You can also check the app settings in the Azure portal. The value of the app setting will still show the reference string, not the actual secret value. This is expected. The secret value is only resolved at runtime.

If the app fails to start or throws an authentication error, check the following:

1. Is the managed identity enabled on the app?
2. Does the managed identity have the "Key Vault Secrets User" role assigned to it at the Key Vault scope?
3. Is the secret URI in the app setting reference correct?
4. Is the Key Vault network configuration allowing access from the App Service app? If the Key Vault is behind a firewall, you may need to allow access from the App Service app's VNet or public network, depending on your setup.

## Cleanup

If you created a test resource group for this exercise, you can delete it to avoid incurring further costs:

```azurecli-interactive
az group delete --name <resource-group-name>
```

This will delete the App Service app, Key Vault, and any other resources in the group. Be sure to back up any important data before deleting the group.


References for Use managed identity to read an application secret from Key Vault: [Managed identities](https://learn.microsoft.com/en-us/azure/app-service/overview-managed-identity), [Tutorial: .NET connect to Azure services securely with Key Vault](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-key-vault), [Create a function app without default storage secrets in its definition](https://learn.microsoft.com/en-us/azure/azure-functions/functions-identity-based-connections-tutorial).
