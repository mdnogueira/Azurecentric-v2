---
title: "Deploy an Azure Functions application with clear configuration boundaries"
description: "Define clear boundaries between host configuration and app settings in Azure Functions to avoid deployment conflicts and runtime errors."
pubDate: 2025-03-31
category: apps
tags: ["azure-functions", "configuration", "host-json", "app-settings", "best-practices"]
translationKey: deploy-an-azure-functions-application-with-clear-configuration-boundaries
draft: false
---

You are configuring an Azure Functions application and need to decide which settings belong in `host.json` and which belong in the function app's environment variables. The line between them is not arbitrary; it determines how your application scales, how it handles secrets, and whether a configuration change forces a restart.

The short answer is: put static, binding-level, and host-wide behavioural settings in `host.json` (checked into source control). Put environment-specific values, secrets, and runtime overrides in the function app's application settings (managed in the portal, CLI, or IaC). Changes to application settings restart the host; changes to `host.json` require a redeployment.

[![Configuration Flow in Azure Functions](/images/posts/2025/azc-163-checkpoints.svg)](/images/posts/2025/azc-163-checkpoints.svg)

## Why the distinction matters

Azure Functions runs on the App Service platform. This means it inherits certain hosting behaviours. Application settings are stored encrypted and are injected as environment variables into the worker process. `host.json` is a metadata file that configures the Functions host itself. The documentation states that application settings can override specific `host.json` values without changing the file, which is useful for environment-specific tuning without republishing code [App settings reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings).

However, this flexibility comes with constraints. Changing any application setting requires your function app to be restarted [App settings reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings)[Configure function app settings in Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings#settings). If you are using a shared hosting plan, this restart affects all function apps in that plan. Furthermore, some read-only App Service application settings can put your function app into an unresponsive state if modified incorrectly [App settings reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings).

Conversely, `host.json` is part of your deployment package. If you change `host.json`, you must redeploy the function app. This is generally safer for static configuration because it ensures consistency across environments via your CI/CD pipeline, but it is less flexible for runtime tuning.

## What goes in host.json

`host.json` controls the runtime host configuration. It affects all functions in the app equally. Key areas include:

*   **Extension Bundles:** Define the version range of the extension bundle to install. The runtime picks the maximum permissible version in the range [host.json reference for Azure Functions 2.x](https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json).
*   **Logging:** Configure log levels, file logging mode, and Application Insights sampling settings. For example, you can exclude specific telemetry types from sampling to ensure critical requests are always captured [host.json reference for Azure Functions 2.x](https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json).
*   **Concurrency:** Enable dynamic concurrency or snapshot persistence for durable functions [host.json reference for Azure Functions 2.x](https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json).
*   **Singletons:** Configure lock periods for distributed locks [host.json reference for Azure Functions 2.x](https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json).
*   **Health Monitor:** Tune health check intervals and thresholds [host.json reference for Azure Functions 2.x](https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json).

These settings are typically static. You define them once for a given environment type (e.g., production) and deploy them via your build pipeline. They are not secrets. If you need to change a log level or a sampling rate, you can often do so via application settings without redeploying, but the base configuration lives in `host.json`.

## What goes in application settings

Application settings are key-value pairs stored in the Azure portal, CLI, or ARM templates. They are ideal for:

*   **Connection Strings:** `AzureWebJobsStorage` for the storage account, and other service-specific connection strings.
*   **Secrets:** API keys, client secrets, or any sensitive data that should not be in source control. These are stored encrypted [Configure function app settings in Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings#settings).
*   **Environment-Specific Overrides:** You can override `host.json` settings using the `AzureFunctionsJobHost__` prefix. For example, `AzureFunctionsJobHost__logging__logLevel__default=Information` overrides the default log level defined in `host.json` [App settings reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings).
*   **Runtime Flags:** Settings like `AzureFunctionsWebHost__hostid` to prevent host ID collisions when sharing a storage account [App settings reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings).
*   **Monitoring:** `APPLICATIONINSIGHTS_CONNECTION_STRING` for Application Insights integration [App settings reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings).

When managing application settings via REST APIs or ARM templates, remember that the operation replaces the existing settings. You must include all existing settings when adding or modifying them. Using Azure CLI or PowerShell is safer as it merges changes [App settings reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings).

## Practical example: Configuring logging and secrets

Consider a function app that needs to log to Application Insights and connect to a storage account. The storage account connection string is a secret. The logging level is a configuration choice.

1.  **In `host.json`:** Define the base logging level and Application Insights sampling.

    ```json
    {
      "version": "2.0",
      "logging": {
        "logLevel": {
          "default": "Warning",
          "Function.MyFunction": "Information"
        },
        "applicationInsights": {
          "samplingSettings": {
            "isEnabled": true,
            "excludedTypes": "Request"
          }
        }
      }
    }
    ```

    This file is checked into source control. It ensures that every deployment starts with a consistent logging baseline.

2.  **In Application Settings:** Set the storage connection string and override the default log level for development.

    *   `AzureWebJobsStorage`: `DefaultEndpointsProtocol=https;AccountName=...` (Secret)
    *   `APPLICATIONINSIGHTS_CONNECTION_STRING`: `InstrumentationKey=...` (Secret)
    *   `AzureFunctionsJobHost__logging__logLevel__default=Debug` (Override for Dev)

    In production, you would not set the override, so the `host.json` `Warning` level applies. In development, the application setting overrides it to `Debug`.

## Verification and cleanup

After configuring your settings:

1.  **Verify `host.json`:** Ensure the file is valid JSON and that the `extensionBundle` version is appropriate for your runtime version. An invalid `host.json` can prevent the function app from starting [host.json reference for Azure Functions 2.x](https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json).
2.  **Verify Application Settings:** Use the Azure CLI to list settings and confirm they are present.

    ```bash
    az functionapp config appsettings list --name <APP_NAME> --resource-group <RG_NAME>
    ```

3.  **Check for Restarts:** Monitor the function app logs after changing application settings to ensure the restart completes successfully. If the app fails to start, check for typos in setting names or invalid values.
4.  **Clean Up:** Remove any deprecated settings like `AzureWebJobsDashboard` if you are on v4 [App settings reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings). Ensure that read-only App Service settings are not being modified by your deployment scripts [App settings reference for Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings).

The boundary between `host.json` and application settings is about stability versus flexibility. Use `host.json` for the stable, shared configuration. Use application settings for the variable, environment-specific, and secret data. This separation keeps your codebase clean and your deployments predictable.
