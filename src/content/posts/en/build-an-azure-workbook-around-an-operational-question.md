---
title: "Build an Azure workbook around an operational question"
description: "Build an Azure workbook around a specific operational question using parameters, queries, and text."
pubDate: 2024-10-31
category: governance
tags: ["azure-workbooks", "azure-monitor", "kql", "observability", "azure-portal"]
translationKey: build-an-azure-workbook-around-an-operational-question
draft: false
---

You have an operational question that keeps coming up in your team's monitoring routine. It might be "Why did latency spike last Tuesday?" or "Which storage accounts are consuming most of our egress budget?" The first step is not to open the workbook editor and start dragging controls. It is to define the question precisely enough that the data sources and parameters can answer it.

Azure Workbooks are designed to combine text, log queries, metrics, and parameters into a single interactive report. They are not just static dashboards; they are canvases for freeform exploration and structured analysis. The key to a useful workbook is treating it as a conversation with your data, where parameters guide the query and text provides the context.

## Define the operational question

Start by writing down the question in plain English. For this example, let's use: "Which virtual machines in our subscription had CPU utilisation above 80% in the last 24 hours?"

This question dictates three things:
1. **The data source**: You need metrics data, specifically CPU utilisation, which is available via Azure Monitor metrics.
2. **The scope**: You need to query across a subscription, so you will need a parameter to select the subscription or resource group.
3. **The time range**: You need a time window, which will be another parameter.

By defining the question first, you avoid the common mistake of building a workbook that shows too much data or requires manual editing of queries every time you want to run it.

## Add parameters to scope the query

Parameters are the control knobs of your workbook. They allow you to collect input from consumers and reference it in other parts of the workbook. For our question, we need two parameters: one for the time range and one for the resource scope.

1. Open the workbook in **Edit** mode.
2. Select **Add** and then **Add parameter**.
3. For the time range:
   - **Parameter name**: `TimeRange`
   - **Display name**: `Time Range`
   - **Parameter type**: `TimeRange`
   - **Required**: `Yes`
4. For the resource scope:
   - **Parameter name**: `SubscriptionId`
   - **Display name**: `Subscription`
   - **Parameter type**: `Resource` (or `Query` if you want to filter specific subscriptions)
   - **Required**: `Yes`

Parameters help you build interactive reports. Without them, you would have to hard-code the time range and resource scope into every query, making the workbook rigid and difficult to share.

## Add text for context

A workbook without context is just a set of numbers. Add a text block at the top of the workbook to explain the operational question and how to use the parameters.

1. Select **Add** and then **Add text**.
2. Enter markdown text that describes the question. For example:
   ```markdown
   ## CPU Utilisation Analysis
   This workbook answers the question: "Which virtual machines had CPU utilisation above 80% in the selected time range?"
   
   Use the parameters above to select the subscription and time range.
   ```
3. Use the **Text Style** option to switch between plain markdown and the portal's standard info/warning/success/error styling. For example, you might use the `info` style for general instructions and the `warning` style for any caveats about data latency.

Text can contain parameter values in the markdown text, and those parameter references are updated as the parameters change. This allows you to create dynamic narratives that adapt to the user's input.

## Add a query to answer the question

Now that you have the parameters and context, you can add the query that answers the operational question. For this example, we will use a Log Analytics query to fetch metric data.

1. Select **Add** and then **Add query**.
2. Select the **data source**. For metrics, you can use the `AzureMetrics` data source.
3. Enter the query. For our question, a sample query might look like this:
   ```kql
   AzureMetrics
   | where TimeGenerated >= {TimeRange:start}
   | where TimeGenerated < {TimeRange:end}
   | where ResourceId in ({SubscriptionId})
   | where MetricName == "CPU Percentage"
   | where Value > 80
   | summarize Count = count() by ResourceId, bin(TimeGenerated, 1h)
   | order by Count desc
   ```
   Note: The exact syntax may vary depending on the data source and the specific metric. Always refer to the [Azure Workbooks data sources](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-data-sources) documentation for supported queries.
4. Select the **visualization**. A table or a time-series chart might be appropriate here.
5. Select **Run Query** to verify the results.

When you're sure you have the query you want in the workbook, select **Done editing**. The query will now use the values from the parameters you defined earlier.

## Add a metric chart for visualisation

While a table is useful for detailed analysis, a chart can provide a quick visual overview. Add a metric chart to complement the query.

1. Select **Add** and then **Add metric**.
2. Select the **resource type** (e.g., `Virtual Machines`).
3. Select the **resources** to target (you can use the `SubscriptionId` parameter here).
4. Select the **metric namespace** and **metric name** (e.g., `Microsoft.Compute/virtualMachines` > `Percentage CPU`).
5. Set the **aggregation** (e.g., `Average`).
6. Set the **time range** (you can use the `TimeRange` parameter here).
7. Select **Done Editing**.

The metric chart will automatically update based on the parameters selected by the user. This provides a dynamic visualisation that reflects the current state of the data.

## Verify and share

Once you have added all the components, switch to **Read** mode to see how the workbook looks to the consumer. Test the parameters by selecting different subscriptions and time ranges. Ensure that the query and chart update correctly.

To share the workbook, you need to save it. Workbooks are saved to 'My Reports' by default, but you can save them to shared reports or templates. To save a shared workbook, you need write access to the parent resource group. To share it, select the **Share** icon from the top toolbar and copy the link. The person you share with must have **Monitoring Reader** permissions to view the workbook.

A workbook that answers a specific operational question is more useful than a generic dashboard. By defining the question, adding parameters, and combining text, queries, and metrics, you create an interactive report that helps your team make informed decisions quickly.

### Prerequisites
- Access to the Azure portal.
- **Monitoring Reader** or **Monitoring Contributor** role on the subscription or resource group where the workbook will be saved.
- A Log Analytics workspace or Azure Monitor metrics data source.

### Verification
- Open the workbook in **Read** mode.
- Select different values for the parameters.
- Verify that the query results and metric chart update correctly.
- Check that the text blocks provide clear context and instructions.

### Cleanup
- If the workbook is no longer needed, delete it from the **My Reports** or shared reports section.
- Ensure that any parameters or queries that reference sensitive data are removed or secured.

By following this approach, you can build workbooks that are not only visually appealing but also functionally robust and easy to use. The key is to start with the question, not the controls.

References for Build an Azure workbook around an operational question: [Create or edit an Azure Workbook](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-create-workbook), [Common Azure Workbooks tasks](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-getting-started), [Azure Workbooks overview](https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-overview).
