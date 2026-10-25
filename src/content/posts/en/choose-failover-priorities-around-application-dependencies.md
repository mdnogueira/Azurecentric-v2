---
title: "Choose failover priorities around application dependencies"
description: "Distinguish cluster quorum from application failover priorities. Configure votes to control survival, not role placement."
pubDate: 2025-12-08
category: backup-dr
tags: ["failover-clustering", "quorum", "windows-server", "disaster-recovery", "multisite"]
translationKey: choose-failover-priorities-around-application-dependencies
draft: false
---

You are planning a failover cluster that spans multiple sites. The immediate question is not just which application moves where, but whether the cluster survives a network partition at all. If the cluster loses quorum, the entire workload stops, regardless of your failover priorities. This is where the distinction between quorum and failover priorities becomes critical.

Quorum is the mechanism that prevents split-brain scenarios by ensuring only one part of the cluster can continue operating [Failover Clustering](https://learn.microsoft.com/en-us/windows-server/failover-clustering/failover-clustering-overview). Failover priorities, on the other hand, determine which node or site takes over workloads when a failure occurs. You cannot rely on failover priorities if the cluster has already lost quorum. Therefore, you must configure quorum to support your desired failover behaviour, particularly in multisite environments.

## Understanding the relationship between quorum and failover

Failover clustering relies on a quorum model to maintain cluster integrity. The quorum is determined by the number of voting elements that must be part of active cluster membership for the cluster to start or continue running [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum). In a multisite cluster, network partitions can isolate nodes from each other. If the isolated nodes cannot reach a quorum majority, the cluster service halts to prevent data inconsistency [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events#event-1561-service_nonstorage_witness_better_tag).

Failover priorities are configured at the role level, specifying the order in which nodes should host a clustered role. However, these priorities are only relevant if the cluster remains operational. If a network partition causes a loss of quorum, the cluster stops, and failover priorities become irrelevant. This is why quorum configuration must be considered before defining failover priorities.

## Configuring quorum for multisite failover

In a multisite cluster, the default quorum configuration may not support your failover goals. For example, if you have an even number of nodes, you need a witness to break ties. The quorum witness can be a disk, a file share, or a cloud witness [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum). In a multisite scenario, a file share witness or cloud witness is often preferred because it can be placed in a neutral location, separate from both sites.

The file share witness must be on a site separate from the cluster workload to ensure equal opportunity for any site to survive if site-to-site network communication is lost [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum). If the witness is on the same site as the primary workload, that site becomes the primary site, and it is the only site that can reach the file share. This can lead to a situation where the secondary site cannot form a quorum, even if it has more nodes.

You can configure the quorum using the Configure Cluster Quorum Wizard or PowerShell cmdlets [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum). The wizard offers three options: use typical settings, add or change the quorum witness, and advanced configuration. For multisite clusters, advanced configuration is often necessary to assign votes correctly.

## Adjusting node votes for failover priorities

In advanced quorum configuration, you can assign or remove quorum votes on a per-node basis. By default, all nodes are assigned votes. However, in a multisite cluster, you might want to remove votes from nodes in a backup site so that those nodes do not affect quorum calculations. This configuration is recommended only for manual failover across sites [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).

For example, if you have two sites with three nodes each, and you want the primary site to always win in a split-brain scenario, you can remove votes from the secondary site nodes. This ensures that the primary site can form a quorum even if the secondary site is isolated. However, this configuration requires careful planning, as it means the secondary site cannot form a quorum on its own.

You can verify the vote assignment for all cluster nodes by using the Validate Cluster Quorum validation test [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum). The configured vote of a node can be verified by looking up the NodeWeight common property of the cluster node using the Get-ClusterNode PowerShell cmdlet. A value of 0 indicates that the node does not have a quorum vote configured, and a value of 1 indicates that the quorum vote of the node is assigned [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).

## Verifying quorum and failover configuration

After configuring quorum, you should validate the configuration to ensure it supports your failover priorities. You can run the Validate a Configuration wizard or the Test-Cluster PowerShell cmdlet to run the Validate Quorum Configuration test [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum). The test output indicates if a change to the quorum configuration is recommended and the settings that are optimal.

You should also test the failover behaviour by simulating a network partition. This can be done by disabling network connectivity between sites and observing whether the cluster maintains quorum and whether the failover priorities are respected. If the cluster loses quorum, you need to adjust the quorum configuration.

It is important to note that quorum configuration should not be changed frequently. You might want to consider changing the quorum configuration in situations such as adding or evicting nodes, adding or removing storage, a long-term node or witness failure, or recovering a cluster in a multisite disaster recovery scenario [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).
