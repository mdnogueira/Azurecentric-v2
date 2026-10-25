---
title: "Validate a cluster after a network or storage change"
description: "Validate a Storage Spaces Direct cluster after network or storage changes using Health Service reports and system event logs."
pubDate: 2026-07-14
category: backup-dr
tags: ["failover-clustering", "storage-spaces-direct", "windows-server-2025", "health-service", "troubleshooting"]
translationKey: validate-a-cluster-after-a-network-or-storage-change
draft: false
---

You have changed a network adapter, replaced a storage controller, or updated firmware on a Windows Server 2025 Storage Spaces Direct cluster. The cluster is online, but you need to confirm that the change did not introduce latency spikes, connectivity drops, or database inconsistencies. Relying on the cluster being "green" in the dashboard is not enough; you need quantitative metrics and a check of the system log for specific failure events.

The Health Service in Windows Server provides a curated list of real-time metrics for the cluster, nodes, and volumes. Combined with the Failover Clustering system event log, you can verify that the infrastructure is stable before declaring the change successful.

## Check the Health Service for latency and throughput

The Health Service aggregates performance data efficiently across nodes. It is designed to give you a point-in-time view of critical metrics such as I/O latency and throughput. This is particularly useful after a storage change to ensure that the new disks or controllers are performing as expected.

To get a report for the entire cluster, run the following command in PowerShell on any cluster node:

```powershell
Get-StorageSubSystem Cluster* | Get-StorageHealthReport
```

This command returns a set of records for the cluster scope. The report includes metrics such as `IOLatencyAverage`, `IOPSRead`, and `IOThroughputWrite` (S1). If you need to verify the performance of a specific volume after a storage migration, you can scope the report to that volume:

```powershell
Get-Volume -FileSystemLabel ExampleLabel | Get-StorageHealthReport
```

The Health Service also allows you to capture discrete snapshots of these metrics. By using the `-Count` parameter, you can return a series of reports at one-second intervals. This helps you compare performance across a short window of time rather than seeing a single point:

```powershell
Get-StorageSubSystem Cluster* | Get-StorageHealthReport -Count 10
```

The values returned are real-time and point-in-time only (S1). They do not represent historical trends. If you see high latency in the report, check the `Units` property to understand the scale. For example, latency is measured in seconds, while throughput is measured in bytes per second (S1).

## Review the system event log for cluster failures

Even if the Health Service shows acceptable metrics, the cluster service may have logged critical events during the change. The Failover Clustering system log contains events that indicate connectivity issues, database corruption, or node halts.

Open Event Viewer and navigate to **Windows Logs > System**. Filter the log by the source **FailoverClustering**. Look for the following critical events (S3):

*   **Event 1135: EVENT_NODE_DOWN**: This event indicates that a node was removed from the active cluster membership. It often occurs when a node loses communication with other nodes. If you see this event after a network change, it suggests that the network configuration is not allowing proper cluster heartbeat traffic.
*   **Event 1177: MM_EVENT_ARBITRATION_FAILED**: This event means the cluster service shut down because quorum was lost. This can happen if the witness resource becomes inaccessible or if network connectivity is fragmented.
*   **Event 1553: SERVICE_NO_NETWORK_CONNECTIVITY**: This event indicates that a node has no network connectivity and cannot participate in the cluster. It is a direct indicator of a network configuration error.
*   **Event 1038: RES_DISK_RESERVATION_LOST**: If you changed storage hardware, this event indicates that a node unexpectedly lost ownership of a cluster disk. This can happen if the new storage controller is not properly configured or if the disks are not visible to all nodes.

If you see any of these events, the change has not been validated successfully. You need to investigate the specific event and correct the underlying issue before proceeding.

## Verify storage and network configuration

After checking the Health Service and the event log, you should verify that the configuration matches your expectations. If you changed network adapters, ensure that the management and cluster networks are correctly assigned. If you changed storage, ensure that all nodes can see the new disks.

You can use the **Validate Configuration** wizard in Failover Cluster Manager to run a comprehensive set of tests. This wizard checks hardware compatibility and configuration standards required for cluster support. It is particularly useful for catching issues that the Health Service and event logs might not immediately highlight.

Run the validation wizard on the cluster nodes. If the tests complete with no errors or warnings, the configuration is likely correct. If there are warnings, review the report to determine if they are acceptable for your workload. For example, a warning about persistent reservations might indicate that the disks do not support Storage Spaces Direct features, which could affect performance or availability.

## Clean up and confirm

Once you have verified the Health Service metrics and reviewed the event log, you can consider the change validated. If you used the Health Service to capture multiple reports, the streaming has stopped automatically after the count is reached.

If you made changes to the cluster configuration, such as adding or removing nodes, ensure that the cluster database is consistent. You can check the cluster status using the `Get-Cluster` cmdlet. This will show you the current state of the cluster and its nodes.

If you encounter persistent issues, such as nodes being quarantined or the cluster service failing to start, refer to the specific event IDs in the system log. For example, Event 1672 indicates that a node has been quarantined due to consecutive failures. You can clear the quarantine using the `Start-ClusterNode -ClearQuarantine` cmdlet after resolving the underlying issue (S3).

By combining the Health Service reports with a review of the system event log, you can confidently validate that your network or storage changes have not compromised the cluster's stability or performance.

References for Validate a cluster after a network or storage change: [Health Service reports](https://learn.microsoft.com/en-us/windows-server/failover-clustering/health-service-reports), [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster), [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events).
