---
title: "Create a useful KQL query for an initial investigation"
description: "Construct a focused KQL query for initial threat investigation using union, where, and project operators."
pubDate: 2024-04-26
category: governance
tags: ["kql", "advanced-hunting", "threat-investigation", "microsoft-defender-xdr", "sentinel"]
translationKey: create-a-useful-kql-query-for-an-initial-investigation
draft: true
---

When you begin investigating a potential incident, the immediate challenge is often not finding the data, but narrowing it down to what matters. A broad search across all tables and time ranges will likely time out or return so much noise that the signal is lost. The practical answer is to start with a focused query that unions relevant tables, applies a strict time filter, and projects only the columns you need to make a decision.

This approach works because Kusto Query Language (KQL) processes data in a pipeline. Each step passes its output to the next. If you filter early, you reduce the volume of data flowing through the rest of the pipeline, which improves performance and prevents timeouts. You also avoid the cognitive overload of sifting through irrelevant events.

[![KQL Query Pipeline Flow](/images/posts/2024/azc-042-checkpoints.svg)](/images/posts/2024/azc-042-checkpoints.svg)

## Start with a clear scope and intent

Before writing a single operator, define what you are looking for and where it might live. In a typical endpoint investigation, you might suspect PowerShell is being used to download malicious content. This suspicion points you to process execution events and network connection events. You do not need to search email logs or identity sign-in logs yet. By limiting your scope to these two data sources, you keep the query manageable.

You also need to decide on a time window. Searching the last 30 days for a specific command string is likely to return thousands of results, many of which are benign. A seven-day window is a sensible starting point for an initial investigation. It balances recency with the likelihood that the malicious activity occurred recently enough to be actionable. Remember that Kusto time filters are in UTC, regardless of your local timezone settings.

## Build the query pipeline

A useful investigation query follows a logical structure: get the data, filter it, and shape the output. We can illustrate this with a query that looks for PowerShell processes that may have attempted to download files.

```kusto
// Finds PowerShell execution events that could involve a download
union DeviceProcessEvents, DeviceNetworkEvents
| where Timestamp > ago(7d)
| where FileName in~ ("powershell.exe", "powershell_ise.exe")
| where ProcessCommandLine has_any("WebClient",
    "DownloadFile",
    "DownloadData",
    "DownloadString",
    "WebRequest",
    "Shellcode",
    "http",
    "https")
| project Timestamp, DeviceName, InitiatingProcessFileName, InitiatingProcessCommandLine,
FileName, ProcessCommandLine, RemoteIP, RemoteUrl, RemotePort, RemoteIPType
| top 100 by Timestamp
```

This query is an illustrative example. It demonstrates the structure you should follow, but you should adapt the table names and column filters to match your specific environment and the threat indicators you are tracking.

### Union the relevant tables

The query begins with a `union` of `DeviceProcessEvents` and `DeviceNetworkEvents`. This combines two distinct data sources into a single result set. You might wonder why you do not just search one table. The answer is that the evidence is often split. A process might spawn a network connection, and linking them requires looking at both. The `union` operator allows you to search across both tables simultaneously, ensuring you do not miss related events.

### Filter early and specifically

The next step is to apply filters using the `where` operator. The first filter restricts the results to the last seven days:

```kusto
| where Timestamp > ago(7d)
```

This is critical for performance. By filtering early, you ensure that subsequent operations only process events within this window. The next filter narrows the focus to PowerShell processes:

```kusto
| where FileName in~ ("powershell.exe", "powershell_ise.exe")
```

The `in~` operator performs a case-insensitive match. This is important because attackers may use different casing to evade simple string matches. The final filter looks for suspicious command-line strings:

```kusto
| where ProcessCommandLine has_any("WebClient",
    "DownloadFile",
    "DownloadData",
    "DownloadString",
    "WebRequest",
    "Shellcode",
    "http",
    "https")
```

The `has_any` operator checks if the command line contains any of the specified strings. This is more efficient than writing multiple `or` conditions. It also allows you to catch variations in how attackers might phrase their commands.

### Shape the output

Once you have filtered the data, you need to present it in a way that is easy to analyse. The `project` operator allows you to select only the columns you need:

```kusto
| project Timestamp, DeviceName, InitiatingProcessFileName, InitiatingProcessCommandLine,
FileName, ProcessCommandLine, RemoteIP, RemoteUrl, RemotePort, RemoteIPType
```

By projecting only these columns, you reduce the amount of data returned and make the results easier to read. You can also use the `top` operator to limit the number of results:

```kusto
| top 100 by Timestamp
```

This ensures that you are not overwhelmed by too many results. If you need more than 100 results, you can adjust this number or add additional filters to narrow the scope further.

## Verify and iterate

After running the query, review the results. Do they match your expectations? Are there false positives that you can filter out? If the results are too broad, add more specific filters. If they are too narrow, relax some of the conditions. This iterative process is key to building effective investigation queries.

You can also use the schema tree in your advanced hunting tool to explore available tables and columns. This helps you understand the data structure and identify relevant fields for your queries. Additionally, you can use autosuggest features to speed up the writing process.

Remember that a query is only as good as the decisions it enables. If the results do not provide enough context to make a decision, refine the query. If they do, use the information to guide your next steps in the investigation.

## Common pitfalls to avoid

One common mistake is to place the `take` or `top` operator too early in the pipeline. If you limit the results before sorting or filtering, you may miss the most relevant events. Always apply filters and sorting before limiting the output.

Another pitfall is to ignore the time zone. KQL uses UTC for time filters, so ensure that your time ranges are adjusted accordingly. If you are investigating an event that occurred at a specific local time, convert it to UTC before adding it to your query.

Finally, do not assume that a single query will solve all your investigation needs. Use multiple queries to explore different aspects of the incident. You can run multiple queries in the same editor by separating them with empty lines, which allows you to experiment with different approaches without losing your work.

By following this structured approach, you can build effective KQL queries that help you investigate threats efficiently. Start with a clear scope, filter early, and shape your output to support decision-making. Iterate based on the results, and always verify your assumptions against the data.

When you have a query that consistently returns relevant results, save it for future use. You can share it with your team to standardise investigation processes and improve response times. Over time, you will build a library of queries that help you respond to incidents more effectively.

References for Create a useful KQL query for an initial investigation: [Learn the advanced hunting query language in Microsoft Defender XDR](https://github.com/MicrosoftDocs/microsoft-365-docs/blob/bbffa703a5a0110b300ca66c9e0a596e6a158ed8/microsoft-365/security/defender/advanced-hunting-query-language.md), [Kusto Query Language in Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/kusto-overview).
