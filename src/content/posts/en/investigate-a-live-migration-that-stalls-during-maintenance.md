---
title: "Investigate a live migration that stalls during maintenance"
description: "Troubleshoot stalled live migrations in Windows Server 2025 by verifying SMB bandwidth limits and cluster network selection."
pubDate: 2026-03-27
category: backup-dr
tags: ["windows-server", "hyper-v", "live-migration", "smb", "failover-clustering"]
translationKey: investigate-a-live-migration-that-stalls-during-maintenance
draft: false
---

A live migration that stalls usually means the cluster is waiting for something that isn't arriving. In Windows Server 2025, that is most often a bandwidth limit or a network selection issue when using SMB for migration traffic. The first thing to check is whether the cluster has applied a bandwidth cap that is too low for the current workload, or whether the migration traffic is trying to use a network that is blocked or congested.

## Verify the SMB bandwidth limit

[![Live Migration Stall Troubleshooting](/images/posts/2026/azc-292-checkpoints.svg)](/images/posts/2026/azc-292-checkpoints.svg)

When you configure Hyper-V to use SMB for Live Migration, the cluster applies a bandwidth limit to prevent migration traffic from starving storage and cluster communication traffic. The default limit is 25% of the total bandwidth available to the cluster node. If you have recently added high-throughput workloads or increased the number of simultaneous migrations, that default cap may be the bottleneck.

You can check the current cluster-wide SMB bandwidth settings using PowerShell. Run the following command on any cluster node:

```powershell
Get-Cluster | FL SetSMBBandwidthLimit,SetSMBBandwidthLimitFactor
```

The `SetSMBBandwidthLimit` property indicates whether the limit is enabled (1) or disabled (0). The `SetSMBBandwidthLimitFactor` property is a multiplier that determines the percentage of total bandwidth reserved for SMB traffic. The factor is calculated as `(SMB bandwidth limit / total bandwidth) * 10000`. For example, a factor of 2500 reserves 25% of the total bandwidth.

If the limit is enabled and the factor is low, you can increase it to allow more bandwidth for migrations. For instance, to set the factor to 3000 (30%), you would run:

```powershell
Get-Cluster | Set-ClusterParameter -Name SMBBandwidthLimitFactor -Value 3000
```

This change applies cluster-wide. When you add a new node to the cluster, it automatically uses these values. Note that these limits apply only if the cluster nodes run on physical hardware; they do not take effect if the nodes run inside of virtual machines.

## Check the Live Migration network selection

Even with sufficient bandwidth, migrations can stall if the cluster is trying to use a network that is not suitable for migration traffic. By default, the cluster network used for cluster communications, CSV, and Storage Spaces Direct is set to the lowest preference. This keeps Live Migration traffic away from the same network the cluster uses to communicate between nodes, which is generally a good practice.

However, if you have multiple cluster networks, you need to ensure that the network selected for Live Migration is actually available and not blocked. You can check which networks are excluded from Live Migration by running the following PowerShell commands:

```powershell
$VMResourceType = Get-ClusterResourceType -name "Virtual Machine"
$VMResourceType | Get-ClusterParameter -Name MigrationExcludeNetworks
```

If a network that you expect to use for migrations is listed in the exclusion list, you may need to adjust the settings. You can configure the Live Migration network selection using the Failover Cluster Manager or PowerShell. In the GUI, open Failover Cluster Manager, expand the cluster, right-click **Networks**, and select **Live Migration Settings**. From there, you can select the cluster networks to use for Live Migration by checking or unchecking the required networks.

## Review SMB Multichannel and Multi-NIC settings

Windows Server 2025 includes Simplified SMB Multichannel and Multi-NIC Cluster Networks, which automatically enables SMB Multichannel for cluster networks with multiple NICs on the same subnet. This feature can improve throughput and fault tolerance, but it also changes how traffic is distributed.

If you are using multiple NICs on the same subnet for your cluster network, SMB Multichannel is enabled automatically. This can help if the migration is stalling due to a single NIC being saturated. However, if the NICs are not configured correctly or if there are issues with the switch configuration, SMB Multichannel might not work as expected. You can verify the multi-NIC configuration via Failover Cluster Manager or `Get-ClusterNetwork` to ensure that the settings are applied correctly.

## Check cluster events for clues

If the migration is still stalling after checking the bandwidth and network settings, look at the cluster event logs for any errors or warnings. The Failover Clustering system log contains events that can help you troubleshoot cluster issues. For example, Event 1282 indicates a security handshake timeout, which could indicate a network connectivity issue. Event 1135 indicates that a cluster node was removed from the active failover cluster membership, which could be due to network connectivity problems.

You can view the cluster event logs using Event Viewer or PowerShell. Look for events with the source **FailoverClustering** and check the details for any errors or warnings related to the migration.

## Verify the migration status

Once you have made any necessary changes, verify that the migration is proceeding correctly. You can check the status of the migration using the Failover Cluster Manager or PowerShell. In the GUI, open Failover Cluster Manager, expand the cluster, and select **Roles**. You should see the virtual machine being migrated and the progress of the migration.

In PowerShell, you can use the `Get-VM` cmdlet to check the status of the virtual machine. If the migration is still stalling, you may need to restart the migration or investigate further.

By checking the SMB bandwidth limit, Live Migration network selection, SMB Multichannel settings, and cluster events, you can usually identify and resolve the cause of a stalled live migration. If the issue persists, consider reviewing the network configuration and hardware to ensure that there are no underlying problems.


References for Investigate a live migration that stalls during maintenance: [Control Live Migration SMB Bandwidth Control Cluster-wide in Windows Server and Azure Local](https://learn.microsoft.com/en-us/windows-server/failover-clustering/configure-live-migration-smb-bandwidth), [Simplified SMB Multichannel and Multi-NIC Cluster Networks](https://learn.microsoft.com/en-us/windows-server/failover-clustering/smb-multichannel), [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events).
