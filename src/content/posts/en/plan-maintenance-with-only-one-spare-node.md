---
title: "Plan maintenance with only one spare node"
description: "Plan maintenance on a two-node cluster with one spare node using CAU, ensuring quorum is maintained by moving roles before maintenance."
pubDate: 2026-09-06
category: high-availability
tags: ["failover-clustering", "maintenance", "quorum", "windows-server-2025", "windows-server"]
translationKey: plan-maintenance-with-only-one-spare-node
draft: false
---

You have a two-node failover cluster and a maintenance window. You need to apply updates, but you only have one spare node to keep the cluster running. The question is whether you can update both nodes sequentially without losing quorum, or if you need a third node to act as a witness.

The short answer is that you can update a two-node cluster with one spare node, provided you configure the cluster to use a quorum witness. Without a witness, a two-node cluster cannot survive the loss of one node while the other is in maintenance mode, because the remaining node alone cannot form a majority.

## Understand the quorum constraint

Cluster-Aware Updating (CAU) automates the update process by putting each node into maintenance mode, moving clustered roles, installing updates, and restarting the node. During this process, the node being updated is effectively offline for the duration of the update and restart.

In a two-node cluster, the quorum model is typically "Node Majority". This means that a majority of the votes (2 out of 2, or 1.5) are required for the cluster to remain operational. If you put one node into maintenance mode, it loses its vote. The remaining node has only 1 vote, which is not a majority of the original 2. The cluster will lose quorum and shut down.

To avoid this, you need a third vote. This is achieved by adding a quorum witness, such as a file share or a cloud witness. With a witness, the quorum model becomes "Node and File Share Majority" (or similar). Now, you have 2 node votes and 1 witness vote. If one node is in maintenance mode, the remaining node (1 vote) plus the witness (1 vote) equals 2 votes, which is a majority of the total 3 votes. The cluster remains operational.

## Configure the quorum witness

Before starting the CAU process, ensure that a quorum witness is configured and accessible. You can use the `Get-ClusterQuorum` cmdlet to check the current quorum configuration.

```powershell
Get-ClusterQuorum
```

If no witness is configured, you can add one using the `Set-ClusterQuorum` cmdlet. For example, to add a file share witness:

```powershell
Set-ClusterQuorum -FileShareWitness \\Server\Share
```

Ensure that the cluster service account has read/write permissions to the file share. The witness must be accessible from both nodes.

## Plan the CAU run

With the witness in place, you can proceed with the CAU run. CAU will handle the nodes sequentially. It will put the first node into maintenance mode, move the clustered roles to the second node, apply the updates, and restart the node. Once the first node is back online and out of maintenance mode, CAU will move the roles back and proceed to the second node.

You can use the `Invoke-CauRun` cmdlet to start the update process. Ensure that you have the necessary permissions and that the CAU tools are installed on the cluster nodes or a remote Update Coordinator.

```powershell
Invoke-CauRun -ClusterName "ClusterName" -PluginName "Microsoft.WindowsUpdatePlugin"
```

## Verify the update

After the CAU run completes, verify that all nodes are online and that the clustered roles are running as expected. You can use the `Get-ClusterNode` and `Get-ClusterRole` cmdlets to check the status.

```powershell
Get-ClusterNode
Get-ClusterRole
```

Check the CAU logs for any errors or warnings. The logs are typically located in `C:\Windows\Cluster\Reports\CAU_*.log`.

## Considerations for Windows Server 2025

Windows Server 2025 introduces several improvements to failover clustering and CAU. Ensure that you are using the latest version of the CAU tools and that your cluster is fully patched before starting the maintenance window. Review the [Cluster-Aware Updating overview](https://learn.microsoft.com/en-us/windows-server/failover-clustering/cluster-aware-updating) for the latest features and best practices.

Also, consider the impact of the updates on your clustered roles. Some updates may require a restart of the clustered roles, which could cause a brief interruption in service. Coordinate with your application owners to ensure that the maintenance window is acceptable.

By planning the maintenance carefully and ensuring that the cluster has a quorum witness, you can update your two-node cluster with one spare node without losing availability.
