---
title: "Validate Windows Server nodes before creating a cluster"
description: "Validate Windows Server nodes using hardware checks, network isolation, and the Validate a Configuration wizard to prevent quorum and connectivity failures."
pubDate: 2024-04-10
category: backup-dr
tags: ["failover-clustering", "windows-server", "validation", "quorum", "networking", "storage"]
translationKey: validate-windows-server-nodes-before-creating-a-cluster
draft: false
---

You have the hardware, the operating system, and the storage. Before you run the wizard to create the cluster, you need to confirm that the nodes can actually talk to each other and agree on the configuration database. Skipping validation is the fastest way to end up with a quarantined node or a cluster that loses quorum at the first network hiccup.

The goal is not to check if the servers boot, but to verify that the specific components required for failover clustering are compatible and correctly configured. The documentation for Windows Server 2022 and earlier versions recommends that all parts of the failover cluster pass the validation tests in the **Validate a Configuration** wizard to ensure stability [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements).

## Check hardware and storage compatibility

Failover clustering is sensitive to hardware mismatches, particularly in the storage stack. If you are using Serial Attached SCSI (SAS) or Fibre Channel, the entire storage path must be identical across all nodes. This includes the multipath I/O (MPIO) software, the Device-Specific Module (DSM), the host bus adapter (HBA), the HBA drivers, and the HBA firmware [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements). If you use different HBAs, you must verify with your storage vendor that you are following their configuration guidelines [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements).

For iSCSI, the requirement is slightly different but equally strict. Each clustered server should have one or more network adapters or HBAs dedicated to cluster storage, and these adapters must be identical across all servers [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements). You should only use the network connected to the iSCSI target for cluster storage traffic. Using a shared network for both cluster communication and iSCSI traffic is not recommended and can lead to performance degradation or connectivity issues [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements).

If you are using Storage Spaces Direct, the hardware requirements are managed by the platform, but you still need to ensure that the underlying storage is compatible with Windows Server 2012 R2 and later [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements). For traditional shared storage, you must use basic disks, not dynamic disks, and format partitions with NTFS for Cluster Shared Volumes (CSV) [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements).

## Verify network connectivity and redundancy

Network configuration is the most common source of cluster instability. The documentation recommends using multiple, distinct networks to avoid single points of failure [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements). If you connect cluster nodes with a single network, that network must pass the redundancy requirement in the validation wizard, but you will still see a warning that the network should not have single points of failure [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements).

For Switch Embedded Teaming (SET), the network interface card (NIC) adapters, drivers, and firmware must exactly match for the teaming to function properly in all cluster nodes [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements). Mismatched drivers can cause intermittent connectivity, which triggers quorum loss events.

You should also check the Windows Firewall settings. Event 1572 in the System log indicates that a node failed to join the cluster because it could not send and receive failure detection network messages [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events). The guidance for this event is to run the **Validate a Configuration** wizard to ensure network settings and verify the Windows Firewall 'Failover Clusters' rules [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events).

## Run the Validate a Configuration wizard

The **Validate a Configuration** wizard is the primary tool for checking your setup. It tests hardware, network, and storage components against the requirements for failover clustering. You can run this wizard on each node individually or as part of a cluster creation process.

1. Open **Failover Cluster Manager** on one of the nodes.
2. Click **Validate Configuration** in the Actions pane.
3. Select **One or more servers** and add all the nodes you intend to include in the cluster.
4. Run all the tests. The wizard will check for hardware compatibility, network connectivity, and storage configuration.

Pay close attention to the warnings. A warning does not necessarily prevent cluster creation, but it indicates a potential risk. For example, if the network test reports that the network has single points of failure, you should address this before proceeding [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements).

## Review the system log for critical events

Even after running the validation wizard, you should check the System event log for any Failover Clustering events. These events share the source **FailoverClustering** and can provide early warnings of configuration issues [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events).

Look for Event 1546 (**SERVICE_FORM_VERSION_INCOMPATIBLE**) and Event 1547 (**SERVICE_CONNECT_VERSION_INCOMPATIBLE**), which indicate that nodes are running incompatible versions of the cluster service software [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events). Ensure that all nodes are running the same version of Windows Server and that any recent upgrades have been applied consistently across the cluster [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events).

Event 1135 (**EVENT_NODE_DOWN**) indicates that a cluster node was removed from the active failover cluster membership [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events). This can happen if the node loses communication with other active nodes. The guidance for this event is to run the **Validate a Configuration** wizard to check your network configuration and check for hardware or software errors related to the network adapters [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events).

## Confirm quorum and witness configuration

Quorum is not a backup; it is the mechanism by which the cluster decides which nodes are active and which are not. A disk witness serves as the quorum resource in a Node and Disk Majority configuration. The cluster configuration database is stored on the quorum resource, which can be a disk witness or a file share witness [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements).

If you are using a file share witness, ensure that the file share exists and is accessible by the cluster. Event 1564 (**RES_FSW_ARBITRATEFAILURE**) indicates that a file share witness resource failed to arbitrate for the file share [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events). The guidance is to ensure that the file share exists and is accessible by the cluster [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events).

Event 1177 (**MM_EVENT_ARBITRATION_FAILED**) indicates that the Cluster service is shutting down because quorum was lost [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events). This can be due to the loss of network connectivity between some or all nodes in the cluster, or a failover of the witness disk [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events). The guidance is to run the **Validate a Configuration** wizard to check your network configuration and check for hardware or software errors related to the network adapter [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events).

## Next steps

Once the validation wizard has passed and the system log is clear of critical Failover Clustering events, you can proceed to create the cluster. Use the **Create Cluster** wizard and specify the nodes and the cluster name. After the cluster is created, verify that all nodes are online and that the cluster service is running correctly on each node.

If you encounter issues after cluster creation, refer to the Failover Clustering system events for troubleshooting guidance [Failover Clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events). The events provide specific error codes and guidance for resolving common issues, such as network connectivity problems, version incompatibilities, and quorum loss.
