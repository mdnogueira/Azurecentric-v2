---
title: "Storage and Continuous Availability Enhancements in Windows Server 2012"
description: "Windows Server 2012 will provide a continuum of availability options to protect against a wide range of failure modes in different tiers – storage, network, and compute. These…"
pubDate: 2012-06-02
category: windows-server
tags: ["windows-server", "smb"]
translationKey: storage-and-continuous-availability-enhancements-in-windows-server-2012
legacy: true
legacyUrl: /2012/06/storage-and-continuous-availability-enhancements-in-windows-server-2012.html
---

Windows Server 2012 will provide a continuum of availability options to protect against a wide range of failure modes in different tiers – storage, network, and compute. These options will enable higher levels of availability and cost-effectiveness, as well as easier deployment for all customers – from small business to mid-market to enterprises - and across single servers, multiple servers, and multi-site cloud environments. Windows Server 2012delivers on continuous availability by efficiently utilizing industry standard storage, network and server components. That means many IT organizations will have capabilities they couldn’t previously afford or manage.

SMB 2.2 transparent failover, along with SMB 2.2 Multichannel and SMB 2.2 Direct, enables customers to deploy storage for workloads such as Hyper-V and SQL Server on cost efficient, continuously available, high performance Windows Server 2012 File Servers.

Below are some of the key features we’re delivering in Windows Server 2012 involving SMB 2.2.
  * **Transparent Failover and node fault tolerance with SMB 2.2**. Supporting business critical server application workloads requires the connection to the storage back end to be continuously available. The new SMB 2.2 server and client cooperate to provide transparent failover to an alternative cluster node for all SMB 2.2 operations for both planned moves and unplanned failures.
  * **Fast data transfers and network fault tolerance with SMB 2.2 Multichannel.** With Windows Server 8, customers can store application data (such as Hyper-V and SQL Server) on remote SMB 2.2 file shares. SMB2.2 Multichannel provides better throughput and multiple redundant paths from the server (e.g., Hyper-V or SQL Server) to the storage on a remote SMB2.2 share. Network path failures are automatically and transparently handled without application service disruption.
  * **Scalable, fast and efficient storage access with SMB2 Direct.** SMB2 Direct (SMB over RDMA) is a new storage protocol in Windows Server 8. It enables direct memory-to-memory data transfers between server and storage, with minimal CPU utilization, while using standard RDMA capable NICs. SMB2 Direct is supported on all three available RDMA technologies (iWARP, InfiniBand and RoCE.) Minimizing the CPU overhead for storage I/O means that servers can handle larger compute workloads (e.g., Hyper-V can host more VMs) with the saved CPU cycles.
  * **Active-Active File sharing with SMB 2.2 Scale Out.** Taking advantage of the single namespace functionality provided by Cluster Shared Volumes (CSV) v2, the File Server in Windows Server 2012can provide simultaneous access to shares, with direct I/O to a shared set of drives, from any node in a cluster. This allows utilization of all the network bandwidth into a cluster and load balancing of the clients, in order to optimize client experience.
  * **Volume Shadow Copy Service (VSS) for SMB 2.2 file shares.** Remote VSS provides application-consistent shadow copies for data stored on remote file shares to support app backup and restore scenarios.

Alongside the SMB 2.2 Server implementation in Windows Server 2012, Microsoft is working with two leading storage companies, NetApp and EMC, to enable them to fully integrate SMB 2.2 into their stacks and provide Hyper-V over SMB 2.2 solutions. Having NetApp and EMC on board not only demonstrates strong industry support of SMB 2.2 as a protocol of choice for various types of customers, but also highlights how the industry is aligned with our engineering direction and its support for our Windows Server 2012 storage technology.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
