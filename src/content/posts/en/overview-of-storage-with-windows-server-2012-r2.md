---
title: "Overview of Storage with Windows Server 2012 R2"
description: "Storage solutions play a critical role in the modern datacenter. Windows Server 2012 R2 was designed with a strong focus on storage capabilities, from the foundation of the…"
pubDate: 2013-06-20
category: windows-server
tags: [backup, hyper-v, storage]
translationKey: overview-of-storage-with-windows-server-2012-r2
legacy: true
legacyUrl: /2013/06/overview-of-server-virtualization-with-windows-server-2012-r2.html
---

Storage solutions play a critical role in the modern datacenter. Windows Server 2012 R2 was designed with a strong focus on storage capabilities, from the foundation of the storage stack up, to improvements ranging from provisioning storage to how data is clustered, transferred across the network, and ultimately accessed and managed. With flexible capabilities that can be combined to meet your business needs, Windows Server 2012 R2 storage solutions deliver the efficiency, performance, resiliency, availability, and versatility you need at every level.  

## High-performance storage on industry-standard hardware 

Windows Server 2012 R2 provides a rich set of storage features allowing you to take advantage of lower-cost industry-standard hardware rather than purpose-built storage devices, without you having to compromise on performance or availability.  

For example, **Storage Spaces **provides sophisticated virtualization enhancements to the storage stack that you can use to pool multiple physical hard disk units together and provide feature-rich, highly resilient, and reliable storage arrays to your workloads. You can use Storage Spaces to create storage pools, which are virtualized administration units that are aggregates of physical disk units. With these storage pools, you can enable storage aggregation, elastic capacity expansion, and delegated administration. You can also create virtual disks with associated attributes that include a desired level of resiliency, thin or fixed provisioning, and automatic or controlled allocation on diverse storage media.  

**Storage tiering**, a new feature in Windows Server 2012 R2, is a great example of how storage performance can be dramatically enhanced while using lower-cost industry standard hardware. With storage tiering, low cost, high capacity spinning disks are used to store less frequently used data, while high-speed solid state disks are reserved to store frequently used data. Storage tiering builds on storage virtualization with Storage Spaces by assigning solid state drives (SSD) and hard disk drives (HDD) to the same storage pool and using them as different tiers in the same tiered space. Windows Server 2012 R2 recognizes the tiers and optimizes them by moving often used “hot” data to the SSD tier. Windows Server 2012 R2 tracks data temperature and moves data at the sub-file level; only “hot” regions of a file (such as VHD or database) need to move to SSDs, the “cold” regions can reside on HDDs.  

Since Windows Server 2012, with a feature referred to as **SMB Direct, **the SMB protocol has provided support for Remote Direct Memory Access (RDMA) network adapters, which allows storage performance capabilities that rival Fiber Channel. RDMA network adapters enable this performance capability by operating at full speed with very low latency due to the ability to bypass the kernel and perform write and read operations directly to and from memory. This capability is possible since reliable transport protocols are implemented on the adapter hardware and allow for zero-copy networking with kernel bypass. With this capability, applications, including SMB, can perform data transfers directly from memory, through the adapter, to the network, and then to the memory of the application requesting data from the file share.  

## Continuous application availability and robust recovery 

Windows Server 2012 R2 reduces server downtime and application disruption by letting you store server application data on file shares and obtain a similar level of reliability, availability, manageability, and high performance that would typically be expected from a high-end Storage Area Network (SAN).  

Introduced in Windows Server 2012, **SMB Transparent Failover **allows you to transparently move SMB file shares between the file server cluster nodes, without noticeable interruption of service for the SMB client. This is useful for planned events (for example, when you need to perform maintenance on a node) or surprise events (for example, when a hardware failure causes a node to fail). This is achieved regardless of the kind of operation that was underway when the failure occurred.  

One the main advantages of file storage over block storage is the ease of configuration, paired with the ability to configure folders that can be shared by multiple clients. Windows Server 2012 has taken file-based storage one step further by introducing the **SMB Scale-Out **feature, which provides the ability to share the same folders from multiple nodes of the same cluster. This is made possible by the use of Cluster Shared Volumes (CSV), which since Windows Server 2012 support file sharing. New in Windows Server 2012 R2, SMB sessions can now also be managed per share (not just per file server), increasing flexibility. And SMB Scale-out now also offers finer-grained load distribution by distributing workloads from a single client across many nodes of a scale-out file server.  

Another innovation around Windows Server 2012 R2 is the **Windows Azure Hyper-V Recovery Manager **offering, a related service which offers a robust recovery solution that takes advantage of Hyper-V Replica. 

For organizations with two or more datacenters looking to protect vital workloads running in their datacenter, Windows Azure Hyper-V Recovery Manager enables them to combine Windows Azure, System Center Virtual Machine Manager, and Hyper-V Replica to deliver planned and cost-effective business continuity of workloads. With Windows Azure Hyper-V Recovery Manager, datacenters can be protected by automating the replication of the virtual machines that compose them at a secondary location. Windows Azure Hyper-V Recovery Manager also provides continuous health monitoring of the primary datacenter, and it helps automate the orderly recovery of services in the event of a site outage at the primary datacenter. Virtual machines are started in an orchestrated fashion to help restore service quickly. This process can also be used for testing recovery without disruption to services, or temporarily transferring services to the secondary location. 

## Comprehensive storage management and backup 

Windows Server 2012 R2 provides great management and backup capabilities that help you better manage your storage capacity whether you have a single server or multiple servers, whether you have one class of storage or a variety of storage solutions, and whether you have a Windows only or a heterogeneous environment.  

**Storage QoS **is a new feature in Windows Server 2012 R2 that allows you to restrict disk throughput for overactive or disruptive virtual machines and can be configured dynamically while the virtual machine is running. For maximum bandwidth applications, it provides strict policies to throttle IO to a given virtual machine to a maximum IO threshold. For minimum bandwidth applications, it provides policies for threshold warnings that alert of an IO starved VM when the bandwidth does not meet the minimum threshold.  

Also, to help improve storage management efficiency and offset that cost, Windows Server 2012 R2 comes with a **set of storage management APIs and provider interfaces **that enables administrators to centrally manage disparate storage resources and solutions, such as SANs and storage arrays, from a centralized “single pane of glass” interface. Manageable resources can include SANs that are SMI-S compliant, storage devices with proprietary hardware that has compatible third-party storage management providers, or storage devices that are already being allocated through the use of Storage Spaces. This storage management capability will allow administrators to configure and manage all of the storage devices throughout their organization or management sphere through an easy-to-use management interface that they are already familiar with, the Server Manager in Windows Server.  

By using Server Manager, administrators can populate server groups with file servers or storage clusters that leverage Storage Spaces, or reach out to populate manageable devices that have SMI-S agents enabled.  

If you have a small number of servers to protect and you currently have no backup solution or you are using the inbox Windows Server Backup tool on these servers, **Windows Azure Backup **is a separate offering that extends the capabilities of Windows Server Backup and System Center Data Protection Manager to deliver simple and reliable off-site data protection at the cost of cloud storage. It is suitable for any workload, such as file servers, SharePoint, SQL, Exchange, and others.  

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
