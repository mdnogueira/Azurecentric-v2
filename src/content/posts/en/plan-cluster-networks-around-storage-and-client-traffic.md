---
title: "Plan cluster networks around storage and client traffic"
description: "Plan Windows Server 2022 cluster networks using SMB Multichannel for storage and cluster-wide bandwidth controls for live migrations."
pubDate: 2024-07-24
category: backup-dr
tags: []
translationKey: plan-cluster-networks-around-storage-and-client-traffic
draft: false
---

You are planning a Windows Server 2022 failover cluster. The immediate operational question is how to arrange the network topology so that live migrations do not starve storage traffic, or vice versa. The answer lies in two distinct mechanisms: Simplified SMB Multichannel for storage throughput, and Cluster-wide Live Migration SMB Bandwidth Control for traffic shaping. You must configure both to ensure reliability.

## Separate the traffic paths

The first step is to ensure you have at least two physical networks for Failover Clustering. Using a single network creates a single point of failure for cluster heartbeats and data traffic. Ideally, you should have multiple physical communication paths between nodes.

In a converged configuration, you typically have a "North-South" subnet connecting the workload cluster (e.g., Hyper-V or SQL Server Failover Cluster Instance) to the storage cluster (e.g., Scale-out File Server). This is where SMB Multichannel becomes critical.

Simplified SMB Multichannel and Multi-NIC Cluster Networks is a feature in Windows Server 2022 that enables the use of multiple NICs on the same cluster network subnet. It automatically enables SMB Multichannel. This means the cluster recognises all NICs on nodes using the same switch and subnet without additional configuration. It also automatically enables IPv6 Link Local (fe80) IP Address resources for cluster-only networks, saving administrative time. When using more than one private (cluster only) network, check the IPv6 routing configuration to ensure that routing is not configured to cross subnets, since this will reduce network performance.

To achieve maximum network throughput, use multiple NICs across clusters. If your Scale-out File Server cluster and your Hyper-V cluster both use multiple NICs in the same North-South subnet, they leverage SMB Multichannel to aggregate bandwidth. This is particularly effective if you are using RDMA capable NIC cards and switches.

## Control Live Migration bandwidth

Even with high-throughput storage networks, live migrations can consume excessive bandwidth. If live migration over SMB consumes too much bandwidth, storage and cluster network traffic could be delayed or dropped. This affects system reliability and hosted services.

Windows Server 2022 introduces cluster-wide Live Migration SMB Bandwidth Control. This allows you to reserve network bandwidth for SMB between failover cluster nodes. You no longer need to configure these limits on individual cluster nodes.

Before configuring this, ensure each cluster node has the `FS-SMBBW` Windows Feature installed. This is a prerequisite. The default SMB bandwidth limit factor is 2500 (25%) of the total bandwidth available to the cluster node. However, this limit is only enforced when the cluster-wide SMB bandwidth limit is enabled via the `SetSMBBandwidthLimit` parameter. You must also have the 2022-09 Cumulative Update installed.

## Calculate and apply the limit

The bandwidth limit uses a percentage of the total bandwidth available to the cluster node. You should calculate the limit based on the total bandwidth of all network adapters on a node.

The formula for the SMB bandwidth limit factor is:

`(SMB Bandwidth Limit / Sum of all bandwidth) * 10000`

For example, if a node has four 10GB network adapters (total 40GB) and you wish to reserve 10GB for live migration, the factor is 2500 (25%).

You can configure the cluster-wide limit using PowerShell. First, verify the current values:

```powershell
Get-Cluster | FL SetSMBBandwidthLimit,SetSMBBandwidthLimitFactor
```

Then, set the factor. For example, to set it to 3000 (30%):

```powershell
Get-Cluster | %($_.SMBBandwidthLimitFactor=3000)
```

To enable or disable the limit:

```powershell
# Enable
Get-Cluster | %($_.SMBBandwidthLimit=1)

# Disable
Get-Cluster | %($_.SMBBandwidthLimit=0)
```

Note that these cluster-wide limits only apply if nodes are on physical hardware. They do not take effect if nodes are running inside virtual machines.

## Verify the configuration

Check that SMB Multichannel is enabled on the cluster nodes. Use the following command to verify the `EnableMultiChannel` property:

```powershell
Get-SMBServerConfiguration | Select EnableMultiChannel
```

Also, ensure that Live Migration is configured to use SMB. You can set the performance option using PowerShell:

```powershell
$ClusterNodes = (Get-ClusterNode).name
Set-VMHost -ComputerName $ClusterNodes -VirtualMachineMigrationPerformanceOption SMB
```

Finally, verify that the bandwidth limit is active by checking the cluster parameters again. This ensures that live migrations will not overwhelm the storage network.

tags: [windows-server, failover-clustering, smb-multichannel, live-migration, network-planning]
diagram: {title: Cluster Network Traffic Flow and Control, nodes: [{name: "Workload Cluster (Hyper-V/SQL)", desc: "Generates client I/O and initiates live migrations"}, {name: "Storage Cluster (SOFSE/S2D)", desc: "Serves SMB shares for VM data and configuration"}, {name: "North-South SMB Subnet", desc: "Carries I/O and migration traffic between clusters"}, {name: "SMB Multichannel", desc: "Aggregates multiple NICs for storage throughput"}, {name: "SMB Bandwidth Limit", desc: "Caps migration traffic to protect storage I/O"}, {name: "Cluster Heartbeat", desc: "Runs on separate private networks for node health"}]}, claims: [{claim: 

References for Plan cluster networks around storage and client traffic: [Simplified SMB Multichannel and Multi-NIC Cluster Networks](https://learn.microsoft.com/en-us/windows-server/failover-clustering/smb-multichannel), [Configure Cluster-wide Live Migration SMB Bandwidth control in Windows Server](https://learn.microsoft.com/en-us/windows-server/failover-clustering/configure-live-migration-smb-bandwidth).
