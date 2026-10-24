---
title: "Trace a blocked outbound connection in Azure Firewall logs"
description: "Trace blocked Azure Firewall traffic using structured logs, legacy diagnostics, and DNS proxy checks."
pubDate: 2024-08-03
category: governance
tags: ["azure-firewall", "networking", "troubleshooting", "structured-logs", "kql"]
translationKey: trace-a-blocked-outbound-connection-in-azure-firewall-logs
draft: false
---

An application cannot reach an external endpoint. The first thing to establish is whether Azure Firewall is blocking the traffic and, if so, which rule is responsible. Azure Firewall logs provide the evidence needed to distinguish between a policy decision, a DNS failure, or a routing issue.

## Confirm log collection is active

[![Azure Firewall Blocked Traffic Trace Flow](/images/posts/2024/azc-077-checkpoints.svg)](/images/posts/2024/azc-077-checkpoints.svg)

Before analysing traffic, ensure the firewall is sending logs to a destination you can query. Azure Firewall supports two logging methods: legacy Azure Diagnostics logs and Structured Firewall Logs. Structured logs are the recommended approach because they use a predefined schema that ensures consistent field availability for searching and filtering [1].

If you are using the legacy Azure Diagnostics logs, you must enable diagnostic settings for each log category individually. The three service-specific legacy logs available are:

* Azure Firewall Application Rule (Legacy Azure Diagnostics)
* Azure Firewall Network Rule (Legacy Azure Diagnostics)
* Azure Firewall Dns Proxy (Legacy Azure Diagnostics)

You can enable these via the Azure portal, PowerShell, or the Azure CLI. For example, using the Azure CLI, you would run:

```azurecli
az monitor diagnostic-settings create -n 'toLogAnalytics'
--resource '/subscriptions/<subscriptionId>/resourceGroups/<resource group name>/providers/Microsoft.Network/azureFirewalls/<Firewall name>'
--workspace '/subscriptions/<subscriptionId>/resourceGroups/<resource group name>/providers/microsoft.operationalinsights/workspaces/<workspace name>'
--logs "[{\"category\":\"AzureFirewallApplicationRule\",\"Enabled\":true}, {\"category\":\"AzureFirewallNetworkRule\",\"Enabled\":true}, {\"category\":\"AzureFirewallDnsProxy\",\"Enabled\":true}]" 
--metrics "[{\"category\": \"AllMetrics\",\"enabled\": true}]"
```

This is an illustrative example of the command structure. Ensure you replace the placeholder values with your actual subscription, resource group, firewall, and workspace identifiers. Activity logging is enabled by default for every Resource Manager resource, but diagnostic logging requires this explicit configuration [2].

If you are using Structured Firewall Logs, you should enable them using Resource Specific Tables rather than the AzureDiagnostics table. This provides a more efficient query experience. The configuration process is similar but targets the structured log categories.

## Identify the blocked traffic

Once logs are flowing, you can query for denied traffic. The specific table and columns depend on the log type you have enabled.

### Using Structured Firewall Logs

Structured logs use dedicated tables. For network rules, the table is `AzureFirewallNetworkRule`. For application rules, it is `AzureFirewallApplicationRule`. To find blocked traffic, filter for the `Action` column with a value of `Deny`.

For a network rule block, the query might look like this:

```kql
AzureFirewallNetworkRule
| where Action == "Deny"
| project TimeGenerated, SourceIp, DestinationIp, Protocol, Port, RuleName
| order by TimeGenerated desc
```

For an application rule block, the query is similar but focuses on the application-specific fields:

```kql
AzureFirewallApplicationRule
| where Action == "Deny"
| project TimeGenerated, SourceIp, DestinationIp, Fqdn, Protocol, Port, RuleName
| order by TimeGenerated desc
```

These queries return the source IP, destination IP, protocol, port, and the name of the rule that denied the traffic. If the `RuleName` is empty, the traffic was blocked by the default deny rule at the end of the rule collection.

### Using Legacy Azure Diagnostics Logs

If you are using legacy logs, the data resides in the `AzureDiagnostics` table. The structure is less rigid, so you need to extract the relevant fields using the `extract` or `parse` functions, or by querying the `s` (source) and `d` (destination) fields which contain the log details.

For example, to find denied network rules:

```kql
AzureDiagnostics
| where Category == "AzureFirewallNetworkRule"
| where log_s contains "Deny"
| project TimeGenerated, SourceIp, DestinationIp, Protocol, Port, RuleName
| order by TimeGenerated desc
```

Note that the legacy logs may contain more noise and require more complex parsing to extract consistent fields. Structured logs are preferred for this reason.

## Check DNS resolution

If the traffic is not blocked by a network or application rule, it might be failing at the DNS layer. Azure Firewall has a built-in DNS proxy. If the DNS proxy is enabled and configured, it logs DNS queries and responses.

To check for DNS failures, query the `AzureFirewallDnsProxy` log category (legacy) or the corresponding structured table.

For legacy logs:

```kql
AzureDiagnostics
| where Category == "AzureFirewallDnsProxy"
| where log_s contains "NXDOMAIN" or log_s contains "NoResult"
| project TimeGenerated, SourceIp, Fqdn, ResponseCode
| order by TimeGenerated desc
```

For structured logs, you would query the `AzureFirewallDnsProxy` table and filter for failed response codes.

If the DNS proxy is not enabled, Azure Firewall does not perform DNS resolution for the traffic and therefore generates no DNS proxy logs. In this case, verify the VNet and subnet DNS settings point to a functional DNS server.

## Verify rule collections

Once you have identified the rule that blocked the traffic, you need to verify the rule collection configuration. Azure Firewall processes rules in order of priority within a rule collection. If a traffic flow matches a rule in a higher-priority collection, it is processed there and does not reach lower-priority collections.

Check the rule collection that contains the matching rule. Ensure that the rule is correctly configured with the intended source addresses, destination addresses, protocols, and ports. For application rules, verify the fully qualified domain names (FQDNs) or tags.

If the traffic is being blocked by the default deny rule, it means no explicit rule matched the traffic. In this case, you need to add a rule to allow the traffic. Be specific with the rule to avoid overly permissive policies.


Reference: [Overview of Azure Firewall logs and metrics](https://learn.microsoft.com/en-us/azure/firewall/logs-and-metrics).
