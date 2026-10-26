---
title: "Designing your Azure Storage – Part 1"
description: "On a previous post, I describe the different methods of Azure Storage deployment (see here)."
pubDate: 2017-03-08
category: storage
tags: ["azure-storage", "blob-storage"]
translationKey: designing-your-azure-storage-part-1
legacy: true
legacyUrl: /2017/03/designing-your-azure-storage-part-1.html
---

On a previous post, I describe the different methods of Azure Storage deployment ([see here](/posts/azure-storage-deployment-models)).

When it comes to designing your Azure storage, there is no magic formula. You must understand what is available at the moment on Azure and what is the best solution regarding the functionality that you are looking for.

If you use Azure Storage to host information for a custom solution, such as a mobile app or a web app, cloud architects or developers must select the appropriate storage type for each functional requirement. To assist with this process, you have to understand the characteristics of each storage type.

## **Blob storage**

The Azure blob storage service stores large amounts of unstructured data in the form of files, which typically reside in containers. Containers are similar to file folders, helping you to organize blobs logically in a storage account and providing extra security, although, they support single-level hierarchy only. Each blob can be hundreds of gigabytes in size, and users can access them through a unique URL. For example, subject to access control restrictions, users can access a blob named “myphotos.jpg” in a container named “mypictures” in a storage account named “myaccount” by using the [http://myaccount.blob.core.windows.net/mypictures/myphotos.jpg](http://myaccount.blob.core.windows.net/mypictures/myphotos.jpg) URL.

When creating a blob, you must designate its type. Usually, this happens implicitly based on the intended purpose. For example, creating an IaaS virtual machine would automatically create the .vhd container in the target storage account and a page blob containing the virtual machine disk files. The three types of blobs are:
  * **_Block blobs_****.** Block blobs are optimized for uploads and downloads. To accomplish this optimization, Azure divides data into smaller blocks of up to 100 megabytes (MB) in size, which subsequently upload or download in parallel. Individual block blobs can be up to 4.75 terabytes (TB) in size.
  * **_Page blobs_****.** Page blobs are optimized for random read and write operations. Blobs are accessed as pages, each of which is up to 512 bytes in size. When you create a page blob, you specify the maximum size to which it might grow, up to the limit of 1 TB. Each standard storage account page blob offers throughput of up to 60 MB per second or 500 (8 KB in size) I/O operations per second (IOPS).
  * **_Append blobs_****.** Append blobs are strictly for append operations because they do not support modifications to their existing content. Appending takes place in up to 4 MB blocks—the same size as the individual blocks of block blobs—with up to 50,000 blocks per append blob, which translates roughly into 195 GB.

## **Table storage**

You can use the Azure Table storage service to store partially structured data in tables without the constraints of traditional relational databases. Within each storage account, you can create multiple tables, and each table can contain multiple entities. Because table storage does not mandate a schema, the entities in a single table do not need to have the same set of properties. For example, one Product entity might have a Size property, while another Product entity in the same table might have no Size property at all. Each property consists of a name and a value. For example, the Size property might have the value 50 for a particular product.

Like blobs, applications can access each table through a URL. For example, to access a table named “mytable” in a storage account named “myaccount”, applications would use the following URL: [http://myaccount.table.core.windows.net/mytable](http://myaccount.table.core.windows.net/mytable) URL.

The number of tables in a storage account is limited only by the maximum storage account size. Similarly, besides the limit on the size of the storage account, there are no restrictions on the maximum number of entities in a table. Each entity can be up to 1 MB in size and possess up to 252 custom properties. Every entity also has three designated properties: a partition key, a row key, and a timestamp. The timestamp value generates automatically, but the choice of partition key and row key is up to the table designer.

It is important to choose these two properties carefully because Azure uses their combination to create a clustered index for the table. The clustered index, in turn, considerably improves the speed of table searches, which otherwise would result in a full table scan. You can use the partition key to group similar entities based on their common characteristic, but with unique row key values. Proper selection of the partition key also improves adding entities to a table, by allowing them to insert in batches.

## **Queue storage **

The Azure Queue storage service provides temporary messaging storage. Developers frequently use queues to facilitate reliable exchange of messages between individual components of multitier or distributed systems. These components add and remove messages from a queue by issuing commands over the HTTP or HTTPS protocols.

Like other Azure storage service types, each queue is accessible from a URL. For example, to access a queue named “myqueue” in a storage account named “myaccount”, applications would use the following URL: [http://myaccount.queue.core.windows.net/myqueue](http://myaccount.queue.core.windows.net/myqueue).

You can create any number of queues in a storage account and any number of messages in each queue up to the 500 TB limit for all the data in the storage account. Each message can be up to 64 kilobytes (KB) in size.

Another frequently used Azure service that offers message storage functionality is Service Bus. However, Service Bus queues differ from Azure Storage queues in many aspects.

## **File storage**

The Azure File storage service allows you to create Server Message Block (SMB) file shares in Azure just as you would with an on-premises file server. Within each file share, you can create multiple levels of folders to categorize content. Each directory can contain multiple files and folders. Files can be up to 1 TB in size. A file share’s maximum size is 5 TB.

## **Azure storage pricing**

The cost associated with Azure storage depends on several factors, including:
  * **Storage account kind.** The choice between the general purpose and blob storage accounts has several implications, as described below.
  * **Storage account performance level**. The choice between the Standard and Premium performance levels also significantly affects the pricing model.
  * **Access tier.** This applies to blob storage accounts, which allow you to choose between cool and hot access tiers. This, in turn, affects charges associated with such storage-related characteristics such as space in use, volume of storage transactions, or volume of data reads and writes.
  * **Replication settings.** LRS storage accounts are cheaper than ZRS accounts, which are cheaper than GRS accounts; read-access geographically redundant storage accounts are the most expensive.
    **Note:** The Premium performance level implies the use of LRS, because Premium storage accounts do not support zone and geo-replication.
  * **Volume of storage transactions** (for blob storage accounts and general accounts with Standard performance level). A transaction represents an individual operation (an individual representational state transfer application programming interface [REST API] call) targeting a storage account. Pricing is provided in a currency amount per 10,000 transactions. In case of Premium performance level storage accounts, there are no transaction-related charges.
  * **Volume of egress traffic** (out of the Azure region where the storage account resides). Inbound data transfers to Azure are free, and outbound data transfers from Azure datacenters are free for the first 5 GB per month. Banded pricing applies above this level. Effectively, when services or applications co-locate with their storage, Azure does not impose charges for bandwidth usage between compute and storage resources. Data transfers incur extra cost with compute and storage spanning regions or with compute residing in an on-premises environment.
  * **Amount of storage space in use** (for blob storage accounts and general storage accounts with Standard performance level). Charges are on a per-GB basis. In the case of page blobs, for example, this means that if you create a new 100-GB virtual hard disk file but use only 10 GB of its total volume, you are charged for that amount regardless of how much space was allocated.
  * **Amount of storage space provisioned** (for general purpose storage accounts with Premium performance only). You calculate Azure Premium Storage pricing based on the size of the disks that you provision.
  * **Volume of data reads and writes** (for blob storage accounts with cool access tier only).
  * **Type of storage** (for general purpose storage accounts). Pricing varies depending on whether you use a storage account to host page blobs, block blobs, tables, queues, or files.

For more information, refer to Azure Storage Pricing for the most updated pricing: [azure.microsoft.com/en-us/pricing/details/storage/blobs/](https://azure.microsoft.com/en-us/pricing/details/storage/blobs/)

## **Azure storage partitioning**

When designing Azure Storage–based solutions, you should keep in mind that the recommended approach for load balancing and scaling them out involves partitioning. In this context, a partition represents a unit of storage that can update in an atomic manner as a single transaction.

Each storage service type has its own partitioning mechanism. In the case of blob storage, each blob represents a separate partition. With table storage, the partition encompasses all entities with the same partition key. Queue storage designates each queue as a distinct partition. File storage uses individual shares for this purpose.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com/)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
