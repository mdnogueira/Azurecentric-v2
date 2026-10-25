---
title: "Store application settings outside a container image"
description: "Store configuration outside Azure Functions images using app settings to avoid rebuilds and manage secrets securely."
pubDate: 2025-09-12
category: apps
tags: ["azure-functions", "app-settings", "container-security", "managed-identity", "configuration-management"]
translationKey: store-application-settings-outside-a-container-image
draft: false
---

Your container image should contain code, not configuration. When settings are baked into the image, every environment change requires a rebuild and redeployment. Azure Functions provides a cleaner separation: you store configuration in app settings, which the platform injects as environment variables at runtime. This keeps your image portable and your secrets out of version control.

App settings are stored encrypted in the function app configuration. They are injected into the container as environment variables when the app starts. This means your code can access them using standard environment variable APIs, regardless of the language or framework. However, changes to function app settings require your function app to be restarted, which can impact availability if not managed carefully.

## Why app settings are the right place

App settings provide a clear boundary between your application code and its runtime environment. You can add any number of app settings as required by your function code, and they are accessible to all functions within the app.

The primary benefit is separation of concerns. Your image is built once and deployed to multiple environments—development, staging, production—with different settings. This avoids the need to maintain multiple images or bake environment-specific logic into your code.

Security is another key advantage. Secrets are stored in the platform, not in your code repository. For sensitive values like connection strings, you can use managed identity to avoid storing secrets in app settings altogether, or use Azure Key Vault for more advanced secret management.

Ease of rotation is also important. Change a setting in the portal or via CLI, and the app restarts with the new value. No rebuild is needed. However, because changes require a restart, you should plan your deployments to minimize downtime, especially in production.

## How to store settings outside the image

The process involves three steps: defining the settings in the function app, configuring your code to read them, and securing access to sensitive values.

### 1. Define settings in the function app

You can add app settings via the Azure portal, Azure CLI, or Azure PowerShell. Here is an example using Azure CLI:

```azurecli-interactive
az functionapp config appsettings set --name <FUNCTION_APP_NAME> \
--resource-group <RESOURCE_GROUP_NAME> \
--settings CUSTOM_FUNCTION_APP_SETTING=12345
```

This command adds a setting named `CUSTOM_FUNCTION_APP_SETTING` with the value `12345`. You can add multiple settings by separating them with spaces.

In the Azure portal, navigate to your function app, select **Environment variables** under **Settings**, and then select the **App settings** tab. Click **+ Add** to add a new setting.



When using REST APIs, including ARM templates, be aware that these APIs replace the existing application settings. You must include all existing settings when adding or modifying settings using REST APIs or ARM templates. For more information, see [Work with application settings](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings#settings).

### 2. Read settings in your code

Your code should read app settings using standard environment variable APIs. For example, in Python:

```python
import os

custom_setting = os.environ.get('CUSTOM_FUNCTION_APP_SETTING')
```

In Node.js:

```javascript
const customSetting = process.env.CUSTOM_FUNCTION_APP_SETTING;
```

The function app settings values are also available as environment variables in your code. For more information, see the Environment variables section of the language-specific reference articles.

When you develop a function app locally, you must maintain local copies of these values in the *local.settings.json* project file. For more information, see [Local settings file](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local#local-settings-file).

### 3. Secure sensitive values

For sensitive values like connection strings, you can use managed identity to avoid storing secrets in app settings. For example, to connect to Azure Blob Storage, you can use the `AzureWebJobsStorage` setting with a managed identity connection string.

Set the `AzureWebJobsStorage` setting to `DefaultEndpointsProtocol=https;AccountName=<account_name>;EndpointSuffix=core.windows.net;Identity=SystemAssigned` and enable managed identity for the function app. The platform will automatically inject the managed identity token when the app accesses the storage account.

For more information, see [Manage key storage](https://learn.microsoft.com/en-us/azure/azure-functions/function-keys-how-to#manage-key-storage).

## Verification and next steps

After configuring your app settings, verify that they are injected correctly by checking the app settings list via the Azure CLI (`az functionapp config appsettings list`) which masks values, or verifying application behavior without exposing raw secret values in the guide.

Remember that changes to app settings require a restart. Plan your deployments accordingly to minimize downtime. For critical applications, consider using deployment slots to swap configurations without interrupting traffic.

If you need to manage large configuration blocks or share settings across multiple function apps, consider using Azure Key Vault or Azure App Configuration. These services provide more advanced features like versioning, auditing, and access control.

By keeping your configuration outside the image, you simplify your deployment pipeline and improve the security of your application. Start by moving one or two settings out of your image and see how it simplifies your workflow.


References for Store application settings outside a container image: [Environment Variables and App Settings Reference](https://learn.microsoft.com/en-us/azure/app-service/reference-app-settings), [App settings reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings), [Configure function app settings in Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings#settings).
