---
title: "Troubleshoot an application that fails to start in App Service"
description: "Troubleshoot App Service startup failures by enabling diagnostics, checking logs, and verifying configuration."
pubDate: 2024-08-13
category: apps
tags: ["azure-app-service", "troubleshooting", "diagnostics", "logging", "node-js", "windows"]
translationKey: troubleshoot-an-application-that-fails-to-start-in-app-service
draft: false
---

An application that fails to start in Azure App Service usually returns a 500, 502, or 503 error. The first step is not to restart the app, but to enable the diagnostics that explain why the process is not responding. Without logs, you are guessing at the root cause. With them, you can distinguish between a configuration error, a missing dependency, or a resource constraint.

## Enable diagnostics logging

App Service provides built-in diagnostics to assist with debugging. You need to enable these before you can see the internal state of the application. The logging options differ between Windows and Linux containers.

For Windows apps, navigate to your app in the Azure portal and select **App Service logs**. Enable **Application Logging (Filesystem)** or **Application Logging (Blob)**. The Filesystem option is suitable for temporary debugging, as it turns itself off after 12 hours. The Blob option is for long-term logging and includes additional metadata such as the origin VM instance ID and thread ID. Note that currently only .NET application logs can be written to blob storage; Java, PHP, Node.js, and Python logs are stored on the App Service file system.

Select the **Level** of verbosity you need. The **Error** level captures Error and Critical messages, while **Verbose** captures all categories including Trace and Debug. Save your settings.

For Linux apps or custom containers, the process is similar but simpler. In the **App Service logs** blade, select **File System** under Application logging. You can specify a disk quota in megabytes and a retention period in days. Save the configuration.

You can also enable **Web server logging** for Windows apps to capture raw HTTP request data in the W3C extended log file format. This is useful for identifying which requests are failing and at what stage. For detailed error pages, enable **Detailed Error Messages** or **Failed Request Tracing** to capture the HTML error pages or XML trace files that IIS generates. These are stored in the App Service file system and are retained up to 50 errors.

## Stream logs in real time

Once diagnostics are enabled, you can stream logs to see what is happening as you attempt to access the app. This is particularly useful for catching transient errors or startup sequences.

In the Azure portal, navigate to your app and select **Log stream**. This will display any information written to the console output or files ending in .txt, .log, or .htm in the `/home/LogFiles` directory. Be aware that some logging types buffer writes, which can result in out-of-order events in the stream.

You can also stream logs using Azure CLI in Cloud Shell or your local terminal. The following command streams logs for a specific app:

```azurecli-interactive
az webapp log tail --name <app-name> --resource-group <resource-group>
```

Note that this command may not work with web apps hosted in a Linux app service plan. To filter specific log types, such as HTTP logs, use the `--Provider` parameter:

```azurecli-interactive
az webapp log tail --name <app-name> --resource-group <resource-group> --provider http
```

## Collect data for deeper analysis

If streaming logs do not reveal the issue, you need to collect more detailed data. App Service provides an intelligent diagnostics tool that can guide you to the right information. Navigate to **Diagnose and solve problems** in the left menu of your app blade to access this tool.

You can also use the Kudu Debug Console, accessible at `https://<app-name>.scm.azurewebsites.net`. This dashboard provides a file system view, environment settings, and a debug console where you can run PowerShell or CMD commands. For Windows apps, you can use the Kudu console to access the `D:\home\LogFiles` directory, which contains application logs, failed request traces, and detailed error logs.

For Linux apps, the Kudu console provides access to the `/home/LogFiles` directory. You can download a ZIP file of the logs directly from the browser at `https://<app-name>.scm.azurewebsites.net/api/logs/docker/zip`.

If your application is crashing due to an uncaught exception, check the `logging-errors.txt` file in the Application logs directory. This file contains the stack trace, which is essential for diagnosing code-level issues. For Node.js applications on Windows, you can also check the `d:\home\LogFiles\Application\logging-errors.txt` file for details on why `node.exe` might have been killed.

## Verify configuration and dependencies

Startup failures are often caused by configuration errors. For Node.js applications on Windows, ensure that `node.exe` is present at the correct location and that the `nodeProcessCommandLine` setting in `web.config` points to the correct path. Also, verify that the main script file name in the handlers section of `web.config` matches the actual entry point of your application.

If your application is taking too long to start, you might encounter a timeout error. For Node.js apps, the default timeout in iisnode is 50 seconds, calculated as `maxNamedPipeConnectionRetry * namedPipeConnectionRetryDelay / 1000`. If your application takes longer than this to start, iisnode will return a 500 error. You can increase these values in `web.config` to match your application's start time.

For applications with many dependencies, such as Node.js apps with a large `node_modules` directory, startup can be slow due to the network share latency. Enabling local cache in App Service can significantly improve startup time by copying content from the network share to the local disk on the VM.

## Mitigate and recover

If you need to recover quickly while investigating, you can restart the app from the Azure portal or using Azure CLI. However, this is a temporary fix and does not address the root cause. For persistent issues, consider scaling up the App Service plan to provide more resources, or enabling AutoHeal to automatically recycle the worker process based on predefined triggers.

Always test troubleshooting steps on a non-production slot before applying them to production. This ensures that you do not inadvertently disrupt live traffic while diagnosing the issue.

By systematically enabling diagnostics, streaming logs, and verifying configuration, you can identify and resolve most application startup failures in Azure App Service. If the issue persists, consider reaching out to Azure support with the collected logs and diagnostic data.


References for Troubleshoot an application that fails to start in App Service: [Enable diagnostics logging](https://learn.microsoft.com/en-us/azure/app-service/troubleshoot-diagnostic-logs), [Fix HTTP 502 and HTTP 503 errors](https://learn.microsoft.com/en-us/azure/app-service/troubleshoot-http-502-http-503), [Node.js best practices and troubleshooting](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-nodejs-best-practices-and-troubleshoot-guide).
