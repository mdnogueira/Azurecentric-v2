---
title: "Review split-brain risk in a stretched infrastructure design"
description: "Configure fault domains and quorum witnesses to manage split-brain risk in stretched Windows Server clusters."
pubDate: 2026-05-19
category: backup-dr
tags: ["failover-clustering", "stretch-cluster", "quorum", "fault-domains", "windows-server"]
translationKey: review-split-brain-risk-in-a-stretched-infrastructure-design
draft: true
---

A stretched infrastructure design distributes cluster nodes across separate physical sites. This introduces a specific risk: split-brain. This occurs when network connectivity between sites is lost, and the cluster cannot determine which side holds the authoritative state. The result is usually a loss of quorum, forcing services offline, rather than a dual-write scenario where data corruption occurs. Preventing this requires explicit configuration of fault domains and a quorum witness that remains accessible to the minority site.

The solution is not simply to spread nodes out. It requires defining the physical topology so the cluster understands where its components live, and configuring a witness that breaks ties when the sites are partitioned. Without these, a network partition causes the cluster to lose quorum entirely or, in manual failover scenarios, leaves you with no clear path to recovery.

[![Stretched Cluster Quorum and Fault Domain Flow](/images/posts/2026/azc-311-checkpoints.svg)](/images/posts/2026/azc-311-checkpoints.svg)

## Define the physical topology with fault domains

Windows Server Failover Clustering (WSFC) does not automatically know which nodes are in which physical site. You must define this topology using fault domains. This allows the cluster to understand the physical layout and apply storage affinity rules, which is critical for stretch clustering performance and resiliency [Fault domain awareness](https://learn.microsoft.com/en-us/windows-server/failover-clustering/fault-domains).

Fault domains are hierarchical. The canonical levels are site, rack, chassis, and node [Fault domain awareness](https://learn.microsoft.com/en-us/windows-server/failover-clustering/fault-domains). For a stretched design, the site level is the most important. You can define these using PowerShell or XML markup. The cmdlets `New-ClusterFaultDomain` and `Set-ClusterFaultDomain` allow you to create site-level domains and assign nodes to them [Fault domain awareness](https://learn.microsoft.com/en-us/windows-server/failover-clustering/fault-domains).

> [!IMPORTANT]
> Windows Server cannot and does not verify that any fault domains you create correspond to anything in the real, physical world. You are responsible for ensuring the topology you create using these cmdlets matches the actual arrangement of your hardware [Fault domain awareness](https://learn.microsoft.com/en-us/windows-server/failover-clustering/fault-domains).

For example, if you have three nodes in Site A and two in Site B, you would create two site fault domains and assign the nodes accordingly. This structure is essential for the cluster to make informed decisions during a failure, particularly for storage affinity in stretch clustering scenarios [Fault domain awareness](https://learn.microsoft.com/en-us/windows-server/failover-clustering/fault-domains).

## Configure a quorum witness for the minority site

Quorum determines whether the cluster can continue running. In a stretched cluster, the goal is to ensure that if one site loses connectivity, the other site can still maintain quorum. The standard model is "Node Majority with Witness" [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).

The witness must be located in a third location, separate from both cluster sites. This ensures that the witness is not affected by a site-level failure. Common options include a file share witness on a server in a third site or a cloud witness in Azure [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).

The witness provides a vote. In a 5-node cluster (3 in Site A, 2 in Site B), Site A has 3 votes and Site B has 2. Without a witness, a network partition would leave Site A with 3 votes and Site B with 2. Since 3 is a majority of 5, Site A would continue, and Site B would stop. This is the desired outcome. However, if the cluster had an even number of nodes, or if you wanted to ensure the minority site could still hold data in a manual failover scenario, the witness becomes critical.

A file share witness is recommended for multisite disaster recovery with replicated storage [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum). It must be on a site separate from the cluster workload to allow equal opportunity for any cluster site to survive if site-to-site network communication is lost [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).

## Verify the configuration

After configuring fault domains and the quorum witness, you must verify that the cluster understands the topology and quorum settings. Use the `Get-ClusterFaultDomain` cmdlet to check the site assignments [Fault domain awareness](https://learn.microsoft.com/en-us/windows-server/failover-clustering/fault-domains). Use `Get-ClusterQuorum` to confirm the witness is configured and voting [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).

Run the **Validate Cluster Quorum** validation test using the `Test-Cluster` cmdlet or Failover Cluster Manager. This test will indicate if the quorum configuration is optimal for your cluster [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).

## Considerations for Storage Spaces Direct

If you are using Storage Spaces Direct (S2D), there are additional constraints. S2D does not support disk witnesses [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum). You must use a file share witness or cloud witness [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).

Furthermore, S2D clusters support up to 16 nodes [Failover Clustering Storage Architectures in Windows Server](https://learn.microsoft.com/en-us/windows-server/failover-clustering/storage-architectures). In a stretched S2D cluster, you must ensure that the network latency between sites is low enough to support the replication traffic. High latency can degrade performance and increase the risk of quorum loss during transient network issues.

## Decision criteria for stretch designs

When designing a stretched cluster, consider the following:

1. **Network Latency:** Is the latency between sites low enough for your workload? S2D requires low-latency east-west networking [Failover Clustering Storage Architectures in Windows Server](https://learn.microsoft.com/en-us/windows-server/failover-clustering/storage-architectures).
2. **Quorum Witness:** Is the witness in a third, independent location? This is critical for split-brain prevention [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).
3. **Fault Domains:** Are fault domains explicitly defined to match the physical topology? This ensures the cluster can make informed decisions [Fault domain awareness](https://learn.microsoft.com/en-us/windows-server/failover-clustering/fault-domains).
4. **Storage Architecture:** Are you using S2D, SAN, or a mix? S2D has specific constraints on witnesses and node counts [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum), [Failover Clustering Storage Architectures in Windows Server](https://learn.microsoft.com/en-us/windows-server/failover-clustering/storage-architectures).
