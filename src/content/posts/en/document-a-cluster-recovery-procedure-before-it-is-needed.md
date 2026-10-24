---
title: "Document a cluster recovery procedure before it is needed"
description: "Document cluster recovery procedures for quorum loss, covering ForceQuorum and PreventQuorum modes."
pubDate: 2026-01-30
category: backup-dr
tags: ["failover-clustering", "quorum", "disaster-recovery", "windows-server", "powershell"]
translationKey: document-a-cluster-recovery-procedure-before-it-is-needed
draft: false
---

A failover cluster stops when it loses quorum. The cluster service halts to prevent split-brain scenarios where different parts of the cluster might try to operate independently, potentially causing data corruption. The first thing to check is why the quorum was lost. Was it a network partition, a failed node, or a lost witness? Investigating the root cause is essential before attempting recovery.

If you cannot restore the lost quorum source quickly, you may need to force the cluster to start without quorum. This is a critical skill for disaster recovery, especially in multisite configurations where the primary site is unreachable. However, this action temporarily bypasses the cluster's quorum configuration and places the cluster in **ForceQuorum** mode. You must document this procedure clearly, because once forced, the administrator takes complete control over the cluster's operations.

[![Cluster Recovery Flow](/images/posts/2026/azc-272-checkpoints.svg)](/images/posts/2026/azc-272-checkpoints.svg)

## Prerequisites and permissions

Before attempting recovery, ensure the following:

- The device used for recovery must be running Windows Server 2012 or later on all cluster nodes.
- The Failover Clustering feature must be installed on each node. You can install it using:
  ```powershell
  Install-WindowsFeature -Name Failover-Clustering -IncludeManagementTools
  ```
- You must be a member of the **Administrators** or **Domain Admins** group.
- Shared storage (such as NAS or SAN) must be accessible by all nodes in the cluster.

## Step 1: Force start the cluster node

If the cluster has lost quorum and you cannot recover the quorum source, you can force the cluster to start on a specific node. This overrides the quorum configuration for the startup process and starts the cluster in **ForceQuorum** mode.

Run the following command in an elevated PowerShell window on the node you wish to start:

```powershell
Start-ClusterNode -ForceQuorum
```

This is particularly useful in multisite disaster recovery scenarios. For example, if SiteA fails completely, you might force SiteB to come online even though it doesn't have quorum. When the cluster is force started, it uses the configuration from that node and replicates it to all other reachable nodes. Once the cluster regains sufficient quorum votes, it automatically leaves the forced state and behaves normally.

## Step 2: Start remaining nodes with quorum prevented

After force starting the cluster on one node, you must start any remaining nodes with a setting to **prevent quorum**. This prevents the remaining nodes from forming a split cluster that contains two competing instances.

To start a node with quorum prevented, run:

```powershell
Start-ClusterNode -Node "NodeName" -PreventQuorum
```

This is critical in multisite recovery. If you force started the cluster on SiteB, the nodes in SiteA must be started with quorum prevented to join the existing cluster rather than forming a new one. If you select **Start Cluster Service** instead of **Force Cluster Start** in the Failover Cluster Manager, the node is automatically started with the setting that prevents quorum.

## Step 3: Verify cluster health

After recovery, verify the cluster state:

```powershell
Get-ClusterQuorum
Get-ClusterNode -Name "NodeName" | Format-List *
```

Check the system log for Event ID 1177, which indicates quorum loss. Also, review other critical events such as Event 1000 (unexpected fatal error) or Event 1177 (quorum lost) to ensure no further issues exist.

## Quorum considerations for disaster recovery

Your quorum configuration should align with your service level agreements (SLAs). For automatic failover, ensure dynamic quorum management is enabled and node votes are equal across sites. For manual failover, remove node votes from backup site nodes and configure a witness accessible only to the primary site.

Document these steps in your disaster recovery plan. Test them regularly to ensure your team can recover quickly and safely when quorum is lost.

References for Document a cluster recovery procedure before it is needed: [Recover a failover cluster without quorum in Windows Server](https://learn.microsoft.com/en-us/windows-server/failover-clustering/recover-failover-cluster-without-quorum), [Failover Clustering](https://learn.microsoft.com/en-us/windows-server/failover-clustering/failover-clustering-overview), [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events).
