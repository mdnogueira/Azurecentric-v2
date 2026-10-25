---
title: "Investigate throttling before changing a Storage account design"
description: "Troubleshoot Azure Storage throttling by verifying error codes and targets before redesigning the account."
pubDate: 2026-05-09
category: storage
tags: ["troubleshooting", "azure-storage", "throttling", "performance", "blob-storage"]
translationKey: investigate-throttling-before-changing-a-storage-account-design
draft: false
---

Latency spikes or request failures in Azure Storage often trigger an instinct to redesign the storage account, switch tiers, or change partitioning strategies. Before making those changes, you need to confirm whether you are actually hitting a throttling limit or if the issue lies elsewhere. Azure Storage uses specific performance targets, and exceeding them triggers throttling that manifests as increased latency or specific error codes.

## Confirm the symptom against the error codes

Throttling in Azure Storage is not always a silent slowdown. When a client exceeds the performance targets for a storage account or a specific partition, the service returns specific HTTP status codes. According to the performance checklist for Blob Storage, when an application reaches the limit of what a partition can handle, Azure Storage returns error code 503 (Server Busy) or error code 500 (Operation Timeout) [Performance checklist for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist).

If you are seeing 503 or 500 errors, you are likely facing throttling. However, these codes can also indicate transient network issues or backend service unavailability. The first step is to verify that the errors correlate with high request rates or large data transfers. If your application is retrying requests aggressively without a backoff policy, it can exacerbate the throttling [Performance checklist for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist). The exponential backoff allows the load on the partition to decrease, and to ease out spikes in traffic to that partition [Scalability and performance targets for standard storage accounts](https://learn.microsoft.com/en-us/azure/storage/common/scalability-targets-standard-account).

## Check the account-level targets

Azure Storage defines "targets" rather than hard "limits" because some values can be increased upon request [Performance checklist for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist). For a standard general-purpose v2 (GPv2) storage account, the default maximum request rate is 40,000 requests per second in most major regions, and 20,000 requests per second in other regions [Scalability and performance targets for standard storage accounts](https://learn.microsoft.com/en-us/azure/storage/common/scalability-targets-standard-account). The default maximum ingress is 60 Gbps in those same major regions, and 25 Gbps elsewhere [Scalability and performance targets for standard storage accounts](https://learn.microsoft.com/en-us/azure/storage/common/scalability-targets-standard-account).

If your application is generating traffic that approaches these numbers, you are likely hitting the account-level throttle. For example, if you are uploading large files in parallel, you might hit the ingress limit before you hit the request count limit. Conversely, if you are performing many small read operations, you might hit the request rate limit first.

It is important to note that these targets apply to the entire storage account, not just individual blobs or containers. If you have multiple applications writing to the same account, their combined traffic counts toward the limit. If you are approaching these thresholds, you might consider distributing your workload across multiple storage accounts. The performance checklist recommends using separate storage accounts per region for multiple regions with different data needs, or for shared data, using object replication policies to move data closer to clients [Performance checklist for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist).

## Evaluate partition-level throttling

Even if you are well below the account-level targets, you might still experience throttling at the partition level. Azure Storage distributes data across partitions to scale performance. If your application concentrates requests on a small number of blobs or partitions, those specific partitions can become bottlenecks.

The performance checklist for developers highlights that larger blob or block sizes (greater than 256 KiB) activate high-throughput block blobs, which are not affected by partition naming [Performance checklist for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist). If you are using small block sizes, you should consider adding a hash prefix or seconds value to your partition keys to improve load balancing [Performance checklist for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist). This helps distribute the load across more partitions, reducing the likelihood of hitting partition-level throttling.

## Consider premium storage for high transaction rates

If your workload consistently requires high transaction rates and low latency that exceed the standard targets, you might consider premium block blob storage accounts. Premium storage accounts are designed for high transaction rates and low latency beyond standard targets [Performance checklist for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist). However, this is a design change with cost implications. You should only move to premium storage if you have confirmed that your workload is throttled by the standard targets and that other optimisations (like partitioning or transfer tools) are insufficient.

## Verify with monitoring and testing

Before making any changes, use monitoring tools to characterise your current traffic patterns. Check the request rate, ingress, and egress metrics for your storage account. If you are not hitting the account-level targets, look at the distribution of requests across partitions. If you are seeing hot partitions, adjust your partitioning strategy.

If you are hitting the targets, test the impact of your proposed changes. For example, if you plan to split your workload across multiple accounts, test the new configuration to ensure it meets your latency and throughput requirements. The performance checklist emphasises that you should test your service to determine whether its performance meets your requirements [Scalability and performance targets for standard storage accounts](https://learn.microsoft.com/en-us/azure/storage/common/scalability-targets-standard-account).
