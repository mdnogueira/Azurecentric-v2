---
title: "Configure Application Insights for an application deployment"
description: "Enable Application Insights for App Service or Functions, verify telemetry, and distinguish it from platform diagnostics."
pubDate: 2024-06-21
category: apps
tags: ["application-insights", "azure-monitor", "app-service", "azure-functions", "monitoring"]
translationKey: configure-application-insights-for-an-application-deployment
draft: true
---

You have deployed an application on Azure App Service or Azure Functions. The next step is to gain visibility into its performance, availability, and usage. The standard approach is to enable Application Insights. This service provides deep insights into application operations, monitoring availability, performance, and usage so you can identify and diagnose errors without waiting for a user to report them.

Application Insights is part of Azure Monitor. It uses the powerful data analysis platform to provide telemetry that helps you understand how your application behaves in production. While App Service and Azure Functions provide built-in diagnostics logging for debugging, Application Insights offers dedicated application performance management capabilities for additional telemetry and logs.

[![Application Insights Integration Flow](/images/posts/2024/azc-062-checkpoints.svg)](/images/posts/2024/azc-062-checkpoints.svg)

## Choose the right monitoring approach

Before enabling Application Insights, it is useful to understand where it fits in the broader monitoring landscape. Azure App Service and Azure Functions offer several monitoring options, each suited to different scenarios:

*   **Diagnostic Settings:** Best for monitoring platform metrics and logs, exporting data to Log Analytics, Storage accounts, or Event Hubs.
*   **Application Insights:** Ideal for monitoring application performance and usage, providing deep insights into operations.
*   **Log Stream:** Useful for monitoring built-in logs for testing and development, giving quick access to output and errors.
*   **Quotas and Alerts:** For monitoring resource limits and configuring alerts based on metrics.
*   **Activity Logs:** For monitoring resource events, such as creation, update, or deletion of the app.

If your primary goal is to understand how your application performs for users, detect exceptions, and track dependencies, Application Insights is the appropriate choice. If you need to analyse platform-level logs or export data for compliance, Diagnostic Settings may be more suitable. You can use both, but they serve different purposes.

## Enable Application Insights via the Azure Portal

The Azure portal provides a streamlined way to enable Application Insights for your App Service or Function App. This process integrates the monitoring agent with your application.

1.  Navigate to your App Service or Function App resource in the Azure portal.
2.  In the left-hand menu, select **Application Insights**. This opens the Application Insights integration settings.
3.  Select **Enable**. You will be prompted to create a new Application Insights resource or select an existing one. Choose the appropriate option based on your organisation's resource management strategy.
4.  Confirm the selection. The portal will provision the Application Insights resource and configure the integration with your app.

Once enabled, you can access the Application Insights blade from the left-hand menu of your App Service or Function App. Here, you can view live metrics, failures, performance, and usage data.

## Verify the integration

After enabling Application Insights, it is important to verify that telemetry is being collected. The first thing to check is the **Live Metrics Stream**. This feature provides near-real-time visibility into the health and performance of your application. If you see data flowing, the integration is working.

You can also check the **Failures** blade to see if any exceptions are being reported. If your application has been running for a short time, you may not see many failures, but the presence of any data confirms that the agent is functioning.

For Azure Functions, the **Diagnose and solve problems** tool also includes specific detectors for common issues. For example, the **Durable Functions detector** can help diagnose problems specific to Durable Functions applications. You can search for "Durable Functions" in the diagnostics tool to access this detector.



## Understand the data you are collecting

Application Insights collects a wide range of telemetry data, including requests, dependencies, exceptions, and performance counters. This data is stored in the Application Insights resource, which is a distinct resource type that uses Log Analytics technology but is not a Log Analytics workspace itself. It has its own schema, retention policies, and pricing tiers.

You can query this data using Kusto Query Language (KQL) in the **Logs** blade. For example, you can query for all requests that failed with a 500 status code:

```
requests
| where success == false
| where resultCode == "500"
| project name, resultCode, url, timestamp
```

This query helps you identify specific errors in your application. You can also query for dependencies to understand how long external services are taking to respond:

```
dependencies
| where success == false
| project name, resultCode, target, duration, timestamp
```

## Considerations for Azure Functions

If you are using Azure Functions, the process is similar, but there are some additional considerations. Azure Functions diagnostics is an intelligent and interactive experience that helps you troubleshoot issues with no configuration or extra cost. However, for deeper application performance monitoring, Application Insights is still the recommended approach.

When enabling Application Insights for Azure Functions, ensure that the correct runtime version is selected. The integration may behave differently depending on the runtime stack (e.g., .NET, Node.js, Python). Refer to the Application monitoring for App Service documentation for specific guidance on your runtime.

## Next steps

Once Application Insights is enabled, you can start setting up alerts based on the telemetry data. For example, you can create an alert rule that triggers when the number of failed requests exceeds a certain threshold. This allows you to proactively respond to issues before they impact users.

You can also integrate Application Insights with Visual Studio to support your DevOps processes. This integration allows you to debug issues in development and then monitor them in production.

For more detailed information on monitoring Azure App Service, refer to the Monitor Azure App Service documentation. For Azure Functions, see the [Azure Functions diagnostics Overview](https://learn.microsoft.com/en-us/azure/azure-functions/functions-diagnostics).
