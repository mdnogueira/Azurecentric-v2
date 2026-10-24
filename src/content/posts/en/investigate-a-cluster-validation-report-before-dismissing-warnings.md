---
title: "Investigate a cluster validation report before dismissing warnings"
description: "Investigate cluster validation warnings by cross-referencing Health Service metrics with system log events to identify root causes."
pubDate: 2025-06-28
category: backup-dr
tags: []
translationKey: investigate-a-cluster-validation-report-before-dismissing-warnings
draft: false
---

You have just run a validation or health check on a Windows Server failover cluster and the report contains warnings. The instinct is often to dismiss them as noise or to force a resolution without understanding the underlying symptom. That approach risks masking a genuine hardware or configuration issue until it causes a node to drop out of the cluster. A more reliable method is to treat the validation report as a starting point and cross-reference it with the Health Service metrics and the Failover Clustering system log events.

The Health Service in Windows Server provides a curated list of essential metrics for Storage Spaces Direct clusters. It reduces the work required to get live performance and capacity information by collecting data efficiently and aggregating it dynamically across nodes. All values are real-time and point-in-time only. This means the data reflects the state at the moment of collection, not a historical trend. You can use the Health Service to get metrics for the entire cluster, a specific volume, or a specific node. The first step is to establish a baseline of what the cluster is actually doing under load or during the period when the warning appeared.

## Use the Health Service to quantify the warning

The Health Service cmdlet `Get-StorageHealthReport` allows you to query metrics for the cluster, nodes, or volumes. If the validation report flagged a latency issue, for example, you can use the Health Service to see the actual `IOLatencyAverage` values. The report might indicate a warning, but the Health Service tells you whether the latency is within acceptable limits for your workload or if it is genuinely degrading performance.

To get metrics for the entire cluster, you can run:

```powershell
Get-StorageSubSystem Cluster* | Get-StorageHealthReport
```

If you suspect a specific volume is the culprit, you can scope the query to that volume:

```powershell
Get-Volume -FileSystemLabel ExampleLabel | Get-StorageHealthReport
```

Similarly, if a particular node is behaving oddly, you can check its metrics:

```powershell
Get-StorageNode -Name ExampleName | Get-StorageHealthReport
```

The Health Service returns a set of records, each with a `Name`, `Value`, and `Units`. The units are defined as follows: 0 for Bytes, 1 for BytesPerSecond, 2 for CountPerSecond, 3 for Seconds, and 4 for Percentage. For example, `IOLatencyAverage` is measured in seconds. By comparing these values against your application's requirements, you can determine if the warning is a false positive or a genuine concern. If the latency is high, you can then look at the `IOPSRead`, `IOPSWrite`, and `IOThroughput` metrics to see if the storage subsystem is saturated.

## Cross-reference with Failover Clustering system log events

While the Health Service provides performance metrics, the Failover Clustering system log events provide context for why a node or resource might be behaving unexpectedly. The system log contains events from the `FailoverClustering` source that can help you troubleshoot a cluster. These events are critical for understanding the state of the cluster service and the resources it manages.

For instance, if a node is dropping out of the cluster, you might see Event 1135 (`EVENT_NODE_DOWN`), which indicates that a node was removed from the active failover cluster membership. This could be due to the node having lost communication with other active nodes. In this case, you should run the Validate a Configuration wizard to check your network configuration and check for hardware or software errors related to the network adapters. If the issue persists, you might see Event 1177 (`MM_EVENT_ARBITRATION_FAILED`), which indicates that the cluster service is shutting down because quorum was lost. This could be due to the loss of network connectivity between some or all nodes in the cluster, or a failover of the witness disk.

If the warning is related to storage, you might see Event 1034 (`RES_DISK_MISSING`), which indicates that a cluster physical disk resource cannot be brought online because the associated disk could not be found. This could happen if the disk was replaced or restored. In this case, you can use the Repair function in the Failover Cluster Manager snap-in to repair the new or restored disk. If the disk will not be replaced, you should delete the associated disk resource.

## Distinguish between warnings and critical errors

Not all warnings in a validation report are equal. Some are informational, while others indicate a critical error that requires immediate attention. It is important to distinguish between the two. For example, Event 1000 (`UNEXPECTED_FATAL_ERROR`) indicates that the cluster service suffered an unexpected fatal error. This is a critical error that requires immediate investigation. On the other hand, Event 1247 (`CLUSTER_EVENT_INVALID_SERVICE_SID_TYPE`) indicates that the Security Identifier (SID) type for the cluster service is configured incorrectly, but the cluster service is automatically modifying its SID type configuration and will restart. This is a warning that the service is self-correcting.

When investigating a warning, you should first check the Health Service metrics to see if there is a performance issue. If the metrics are normal, you should then check the system log events to see if there is a configuration or connectivity issue. If neither of these reveals a problem, you can consider dismissing the warning as a false positive. However, you should always document your findings and the reasoning behind your decision. This will help you troubleshoot similar issues in the future.

## Verify the resolution

Once you have identified the root cause of the warning, you should verify that the issue has been resolved. If you have made changes to the cluster configuration, you should run the Validate a Configuration wizard again to ensure that the changes have not introduced new issues. You should also monitor the Health Service metrics and system log events to ensure that the cluster is operating normally. If the warning reappears, you should investigate further to determine if the issue has been truly resolved or if it is a recurring problem.

By using the Health Service and system log events together, you can gain a comprehensive understanding of the health of your failover cluster. This approach allows you to make informed decisions about whether to dismiss a warning or to take action to resolve an underlying issue. It also helps you to avoid the common mistake of dismissing warnings without proper investigation, which can lead to more serious problems down the line.

tags: [failover-clustering, windows-server, storage-spaces-direct, health-service, troubleshooting, system-logs]
diagram: {title: 

References for Investigate a cluster validation report before dismissing warnings: [Health Service reports](https://learn.microsoft.com/en-us/windows-server/failover-clustering/health-service-reports), [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events), [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements).
