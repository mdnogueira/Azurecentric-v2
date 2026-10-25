---
title: "Investigate a function timeout without changing every setting"
description: "Troubleshoot Azure Functions timeouts by using built-in diagnostics and streaming logs to isolate the cause before changing configuration."
pubDate: 2025-05-26
category: apps
tags: ["azure-functions", "troubleshooting", "diagnostics", "logging", "timeout"]
translationKey: investigate-a-function-timeout-without-changing-every-setting
draft: false
---

A function times out. The instinct is often to increase the timeout setting, change the plan, or restart the app. Before touching configuration, you need to know whether the function is failing to start, hanging during execution, or being terminated by the platform because it exceeded its quota.

Azure Functions provides two primary diagnostic paths that require no extra configuration or complex setup: the built-in **Diagnose and solve problems** blade and **Streaming logs**. Using these tools in sequence lets you isolate the cause without guessing.

## Step 1: Use the built-in diagnostic blade

The first thing to check is whether Azure Functions has already identified a structural or resource issue. The **Diagnose and solve problems** blade runs a series of automated checks against your function app.

1. Navigate to your function app in the Azure portal.
2. Select **Diagnose and solve problems** from the left-hand menu.
3. In the search bar, type `execution` or `timeout` to filter relevant reports.

The diagnostic tool, often referred to as Genie, presents a list of topics related to your issue. Select the most relevant tile, such as **Function App Down or Reporting Errors**, to view a detailed report. This report includes status icons, descriptions of issues, recommended actions, and related metrics.

If your function is a Durable Function, you can also search specifically for **Durable Functions** in the diagnostic blade. This detector checks for common problems specific to that extension, such as version mismatches or performance bottlenecks, and provides links to relevant documentation.

The diagnostic reports are generated from a series of checks run on your app. They are useful for pinpointing problems like high CPU usage or memory pressure, which can indirectly cause timeouts. For example, the **High CPU Analysis** detector might show that a single app is consuming excessive resources, suggesting a restart or scale-up as a solution.

## Step 2: Stream execution logs

If the diagnostic blade does not reveal an obvious configuration error, you need to see what the function is doing in real time. Streaming logs allow you to observe the execution flow and identify where the function hangs or throws an exception.

There are two main methods for viewing logs:

### Live Metrics Stream (Recommended)

This is the recommended method for production environments, especially if your function app is running on multiple instances or on Linux in a Consumption plan. It requires your function app to be connected to Application Insights.

1. In the Azure portal, navigate to your function app.
2. Select the **Overview** tab.
3. Under **Configured features**, click the link to your Application Insights resource.
4. In the Application Insights blade, select **Live Metrics Stream**.

This view displays sampled log entries in near real-time. Because it uses sampled data, it is lightweight and works across multiple instances. However, sampling means you might not see every single execution, so you may need to trigger the function multiple times to capture the failure.

### Built-in Log Streaming

For development or single-instance scenarios, you can use the built-in log streaming feature. This is equivalent to the output seen when debugging locally.

1. In the Azure portal, navigate to your function app.
2. Select the **Platform features** tab.
3. Under **Monitoring**, choose **Log streaming**.

This method displays all log-based information. However, it supports only a single instance. If your function is scaled to multiple instances, data from other instances will not be shown. Additionally, built-in log streaming is not enabled for function apps running on Linux in a Consumption plan.

You can also view logs in Visual Studio Code or via Core Tools. In VS Code, use the command **Azure Functions: Start Streaming Logs**. In Core Tools, run:

```bash
func azure functionapp logstream <FunctionAppName>
```

## Step 3: Analyse the findings

Once you have the logs or diagnostic report, look for specific patterns:

* **Startup failures**: If the logs show exceptions during initialization, the function may never reach the execution phase. Check for missing dependencies or configuration errors.
* **Long-running operations**: If the function is performing a heavy task, it might be hitting the default timeout limit. The diagnostic report might highlight high CPU or memory usage.
* **External dependencies**: If the function is waiting on an external service, the logs might show a hang. Check if the timeout is due to network latency or a downstream service issue.

If the diagnostic blade suggests a specific action, such as restarting the site or scaling up, follow that recommendation. Otherwise, use the log stream to identify the exact line of code or operation causing the delay.

## Verification

After applying a fix, verify the resolution by:

1. Triggering the function again.
2. Checking the **Live Metrics Stream** or **Log streaming** to ensure the execution completes within the expected time.
3. Reviewing the **Diagnose and solve problems** blade to confirm that no new issues are reported.

If the function still times out, consider whether the timeout setting itself is appropriate for the workload. Increasing the timeout is a valid step, but only after you have confirmed that the function is not failing due to a bug or resource constraint.

For more detailed monitoring, refer to the [Azure Functions diagnostics overview](https://learn.microsoft.com/en-us/azure/azure-functions/functions-diagnostics) and [Stream execution logs](https://learn.microsoft.com/en-us/azure/azure-functions/streaming-logs) documentation.
