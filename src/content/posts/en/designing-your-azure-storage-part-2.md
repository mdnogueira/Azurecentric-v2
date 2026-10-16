---
title: "Designing your Azure Storage – Part 2"
description: "On the previous post, we talked about the designing standard Azure Storage (see here). On this post, I will focus more on the Premium Azure Storage designing."
pubDate: 2017-03-11
category: storage
tags: [architecture]
translationKey: designing-your-azure-storage-part-2
legacy: true
legacyUrl: /2017/03/designing-your-azure-storage-part-2.html
---

On the previous post, we talked about the designing standard Azure Storage ([see here](/posts/designing-your-azure-storage-part-1)). On this post, I will focus more on the Premium Azure Storage designing.

While it is possible to aggregate the throughput of Azure-hosted virtual disks in Azure standard storage accounts by creating multiple disk volumes, this approach might not be sufficient to satisfy the I/O needs of the most demanding Azure IaaS virtual machine workloads. To account for these needs, Microsoft offers a high-performance storage service known as Premium Storage.

Virtual machines that use Premium Storage are capable of delivering throughput exceeding 100,000 IOPS by combining the benefits that two separate components offer. The first one is the SSD-based premium storage account, where virtual machine operating system and data disk files reside. The second one, known as Blobcache, is part of the virtual machine configuration, and it is available only on the DS and GS virtual machine series.

Blobcache is a relatively complex caching mechanism, which benefits from SSD storage on the Hyper-V host where the virtual machine is running.

There are separate limits applicable to the volume of I/O transfers between a virtual machine and a Premium Storage account, and between a virtual machine and a local cache. As a result, the effective throughput limit of a virtual machine is determined by combining the two limits. In case of the largest virtual machine sizes, this cumulative limit exceeds 100,000 IOPS (with the 256 KB size of a single IOP), or 1 GB per second, whichever is lower. Keep in mind that the ability to benefit from caching is highly dependent on I/O usage patterns. For example, read caching would yield no advantages on disks that Microsoft SQL Server transaction logs use, but it would likely provide some improvement for disks that SQL Server database files use.

However, virtual machine I/O throughput is only the first of two factors that determine the overall maximum I/O throughput. The throughput of virtual machine disks also affects effective throughput. In the case of Premium Storage, this throughput depends on the disk size, and it is assigned one of the following performance levels:
  * Disk sizes of up to 128 GB, offering 500 IOPS or 100 MB per second.
  * Disk sizes of up to 512 GB, offering 2,300 IOPS or 150 MB per second.
  * Disk sizes of up to 1 TB, offering 5,000 IOPS or 200 MB per second.

## **Azure Premium Storage pricing**

Azure Premium Storage pricing is calculated based on the size of the disks that you provision, rounded up to the nearest performance level.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com/)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
