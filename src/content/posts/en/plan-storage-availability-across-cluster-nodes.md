---
title: "Plan storage availability across cluster nodes"
description: "Align Windows Server cluster fault domains with physical hardware and configure a quorum witness to maintain storage availability."
pubDate: 2025-08-23
category: backup-dr
tags: ["windows-server", "failover-clustering", "storage-spaces-direct", "quorum", "fault-domains", "azure-local"]
translationKey: plan-storage-availability-across-cluster-nodes
draft: false
---

You are running a Windows Server failover cluster on Azure Local and need to ensure that storage remains available even if hardware fails. The cluster must survive not just a single node outage, but potentially the loss of a rack or an entire site. This requires two distinct but complementary configurations: fault domain awareness to distribute data copies, and a quorum witness to maintain cluster membership.

## Define fault domains to match physical hardware

Fault domain awareness allows the cluster to understand the physical topology of your servers. This is critical for Storage Spaces Direct, which uses these domains to place data copies in separate fault domains to maximise data safety. If all copies are in the same rack, a single rack failure can take down the storage pool.

Fault domains are defined at four levels: site, rack, chassis, and node. You must configure these to reflect the actual physical arrangement of your hardware. The cluster software does not verify that your software-defined topology matches the physical world; if you create two rack fault domains but all servers are in one rack, you have no rack fault tolerance.

You can define fault domains using PowerShell or XML. Using PowerShell, you create the hierarchy with `New-ClusterFaultDomain` and assign nodes to them with `Set-ClusterFaultDomain`. For example, to create a rack and assign a node to it:

```powershell
New-ClusterFaultDomain -Type Rack -Name "Rack A"
Set-ClusterFaultDomain -Name "Server01" -Parent "Rack A"
```

Alternatively, you can use an XML structure that mirrors the hierarchy. This approach is often easier to manage for complex topologies. You retrieve the current topology with `Get-ClusterFaultDomainXML`, edit the XML to add site, rack, and chassis tags, and then apply it with `Set-ClusterFaultDomainXML`. The XML must adhere to the transitive hierarchy: Site > Rack > Chassis > Node.

```xml
<Topology>
  <Site Name="Site1">
    <Rack Name="RackA">
      <Node Name="Server01" />
      <Node Name="Server02" />
    </Rack>
  </Site>
  <Site Name="Site2">
    <Rack Name="RackB">
      <Node Name="Server03" />
      <Node Name="Server04" />
    </Rack>
  </Site>
</Topology>
```

It is important to specify fault domains before enabling Storage Spaces Direct if possible. Once the pool and volumes are created, data will not retroactively move in response to changes in the fault domain topology. If you need to change the topology after S2D is enabled, you must evict the node and clean up its disks using `Remove-ClusterNode -CleanUpDisks`.

## Configure a quorum witness for cluster survival

While fault domains protect your data, the quorum mechanism protects the cluster itself. The quorum determines the number of voting elements that must be active for the cluster to start or continue running. If the cluster loses quorum, it shuts down to prevent data corruption.

In a multi-node cluster, you typically need a quorum witness to provide an odd number of votes, allowing the cluster to survive the loss of a majority of nodes. The three main quorum models are node majority (no witness), node majority with witness, and no majority (disk witness only). The last option is generally not recommended because it creates a single point of failure for the cluster, as the disk witness is the only voting element.

For Azure Local deployments, a cloud witness is a file stored in Azure Blob Storage. It does not store a copy of the cluster database but maintains a witness file. This configuration is recommended when all servers in the cluster have a reliable Internet connection. It allows the cluster to survive site-to-site network failures because the witness is external to both sites, provided the nodes retain connectivity to the cloud.

You can configure a cloud witness using the Configure Cluster Quorum Wizard in Failover Cluster Manager or via PowerShell. You need the Azure storage account name, key, and endpoint. If you use a file share witness instead, the file server must be on a site separate from the cluster workload to ensure equal opportunity for any site to survive a network partition.

## Verify the configuration

After configuring fault domains and the quorum witness, you should validate the setup. Use the `Validate Cluster Quorum` validation test to check if the quorum configuration is optimal. You can run this test using the Validate a Configuration Wizard or the `Test-Cluster` PowerShell cmdlet.

To check the current fault domain topology, use `Get-ClusterFaultDomain`. This will list all nodes and the domains they belong to. You can also check the node votes with `Get-ClusterNode` to see the `NodeWeight` and `DynamicWeight` properties.

If you are using a cloud witness, ensure that the cluster service can reach the Azure storage endpoint. If you shut down all nodes for maintenance, remember that the latest cluster database is not stored in the cloud witness. You must start the cluster service from the last node standing to ensure it can recover the database.


Reference: [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).
