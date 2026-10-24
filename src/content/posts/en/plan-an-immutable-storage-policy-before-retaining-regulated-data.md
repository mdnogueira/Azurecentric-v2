---
title: "Plan an immutable storage policy before retaining regulated data"
description: "Plan immutable storage policies by choosing between container-level and version-level WORM, then lock and verify retention."
pubDate: 2025-11-27
category: storage
tags: ["azure-storage", "immutable-storage", "compliance", "blob-storage", "worm"]
translationKey: plan-an-immutable-storage-policy-before-retaining-regulated-data
draft: true
---

You need to retain regulated blob data without the risk of modification or deletion. Azure Blob Storage offers immutable storage to enforce a Write Once, Read Many (WORM) state. The first decision is not which tool to use, but which scope fits your regulatory and operational constraints: container-level or version-level immutability.

Container-level policies apply a single retention rule to all blobs in a container. They are simpler to manage and do not require blob versioning. Version-level policies allow granular control per blob version but require versioning to be enabled and cannot be used with Azure Data Lake Storage (accounts with hierarchical namespace enabled). 

[![Immutable Storage Policy Lifecycle and Scope](/images/posts/2025/azc-249-checkpoints.svg)](/images/posts/2025/azc-249-checkpoints.svg)

## Choose the correct scope

The choice between container-level and version-level WORM depends on how your data is organised and whether you can tolerate the overhead of versioning.

Container-level WORM is suitable when you can group data by retention period into distinct containers. It supports both time-based retention and legal holds. There is no requirement to enable blob versioning, which avoids the associated billing impact and storage overhead. However, policies are applied uniformly to all blobs in the container; you cannot assign different retention periods to individual blobs within the same container. There is a limit of 10,000 containers with locked policies per storage account.

Version-level WORM allows policies to be set at the account, container, or individual blob version level. This is necessary if you need to retain specific versions of a blob for different durations or if you have a mixed workload where some data requires immutability and other data does not. Crucially, version-level policies require blob versioning to be enabled. If you are using Azure Data Lake Storage (hierarchical namespace), version-level WORM is not yet supported; you must use container-level WORM. Once version-level immutability is enabled on a storage account, it cannot be disabled.

| Criteria | Container-level WORM | Version-level WORM |
|---|---|---|
| Policy granularity | Container only. All blobs inherit the policy. | Account, container, or blob version. |
| Prerequisites | None. | Blob versioning must be enabled. |
| Data Lake Storage | Supported. | Not supported. |
| Existing data | Can be enabled on existing containers. | Requires migration for existing containers if not enabled at creation. |

## Configure the policy

Once you have selected the scope, you can configure the policy. For a time-based retention policy, you specify the retention interval in days. The minimum is one day, and the maximum is 146,000 days (400 years). The effective retention period for a blob is calculated from its creation time plus the retention interval. If the policy is extended, the effective period for existing blobs is recalculated using the new interval.

You can configure a container-level time-based retention policy using the Azure portal, PowerShell, or Azure CLI. The following PowerShell example sets a 10-day retention policy on a container named `regulated-data`.

```powershell
# Illustrative example: configure a container-level time-based retention policy
Set-AzRmStorageContainerImmutabilityPolicy -ResourceGroupName "my-rg" `
    -StorageAccountName "mystorageaccount" `
    -ContainerName "regulated-data" `
    -ImmutabilityPeriod 10
```

If your workload requires appending data to append blobs (e.g., for logging) while maintaining immutability, you can enable protected append writes. This allows new blocks to be added to the end of the blob but prevents modification or deletion of existing blocks. This setting is only available for container-level policies.

## Lock the policy for compliance

When you first create a time-based retention policy, it is in an unlocked state. This allows you to test the configuration, shorten or extend the retention period, or delete the policy entirely. However, an unlocked policy does not meet the requirements for strict regulatory compliance such as SEC 17a-4(f). 

To achieve a compliant immutable state, you must lock the policy. Once locked, the policy cannot be deleted. You can extend the retention period, but you cannot shorten it. For container-level policies, you are allowed a maximum of five increases to the effective retention period over the lifetime of the locked policy. Microsoft recommends locking the policy within 24 hours of creation to ensure data is protected as soon as possible.

To lock the policy using PowerShell, you first retrieve the policy to obtain its ETag, then pass that ETag to the lock command.

```powershell
# Illustrative example: lock a container-level time-based retention policy
$policy = Get-AzRmStorageContainerImmutabilityPolicy -ResourceGroupName "my-rg" `
    -AccountName "mystorageaccount" `
    -ContainerName "regulated-data"

Lock-AzRmStorageContainerImmutabilityPolicy -ResourceGroupName "my-rg" `
    -AccountName "mystorageaccount" `
    -ContainerName "regulated-data" `
    -Etag $policy.Etag
```

Legal holds operate differently. They store data in a WORM state until explicitly cleared. A legal hold can be applied alongside a time-based retention policy. Unlike time-based policies, legal holds do not have a fixed duration and are not subject to the five-extension limit. However, they must be associated with one or more user-defined alphanumeric tags.

## Verify and monitor

After locking the policy, you should verify that the data is protected. You can attempt to modify or delete a blob in the container; the operation should fail. The Azure portal displays the policy status under the container's Access policy settings.

Audit logging is available for container-level time-based retention policies. The audit log records up to seven commands for locked policies, including the user ID, command type, timestamps, and retention interval. This log is retained for the lifetime of the policy. For broader monitoring of management activities, the Azure Activity log provides a comprehensive record of all changes to the immutability policy configuration.

If you need to track the status of immutability policies across multiple containers, you can use Azure Storage blob inventory. The inventory report provides an overview of containers and blobs, including whether an immutability policy is configured. Note that you cannot configure an inventory policy in an account if version-level immutability is enabled.

Before applying immutability policies, ensure you have enabled blob soft delete. Soft delete applies to all blobs in the account, regardless of immutability status. It provides an additional layer of protection against accidental deletion. If a blob is soft-deleted while an immutability policy is in effect, it remains protected until the soft delete retention period expires. Once the soft delete retention period expires, the soft-deleted blob is permanently deleted, even if the immutability policy is still active.

The final step is to confirm that the locked policy is in place and that the audit log is recording changes. If the policy is locked and the data is inaccessible for modification, your retention requirement is met. If you need to adjust the retention period, you can extend it, but you cannot reduce it. Plan your initial retention interval carefully to avoid the need for extensions, which are limited to five times for container-level policies.

References for Plan an immutable storage policy before retaining regulated data: [Overview of immutable storage for blob data](https://learn.microsoft.com/en-us/azure/storage/blobs/immutable-storage-overview), [Configure immutability policies for containers](https://learn.microsoft.com/en-us/azure/storage/blobs/immutable-policy-configure-container-scope), [Time-based retention policies for immutable blob data](https://learn.microsoft.com/en-us/azure/storage/blobs/immutable-time-based-retention-policy-overview).
