---
title: "Investigate a server that stopped sending logs"
description: "Troubleshoot a Linux server that stopped sending logs by tracing the signal from the agent to the workspace."
pubDate: 2024-09-05
category: governance
tags: ["azure-monitor", "azure-monitor-agent", "data-collection-rules", "log-analytics", "troubleshooting"]
translationKey: investigate-a-server-that-stopped-sending-logs
draft: false
---

A Linux server has stopped sending logs. The first thing to check is whether the server is still sending heartbeats. The heartbeat is the simplest signal of connectivity between the agent and Azure Monitor. If the heartbeat stops, the problem is local to the agent or the machine. If the heartbeat continues but no other logs appear, the problem is likely in the Data Collection Rule (DCR) configuration or workspace limits.

## Check the heartbeat status

[![Log Collection Failure Decision Flow](/images/posts/2024/azc-089-checkpoints.svg)](/images/posts/2024/azc-089-checkpoints.svg)

Run this query in your Log Analytics workspace to list machines that have not reported a heartbeat in the last five minutes:

```kusto
Heartbeat 
| where TimeGenerated > ago(24h)
| summarize LastCall = max(TimeGenerated) by Computer, _ResourceId
| where LastCall < ago(5m)
```

If the machine appears in this list, the agent is not communicating with Azure Monitor. Check the agent service status on the Linux machine:

```bash
systemctl status azuremonitoragent
```

If the service is not running, start it and check the core agent logs at `/var/opt/microsoft/azuremonitoragent/log/mdsd.*` for errors. If the service is running but still not reporting, verify that the Azure Monitor Linux Agent extension is provisioned successfully in the Azure portal under **Extensions + applications**. If the extension status is not 'Provisioning succeeded', check the extension logs at `/var/log/azure/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent/` for installation errors.

## Verify the Data Collection Rule

If the heartbeat is present, the agent is communicating with Azure Monitor, but logs are not being collected. Next, verify that the Data Collection Rule (DCR) is correctly associated with the virtual machine. Open the DCR in the Azure portal and check the **Resources** tab to ensure the virtual machine is listed. If it is not, add the machine to the DCR.

Also, confirm that the agent has downloaded the latest DCR configuration. Check the local cache at `/etc/opt/microsoft/azuremonitoragent/config-cache/configchunks/` for the latest configuration files. If the DCR is not present or is outdated, the agent may not be able to fetch it from the Azure Monitor Configuration Service (AMCS). This can happen if the agent cannot reach the AMCS endpoint or if there are network restrictions.

## Check workspace limits

A daily cap or ingestion rate limit can cause data collection to stop. Run this query to check if the daily cap has been reached:

```kusto
Operation | where OperationCategory == 'Data Collection Status'
```

If the `OperationStatus` is 'Warning', the daily cap has been reached. You can either wait for the reset time or increase the daily data volume limit. Similarly, check for ingestion rate limits:

```kusto
Operation 
| where OperationCategory == "Ingestion" 
| where Detail startswith "The rate of data crossed the threshold"
```

If the ingestion rate limit is reached, some data is being dropped. You can request an increase to the workspace limit by sending an email to LAIngestionRate@microsoft.com or opening a support request.

## Troubleshoot syslog specifically

For syslog collection issues specifically, check the QoS file at `/var/opt/microsoft/azuremonitoragent/log/mdsd.qos` for CSV-format 15-minute aggregations of processed events. This file can help track syslog event ingestion drops. If the agent is receiving syslog events but not uploading them, check the rsyslog or syslog-ng configuration to ensure the Azure Monitor Agent configuration files are present and accessible.

If you suspect a configuration error, you can enable trace logging by appending the trace flag `-T 0x2002` to the `MDSD_OPTIONS` in `/etc/default/azuremonitoragent` and restarting the agent. This will generate detailed debug information in `/var/opt/microsoft/azuremonitoragent/log/mdsd.info`. Remember to remove the trace flag after debugging to avoid filling up the disk.

## Arc-enabled server considerations

If the machine is an Arc-enabled server, check for 'Failed to get MSI token from IMDS endpoint' errors in the agent logs. This may indicate that the `syslog` user is not a member of the `himds` group. Add the `syslog` user to the `himds` group if necessary.

Verify log ingestion by running a search query for the server's hostname in the Log Analytics workspace within the last 10 minutes.

References for Investigate a server that stopped sending logs: [Troubleshoot the Azure Monitor agent on Linux virtual machines and scale sets](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-troubleshoot-linux-vm), [Troubleshoot why data is no longer being collected in Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/data-collection-troubleshoot).
