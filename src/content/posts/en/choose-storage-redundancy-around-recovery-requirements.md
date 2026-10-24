---
title: "Choose storage redundancy around recovery requirements"
description: "Compare LRS, ZRS, GRS and GZRS against failure scope, secondary access and recovery requirements before changing an Azure Storage account."
pubDate: 2024-03-26
category: storage
tags: ["azure-storage", "storage-redundancy", "disaster-recovery", "geo-replication", "data-protection"]
translationKey: choose-storage-redundancy-around-recovery-requirements
draft: true
---

The useful question when choosing storage redundancy is what the application needs to do when a copy of its data becomes unavailable. Surviving a disk failure, continuing through a zone outage and recovering after a regional disruption are different requirements.

Start with the data and its recovery requirements, then choose the redundancy option. A storage setting can provide additional copies, but it cannot decide whether an application may serve stale data or how the rest of the workload will recover.

## Compare the failure boundaries

For an Azure Storage account, the main choices combine local replication, zone replication and an optional copy in a secondary region.

| Option | Copies in the primary region | Secondary region | Decision it supports |
|---|---|---|---|
| LRS | Synchronous copies in one physical location | None | Local hardware resilience where the remaining site risk is acceptable |
| ZRS | Synchronous copies across three availability zones | None | Resilience to a primary-region zone failure |
| GRS | LRS | Asynchronous replication, then LRS in the secondary | A geographically separate copy for recovery |
| GZRS | ZRS | Asynchronous replication, then LRS in the secondary | Primary-region zone resilience plus a geographically separate copy |

These are the mechanisms described in Microsoft's [storage redundancy reference](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy). Availability depends on the account kind, storage service, tier and region. Check those together rather than assuming every option in this table is available to every account.

ZRS is particularly useful when the requirement is to keep accessing data through a zone disruption. Applications still need transient-fault handling while the service responds to a failure. That storage capability also does not make a single application VM in the failed zone available again.

The redundancy setting applies across the storage services exposed by the account. If two datasets have materially different requirements, consider whether they belong in separate accounts.

## A remote copy can be behind

GRS and GZRS replicate to the secondary region asynchronously. A successful write to the primary is therefore not proof that the secondary already contains it. If the primary cannot be recovered, recent writes which have not reached the secondary can be lost.

That matters when agreeing a recovery point objective, or RPO: the maximum acceptable period of data loss. A requirement for zero lost committed writes cannot be justified merely by selecting geo-redundancy. Microsoft does not provide an SLA for the time taken to replicate data to the secondary region.

Consider an illustrative order-processing application. If the primary accepted an order immediately before an outage, the secondary copy might not yet contain that order. The recovery procedure needs a way to detect and reconcile the discrepancy. Selecting a more geographically distributed storage option does not answer that business question.

Record both the acceptable data-loss window and the maximum acceptable interruption, the recovery time objective. These are workload requirements to validate, rather than guarantees obtained from a dropdown.

## Decide whether secondary reads are useful

RA-GRS and RA-GZRS add read access to the secondary for supported services. They do not provide normal write access to that secondary endpoint.

For Blob Storage, the secondary endpoint uses the account name with **-secondary** appended. For example, **exampleaccount-secondary.blob.core.windows.net** is an illustrative secondary hostname. An application must be designed to use it appropriately and tolerate potentially older data.

A read-only mode might let users view previously stored documents while uploads are unavailable. It is less useful if a screen combines an old document with a current transaction from another data store and presents both as consistent. Microsoft's [geo-redundant application design guidance](https://learn.microsoft.com/en-us/azure/storage/common/geo-redundant-design) discusses this consistency problem and the need to handle failed updates.

Azure Files does not support the read-access secondary capability of RA-GRS or RA-GZRS. Do not design a file-share recovery process around browsing such an endpoint.

Storage account failover is a separate operation which changes the primary endpoint's destination. It needs its own eligibility checks and recovery procedure, including the potential data loss. Reading from a secondary endpoint and failing over an account are different actions.

## Check the account before changing it

In the Azure portal, open the storage account and select **Data management > Redundancy**. Record the current setting and location, then compare the available options with the recovery design.

![Azure portal storage account Redundancy page with replication choices](/images/posts/2024/azc-031-change-replication-option.png)

The options shown are specific to the example account. Before selecting a new value and saving it, check Microsoft's [replication-change guidance](https://learn.microsoft.com/en-us/azure/storage/common/redundancy-migration) for the exact source and target combination.

Adding geo-replication or changing read access differs from adding zone redundancy. Some transitions require a conversion or a manual migration; the account's enabled features and access tiers can also restrict the path. Do not assume that a saved setting means all replication or conversion work has completed.

Include the ongoing storage and transfer costs, and any migration charges, in the decision. Confirm that the secondary location meets the organisation's data-location requirements as well.

## Preserve a route back from mistakes

A replicated deletion is still a deletion. Redundancy protects against infrastructure failures; it does not, by itself, preserve the previous contents of an overwritten object.

For Blob Storage, consider the supported combination of soft delete, versioning, snapshots or other recovery features for the data and account type. Each has its own scope and retention limits. For example, container soft delete and individual blob recovery address different operations. The [Blob Storage data-protection overview](https://learn.microsoft.com/en-us/azure/storage/blobs/data-protection-overview) is a better starting point for that decision than the redundancy setting.

Finish with two checks: demonstrate the intended application behaviour when the primary path is unavailable in a controlled exercise, and restore a deliberately changed test object using the chosen protection mechanism. Record the recovered data and elapsed time against the agreed objectives. Those checks establish much more than the presence of a second-region copy.

