---
title: "Review cluster event logs during a node failure"
description: "Diagnose Windows Server node failures using Failover Clustering events and, where applicable, Storage Spaces Direct Health Service faults."
pubDate: 2025-10-15
category: backup-dr
tags: ["failover-clustering", "windows-server", "troubleshooting", "health-service", "event-logs"]
translationKey: review-cluster-event-logs-during-a-node-failure
draft: true
---

A node drops out of a failover cluster. The immediate operational question is not why the node failed, but what the cluster recorded about the failure. Windows Server Failover Clustering (WSFC) provides a System log that records membership state changes. If the cluster is running Storage Spaces Direct, the Health Service adds a layer of fault reporting that identifies the specific hardware or software entity causing the disruption. Using these two sources together moves the investigation from "the node is down" to the specific component that needs attention.

## Check the System log for membership events

[![Node Failure Diagnosis Flow](/images/posts/2025/azc-234-checkpoints.svg)](/images/posts/2025/azc-234-checkpoints.svg)

The first step is to examine the Windows Server System log on the remaining active nodes, filtering for the source **FailoverClustering**. These events provide the timeline of the failure. When a node leaves the cluster, you are primarily looking for Event ID 1135: `EVENT_NODE_DOWN`. This event confirms that the node was removed from active membership. The event description notes that the Cluster service on the node may have stopped, or the node may have lost communication with other active nodes.

However, Event 1135 is a symptom of removal, not the root cause. To understand why the node left, you must look at the events that preceded it. If the failure was caused by network connectivity issues, you might see Event 1553 (`SERVICE_NO_NETWORK_CONNECTIVITY`) or Event 1554 (`SERVICE_NETWORK_CONNECTIVITY_LOST`). Event 1554 specifically indicates that the node has lost all network connectivity, which triggers the termination of the cluster service on that node.

Quorum issues present a different pattern. Event 1177 (`MM_EVENT_ARBITRATION_FAILED`) indicates that the Cluster service is shutting down because quorum was lost. This can occur due to network connectivity loss between nodes or a failover of the witness disk. If you see Event 1177, the issue is likely related to the quorum configuration or the witness resource, rather than a single node's internal health.

It is also important to distinguish between a node that was removed due to connectivity loss and one that was quarantined. Event 1672 (`EVENT_NODE_QUARANTINED`) indicates that the node experienced consecutive failures within a short period and was removed to avoid further disruptions. The event log specifies the number of consecutive membership losses and the time until the node will automatically attempt to re-join. If a node is quarantined, you can manually clear the quarantine using the `Start-ClusterNode –ClearQuarantine` PowerShell cmdlet, but only after the underlying issue has been resolved.

## Use the Health Service to identify the faulting entity

While the System log tells you that a node failed, the Health Service can tell you what failed. This capability is specific to clusters running Storage Spaces Direct. The Health Service constantly monitors the cluster to detect problems and generate "faults". These faults are designed to be precise, actionable, and include identifying information for the faulting entity and its physical location.

To view current faults, you can use PowerShell on a node in the cluster. The following command returns any faults affecting the overall Storage Spaces Direct cluster:

```powershell
Get-StorageSubSystem Cluster* | Debug-StorageSubSystem
```

If there are no faults, this cmdlet returns nothing. If there are faults, each one contains five important fields: Severity, Description, Recommended next steps, Identifying information for the faulting entity, and its physical location. For example, a fault might indicate that connectivity has been lost to a physical disk, with a recommendation to check that the disk is working and properly connected.

The Health Service also performs root cause analysis. It can assess the potential causality among faulting entities to identify and combine faults which are consequences of the same underlying problem. For example, if a server is down, it is expected that any drives within the server will also be without connectivity. Therefore, only one fault will be raised for the root cause - in this case, the server. This reduces "chatty" reporting and helps you focus on the primary issue.

## Correlate events and faults

To effectively troubleshoot a node failure, you should correlate the events from the System log with the faults from the Health Service. Start by identifying the node that failed and the time of the failure. Then, look for Event 1135 or Event 1672 in the System log around that time. Next, run the `Debug-StorageSubSystem` cmdlet to see if there are any current faults.

If the node is down, you might not see faults for that node, but you might see faults for other nodes or resources that were affected by the failure. For example, if a node failed due to a network adapter issue, you might see Event 1554 in the System log and a fault for the network adapter in the Health Service. If a node failed due to a disk issue, you might see Event 1038 (`RES_DISK_RESERVATION_LOST`) in the System log and a fault for the physical disk in the Health Service.

It is also worth noting that the Health Service provides fault events. When faults are created, removed, or updated, the Health Service generates WMI events. These events can be subscribed to using the Observer Design Pattern, allowing you to keep your application state in sync without frequent polling. This can be useful for automated monitoring and alerting systems.

## Verify the fix

Once you have identified the root cause and taken corrective action, you need to verify that the node has rejoined the cluster and that the faults have been cleared. You can check the cluster membership using the `Get-ClusterNode` cmdlet. You can also check for any remaining faults using the `Debug-StorageSubSystem` cmdlet. If the node has rejoined and there are no faults, the issue is likely resolved. If the node is still not joining or if there are still faults, you may need to investigate further.

In some cases, you may need to force the node to rejoin the cluster. If the node is quarantined, you can use the `Start-ClusterNode –ClearQuarantine` cmdlet. If the node is not quarantined but still not joining, you may need to restart the Cluster service on the node or, in extreme cases, restart the node itself. Always ensure that the underlying issue has been resolved before attempting to rejoin the node to the cluster.

## Prerequisites and permissions

To perform these troubleshooting steps, you need to be a member of the Administrators group on the cluster node or have equivalent permissions. You also need to have the Failover Clustering feature installed and configured. The PowerShell cmdlets used in this article are part of the FailoverClusters module, which is included with the Failover Clustering feature.

## Cleanup

If you have made changes to the cluster configuration or resolved a fault, it is good practice to document the changes and the resolution. This can help with future troubleshooting and provide a record of the incident. You may also want to update your monitoring and alerting systems to reflect the changes you have made.

## Common mistakes to avoid

-   **Assuming quorum is a backup**: Quorum is not a backup. It is a mechanism for determining which nodes are active in the cluster. Losing quorum does not necessarily mean you have lost data, but it does mean the cluster cannot function until quorum is restored.
-   **Ignoring network connectivity**: Network issues are a common cause of node failures. Always check the network configuration and connectivity when troubleshooting a node failure.
-   **Not checking the Health Service**: The Health Service provides valuable information about the health of the cluster. Always check for faults when troubleshooting a node failure.
-   **Forcing quorum without caution**: Forcing quorum on a node with an outdated copy of the cluster database may result in cluster configuration changes that occurred while the node was not participating in the cluster to be lost. Use the `Start-ClusterNode -FQ` cmdlet with caution.

By following these steps, you can effectively troubleshoot node failures in a Windows Server Failover Cluster. Remember to always correlate events and faults to get a complete picture of the issue, and to verify the fix before considering the issue resolved.

References for Review cluster event logs during a node failure: [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events), [Health Service faults](https://learn.microsoft.com/en-us/windows-server/failover-clustering/health-service-faults), [Health Service reports](https://learn.microsoft.com/en-us/windows-server/failover-clustering/health-service-reports).
