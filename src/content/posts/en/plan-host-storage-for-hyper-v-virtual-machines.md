---
title: "Plan host storage for Hyper-V virtual machines"
description: "Choose a Hyper-V storage architecture for Windows Server 2025 by weighing high availability requirements against scaling flexibility."
pubDate: 2025-10-18
category: hyper-v
tags: ["hyper-v", "windows-server", "storage-architecture", "storage-spaces-direct", "san", "nas"]
translationKey: plan-host-storage-for-hyper-v-virtual-machines
draft: false
---

You are planning to host virtual machines on Windows Server 2025. The first technical decision is not about the VMs themselves, but about where their disks live. Windows Server Hyper-V supports a wide range of physical storage architectures, from simple local disks to complex clustered environments. Choosing the wrong foundation can limit your ability to migrate workloads, scale resources, or recover from hardware failures.

The core question is whether you need shared storage for high availability, or if local storage with specific migration tools is sufficient. The answer depends on your cluster requirements and how you expect your compute and storage needs to grow.

[![Hyper-V Storage Architecture Decision Flow](/images/posts/2025/azc-235-checkpoints.svg)](/images/posts/2025/azc-235-checkpoints.svg)

## Standalone Hyper-V with local disks

If you are running a single server or a non-clustered environment, you can use local disks. This is the simplest architecture to deploy. You install Hyper-V on a standalone server and store your virtual machine files on the local drives.

There are significant limitations to this approach. Standalone Hyper-V with local disks does not support automatic failover of virtual machine workloads. Because there is no shared storage and the compute systems are not clustered, if the physical host loses power or suffers a hardware failure, the VMs do not restart on another node. They simply restart when you power the physical host back on [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).

You can still achieve some level of resilience by configuring local disk resiliency using hardware or software RAID solutions [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). However, this protects against disk failure, not host failure. If you need to move VMs to other nodes or clusters, you can use shared-nothing migration, but this requires planning and does not provide the seamless high availability found in clustered environments [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).

## Hyper-V with SAN or NAS Storage

For environments requiring high availability, you can use a disaggregated configuration where Hyper-V is installed in a cluster and VMs access their storage over the network from a SAN (Storage Area Network) or NAS (Network Attached Storage) vendor system [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).

In this model, VMs are highly available to any node in the same compute cluster. The SAN or NAS system provides its own availability guarantees, independent of the Hyper-V hosts [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). This allows you to scale compute and storage independently. If you need more processing or memory resources, you can add more compute nodes or clusters without adding more storage. Each compute cluster can contain between 1 and 64 nodes [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).

Storage scaling is vendor-specific. You must contact your storage vendor to understand how their solution scales [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). This architecture is ideal if your storage requirements grow at a different rate than your compute requirements, or if you already have an enterprise SAN/NAS infrastructure in place.

## Hyperconverged Hyper-V and Storage Spaces Direct

Hyperconverged infrastructure combines compute and storage in the same physical nodes. You install Hyper-V and Storage Spaces Direct on each node in a cluster. Each node contains local disks, but data is replicated to other nodes in the same cluster [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).

This configuration allows you to move VMs to any node in the cluster using Live Migration or automatically restart them after a failure (failover) [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). Data replication increases storage resilience. Storage Spaces Direct supports several resiliency models, which you can review in the [fault tolerance documentation](/azure/azure-local/concepts/fault-tolerance?context=/windows-server/context/windows-server-virtualization) [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).

Because each physical host contains both storage and compute resources, these resources scale symmetrically. Every new host automatically adds both compute and storage resources. Each cluster can contain between 1 and 16 nodes [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). This is a practical choice if you want to simplify your infrastructure by eliminating the need for a separate SAN/NAS, but you need to be aware that storage capacity grows with every compute node you add.

## Hyper-V with Disaggregated Storage Spaces Direct

If you want the benefits of Storage Spaces Direct but need to scale compute and storage independently, you can use disaggregated Storage Spaces Direct. In this configuration, you install Hyper-V and Storage Spaces Direct in separate clusters. The Hyper-V cluster accesses the VMs' configuration and storage over the network from the Storage Spaces Direct cluster [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).

VMs are highly available to any node in the same compute cluster. Data is replicated to nodes in the storage cluster to increase resilience [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). This architecture is ideal for scenarios where storage and compute requirements grow at different rates. For example, if you need more CPU or memory, you can add extra compute cluster nodes without adding more storage. Conversely, if you have VMs that consume a lot of storage but few CPU resources, you can add another storage node or cluster without adding more compute resources [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).

In this model, each compute cluster can contain between 1 and 64 nodes, and each storage cluster can contain between 1 and 16 nodes [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). You can add more compute resources by adding a new node to the existing compute cluster or by adding a new cluster. Similarly, you can add more storage resources by adding a new node to the existing storage cluster or by adding a new cluster [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).

## Mixed Architecture Support

Hyper-V supports combining different architectures in the same compute cluster. You can mix Disaggregated Storage Spaces Direct, Disaggregated Hyper-V with SAN, and Disaggregated Hyper-V with NAS within a single compute cluster [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). This flexibility allows you to leverage existing storage investments while adopting new architectures for specific workloads.

Windows Server supports various network file storage protocols, including SMB over TCP, SMB over QUIC, and SMB over RDMA (SMB Direct) [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). It also supports network block storage protocols such as iSCSI, Fibre Channel, and InfiniBand [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). Note that configuration specifics determine protocol support. For example, deployments using the Hyper-V virtual switch do not support InfiniBand, but they can support InfiniBand devices when they are not bound to the virtual switch [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture). Microsoft provides an in-box software-based iSCSI initiator, and you can also use storage vendor clients for any device available in the Windows Server catalog [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture).
