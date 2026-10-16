---
title: "Choosing the type of Azure Blob storage for SQL Backups"
description: "During the storage design on the Azure Foundation workshop that I usually deliver on a beginning of a new Azure project, come the topic and following that, the discussion about…"
pubDate: 2018-05-31
category: storage
tags: [architecture, azure-backup, backup, sql]
translationKey: choosing-the-type-of-azure-blob-storage-for-sql-backups
legacy: true
legacyUrl: /2018/05/choosing-the-type-of-azure-blob-storage-for-sql-backups.html
---

During the storage design on the Azure Foundation workshop that I usually deliver on a beginning of a new Azure project, come the topic and following that, the discussion about what type of storage should we choose for the SQL Backups.

After reviewing the different offerings that Azure provide for storage, we start to brainstorm. Assuming that we are using blob storage for SQL Backups on a running SQL on IaaS. What is really the recommendation regarding the storage type for SQL Backups?

So, lets start with the different storage types that Azure current
offers:
  * **Locally redundant storage (LRS)** – This is the low-cost storage solution. LRS replicates data across 3 fault domains (racks) on the same datacenter.
  * **Zone-redundant storage (ZRS)**– ZRS replicates data across 3 storage clusters in a single region, although to different datacenters.
  * **Geo-redundant storage (GRS)** – GRS replicates data across 3 storage clusters on a region (similar to ZRS) and then replicate to a different region (on 3 different storage clusters). It’s like you have a ZRS replicating to a ZRS on a different region.
  * **Read-access geo-redundant storage (RA-GRS)** – RA-GRS is very similar to GRS, although the second region is a read-only copy.

If we are comparing RPO and RTO on all of the offerings, we could be basically creating a blog post series. And that is not my intention here. Tempting, but no! It will come to the business decide if they are tolerating the amount of data they might be willing to lose. 

## **So, what are the points that you need to consider?**

1. The #1 rule of database recovery, is to get the database backups out of the datacenter that you are running your SQL. This also applies to running SQL on Azure IaaS.  
2. With the first point being the rule, that rules out the usage of LRS storage type.  
3. With ZRS, however, RPO is 0 since your backup (or any) data is synchronous replicated to at least 3 autonomous zones. Plus, you get higher throughput targets with ZRS compared to GRS and RA-GRS.  
4. GRS is too overkill, because you don’t need to have access to the data on the replicated region.  
5. If you used either LRS or GRS, you are still on the same situation as LRS and GRS, where you are depending and have to wait on Microsoft to failover/fix, so you can have access again.  
6. With RA-GRS you can restore a database as soon as you detected the outage.

Even with all of this points to consider, it will come to the business decide if they are tolerating 15 minutes data loss or not. If the business is ok with the 15 minutes data loss and want really to be protected with all the possibilities of disaster, then RA-GRS is probably the best solution. On the other hand, if you have a constraint with budget, ZRS is the storage solution for your SQL Backups, although you need to be aware in case of a region failure you cannot recovery your database until Microsoft solves their issues.

In this case, we decide to go with the RA-GRS.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
