---
title: "Choose a quorum witness for a failover cluster"
description: "Choose a Windows Server cluster witness around storage, site connectivity and failure scenarios, then inspect the configuration before changing votes."
pubDate: 2024-02-14
category: backup-dr
tags: [failover-clustering, windows-server, quorum, high-availability]
translationKey: choose-a-quorum-witness-for-a-failover-cluster
draft: false
---

A quorum witness should be chosen around the failures a cluster must handle. The important question is which nodes can still communicate, reach their storage and participate in cluster membership after a node, network path or site fails.

Quorum determines whether enough voting members remain for the cluster to start or continue running. It helps prevent disconnected groups of nodes from independently continuing as the same cluster. A witness participates in that decision; it does not provide application capacity, replicate workload data or replace a recovery plan.

## Start with the topology

Draw the cluster nodes, their sites, the workload storage and the paths to the proposed witness. Include dependencies that are easy to overlook, such as a file server running on the cluster it is meant to support.

For a two-site design, ask what each site can reach when the inter-site connection fails. A witness placed in one workload site can influence which side remains able to participate. Placing it in a separate failure domain is useful only when its network paths and supporting services are independent enough for the intended scenario.

Use Microsoft's [quorum configuration guidance](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum) alongside this assessment. It describes witness requirements and recommends reviewing the configuration selected when a cluster is created.

## Compare the witness choices

| Witness | What it uses | Main design consideration |
|---|---|---|
| Disk | A dedicated shared LUN containing a copy of the cluster database | All participating nodes need supported access to the disk; it is not supported with Storage Spaces Direct |
| File share | A dedicated SMB share maintaining witness information | Place the hosting service and its access paths outside the failures the witness is intended to arbitrate |
| Cloud | A witness file in Azure Blob Storage | Cluster nodes need reliable connectivity to the required Azure service |

A disk witness suits some clusters with shared storage. The documented requirements include a dedicated LUN of at least 512 MB, a basic disk with a single volume, and successful storage validation. It cannot be a Cluster Shared Volume or a disk assigned to an application role.

For replicated storage across sites, do not assume a replicated LUN can serve as a shared disk witness. Microsoft's guidance requires storage-vendor support for read-write access from all sites.

A file share witness does not store a copy of the cluster database. The share needs to be dedicated to that cluster, with the required permissions and at least 5 MB free. In the domain-based configuration described by Microsoft, the cluster name's computer object needs write permissions.

The file server can be a VM, but it must not depend on the same cluster using the witness. Otherwise, a cluster outage can also remove the service needed to help that cluster make its membership decision.

A cloud witness avoids operating a separate witness file server. It still has dependencies: Azure storage configuration, credentials and reliable network connectivity. Treat those as part of the design rather than assuming the word “cloud” removes the need to assess reachability.

## Do not confuse witness loss with cluster loss

Losing a witness does not automatically stop a cluster that still has enough votes to maintain quorum. It reduces the voting resources available for subsequent failures. The outcome depends on the cluster's membership and voting state at the time.

Similarly, adding a witness is not a guarantee that any chosen half of the nodes can survive any failure. Workload storage, network connectivity and application dependencies can prevent service recovery even when the remaining cluster membership has quorum.

Dynamic quorum can adjust node votes as membership changes. It can support sequential shutdown scenarios that leave a single surviving node, but it does not allow the cluster to survive the simultaneous loss of a majority of voting members. Keep those two failure patterns separate when reviewing a design.

## Inspect before changing the configuration

For an existing Windows Server cluster, start with read-only inspection. From a suitably authorised Windows PowerShell session with the FailoverClusters module available, these illustrative commands inspect an example cluster:

```powershell
$clusterName = 'CONTOSO-FC1'
Get-ClusterQuorum -Cluster $clusterName
Get-ClusterNode -Cluster $clusterName |
    Select-Object Name, State, NodeWeight, DynamicWeight
```

Replace the example name with the intended cluster. These commands have not been executed against a cluster for this article. Configured node votes and current dynamic votes are different properties; inspect both rather than counting physical servers alone.

Avoid removing node votes simply to produce an odd number. Microsoft recommends using the appropriate witness instead of manually adjusting votes for that purpose.

## Configure and verify deliberately

In Failover Cluster Manager, select the cluster, open **More Actions**, then **Configure Cluster Quorum Settings**. Review the proposed witness and the wizard's recommendations before applying a change.

For a file share witness, confirm the share's host, permissions and failure domain first. For a cloud witness, verify the storage and connectivity requirements before entering the configuration. These are operational changes to an existing cluster, so use the normal change process.

Afterwards, run the quorum validation check described in the Microsoft guidance and retain the report. A separate maintenance exercise should examine the failure cases the design is intended to handle. Agree the expected cluster and application behaviour before disconnecting anything.

Revisit the assessment when nodes, storage or site connectivity change. The witness choice is useful when it fits the cluster's actual dependencies and there is evidence that the intended failure scenarios behave as expected.
