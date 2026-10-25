---
title: "Use a watchlist to enrich a detection query"
description: "Create and use Microsoft Sentinel watchlists to enrich KQL detection queries with reference data."
pubDate: 2025-01-28
category: governance
tags: ["microsoft-sentinel", "watchlists", "kql", "security-operations", "threat-detection"]
translationKey: use-a-watchlist-to-enrich-a-detection-query
draft: false
---

You need to correlate security events with a list of known entities, such as high-value assets, terminated employees, or specific IP addresses. Hardcoding these values into detection rules makes them brittle and difficult to maintain. Microsoft Sentinel watchlists provide a managed way to store this reference data in your workspace, allowing you to join or filter events directly in KQL.

Watchlists are stored in the `Watchlist` table within your Sentinel workspace as name-value pairs. They are cached for optimal query performance, which is essential when running frequent searches or scheduled analytics rules. However, they are designed for reference data, not large datasets. The total number of active watchlist items across all watchlists in a single workspace is limited to 10 million [Watchlists in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists#limitations-of-watchlists). If your reference data exceeds this or requires more frequent updates than the watchlist refresh cycle allows, consider ingesting it using custom logs instead [Watchlists in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists#limitations-of-watchlists).

## Prepare the reference data

Before creating the watchlist, you need a CSV file containing the data you want to correlate. The file must include a header row. You also need to decide which column will serve as the **SearchKey**. This is the column you expect to use for joins or frequent searches. For example, if you are tracking IP addresses, the `IPAddress` column should be the SearchKey [Create new watchlists](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-create).

If your file is small (under 3.8 MB), you can upload it directly from your local machine. For larger files (up to 500 MB), you must upload the CSV to an Azure Storage account and provide a Shared Access Signature (SAS) URL. Note that the ability to create watchlists from Azure Storage files is currently in **PREVIEW**, which means it is subject to the Azure Preview Supplemental Terms and may not be suitable for production workloads without careful consideration [Watchlists in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists#limitations-of-watchlists), [Create new watchlists](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-create).

## Create the watchlist

You can create a watchlist from either the Azure portal or the Microsoft Defender portal. The steps are similar in both interfaces.

1. Navigate to **Microsoft Sentinel** > **Configuration** > **Watchlist** [Create new watchlists](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-create).
2. Select **+ New** to start the wizard [Create new watchlists](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-create).

   :::image type="content" source="/images/posts/2025/azc-141-learn-1.png" alt-text="Screenshot of add watchlist option on watchlist page." lightbox="/images/posts/2025/azc-141-learn-1.png":::

3. On the **General** tab, provide a name, description, and alias for the watchlist. The name and alias must be between 3 and 64 characters, starting and ending with an alphanumeric character [Watchlists in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists#limitations-of-watchlists).
4. On the **Source** tab, select **CSV file with a header**.
5. Upload your file or provide the Azure Storage SAS URL if using the preview feature.
6. Enter the **SearchKey** column name. This is critical for query performance [Build queries or rules with watchlists - Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-queries).
7. Review the configuration and select **Create**.

It may take several minutes for the watchlist to be created and the data to become available in queries [Create new watchlists](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-create).

## Use the watchlist in a detection query

Once the watchlist is active, you can reference it in KQL using the `_GetWatchlist` function. This function returns the name-value pairs of the specified watchlist. You can use it in `join`, `lookup`, or `where` clauses.

### Filtering events

To filter events based on the watchlist, you can use the `in` operator. For example, to find heartbeats from IP addresses listed in a watchlist named `ipwatchlist`:

```kusto
// Illustrative example: not tested
let watchlist = (_GetWatchlist('ipwatchlist') | project IPAddress);
Heartbeat
| where ComputerIP in (watchlist)
```

Alternatively, you can use the watchlist inline:

```kusto
// Illustrative example: not tested
Heartbeat
| where ComputerIP in (
    (_GetWatchlist('ipwatchlist')
    | project SearchKey)
)
```

Using the `SearchKey` directly in the `project` clause is recommended for optimal performance [Build queries or rules with watchlists - Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-queries).

### Enriching events with lookup

To add watchlist data to your events, use the `lookup` operator. This is useful for enriching events with additional context, such as a location or owner name.

```kusto
// Illustrative example: not tested
Heartbeat
| lookup kind=leftouter _GetWatchlist('mywatchlist') 
  on $left.RemoteIPCountry == $right.SearchKey
```

This query joins the `Heartbeat` table with the watchlist, matching the `RemoteIPCountry` column to the watchlist's `SearchKey`. The `kind=leftouter` ensures that all heartbeats are returned, even if there is no match in the watchlist [Build queries or rules with watchlists - Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-queries).

## Verify and maintain

After creating the watchlist, verify its availability by running a simple query in Log Analytics. You can also view the list of all watchlist aliases using the `_GetWatchlistAlias` function [Build queries or rules with watchlists - Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-queries).

Be aware that watchlists are refreshed in your workspace every 12 days, updating the `TimeGenerated` field [Watchlists in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists#limitations-of-watchlists). This does not mean the data is stale for 12 days; it refers to a system-level timestamp update mechanism. If you need more frequent updates, you may need to recreate the watchlist or use a different data source. Also, local file uploads are limited to 3.8 MB, and large file uploads from Azure Storage are in preview [Create new watchlists](https://learn.microsoft.com/en-us/azure/sentinel/watchlists-create).

For complex scenarios, consider using custom logs if your reference data exceeds the 10 million item limit or requires more frequent updates than the watchlist refresh cycle allows [Watchlists in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/watchlists#limitations-of-watchlists).

Start with a small, representative dataset to validate your query logic before expanding the watchlist or deploying it to production analytics rules. This approach minimises the risk of performance issues or incorrect correlations.
