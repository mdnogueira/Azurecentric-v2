---
title: "Azure Storage Deployment Models"
description: "First, we need to understand what is Azure Storage Service and how we can use it."
pubDate: 2017-02-28
category: storage
tags: [architecture]
translationKey: azure-storage-deployment-models
legacy: true
legacyUrl: /2017/02/azure-storage-deployment-models.html
---

First, we need to understand what is Azure Storage Service and how we can use it.

Azure storage is a cloud storage systems that enables organizations the ability to store seemingly and limitless amounts of data for any duration of time. On Azure the data is stored durably using both local and geographic replication to improve and facilitate disaster recovery.

Azure storage is a service that can be used to store partially structured and unstructured data. There are many ways to use Azure Storage as a service. Usually, and what I have seen using the majority of the times is to host App Service, PaaS cloud services or even to facilitate data exchange between components of Azure based solutions. On the other hand, for IaaS is heavily used to store the Azure VM disks or even to host network file shares. Besides these examples exist a lot more scenarios that you can leverage the Azure Storage Service. Although, Azure Storage offers four types of storage services:
  * **Blobs** - These typically represent unstructured files such as media content, virtual machine disks, backups, or logs. Blobs facilitate locking mechanism, ensuring exclusive file access that IaaS virtual machines require. There are three types of blobs.
    * **Block blob**, is optimized for sequential access, which is ideal for media content.
    * **Page blob**, offers superior random access capabilities, which is best suited for virtual machine disks.
    * **Append blob**, applies to data append operations, without the need to modify existing content. This works best with logging and auditing activities.
  * **Tables** - These host nonrelational and partially structured content, which consists of multiple rows of data with different sets of properties. In the context of Azure Table storage, these rows are referred to as entities. Developers frequently implement table storage as the backend data store for App Service or PaaS cloud services.
  * **Queues** - These are temporary storage for messages that Azure services commonly use to asynchronously communicate with each other. In distributed applications, a source component sends a message by placing it in a queue. The destination component works though the messages in the queue one at a time.
  * **Files** - Like blobs, these provide storage for unstructured files, but they offer support for file sharing in the same manner as traditional on-premises Windows file shares.

## **Storage Accounts**

To start to use the Azure Storage service you need to create a storage account. There are two tiers of storage accounts: Standard and Premium. Premium Storage accounts offers superior performance because of its reliance on solid-state drive (SSD) technology. Although, these storage account are strictly for page blob storage. Standard Storage account uses traditional hard disk drives.

Storage accounts can be created for different purposes.
  * Dedicate a storage account for maintenance of master images to be deployed to other storage accounts.
  * Dedicate a storage account for backup, separate from production data and in a separate region than the primary data.

### **Storage Account Design**

There is no magical formula to design the storage account in Azure. Although, there are some considerations that you are good idea to take in count:
  * Storage accounts have many variables
  * Establish a Storage “Stamp” model
  * Determine initial storage account footprint based on workload requirements
  * Determine process and policy where a new stamp would be created or extended
  * Typical “stamp” would include these storage accounts:
    * LRS
    * GRS
    * Premium Storage

Beside all the points above to take in consideration, there are some good practices when it comes to design the storage solution that you want to use in Azure.
  1. **Storage Costs** - Type of data will be cost driver; critical data might need GRS whereas less critical data may suffice with just LRS. Quick Access Data with high IOPS will drive the usage of Premium Storage, while lower requirements may accept Standard Storage.
  2. **Containers for Organizing Data** - Use containers like how a folder structure in a file server would be used. By default, all VHDs will be put into the “vhds” container in a storage account. However, this destination can be changed.
  3. **Concurrency Settings** - Blob service allows you to specify **optimistic** or **pessimistic** concurrency to manage access to blob and containers. Last write winds by default. For IaaS, concurrency settings do not need to be modified. While for PaaS, developers need to take concurrency into consideration depending on the app and user base data types
  4. **Storage Account Limits**
    1. Primary Constrain: Amount of VHD files a single storage account allows and storage account requests limits.
    2. Basic Tier VMs: No more than 66 highly used VHDs in a storage account. Only allowed 20,000/300 request rate limit.
    3. Standard Tier VMs: No more than 40 highly used VHDs in a storage account. Only allowed 20,000/500 request rate limit.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
