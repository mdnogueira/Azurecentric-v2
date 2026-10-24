---
title: "Measure storage performance without confusing capacity and throughput"
description: "Distinguish IOPS, throughput and latency for Azure Files and Blob Storage to avoid throttling and performance misdiagnosis."
pubDate: 2026-01-19
category: storage
tags: ["azure-files", "blob-storage", "performance", "iops", "throughput", "latency"]
translationKey: measure-storage-performance-without-confusing-capacity-and-throughput
draft: true
---

You are seeing high latency in your storage operations, but the service metrics show low server-side delay. Or perhaps your throughput is flatlining despite having a high-end VM. The most common reason for this confusion is mixing up capacity, IOPS and throughput. These three metrics are often treated as interchangeable in casual conversation, but in Azure Storage, they are distinct constraints that require different optimisation strategies.

The first step is to identify which storage service you are using, as the performance models differ significantly between Azure Files and Azure Blob Storage. Azure Files is a file share service optimised for IOPS and latency, while Blob Storage is an object store optimised for throughput and parallel transfers. If you treat a Blob Storage account like a file share, or vice versa, you will likely hit throttling limits long before you run out of space.

[![Storage Performance Diagnosis Flow](/images/posts/2026/azc-268-checkpoints.svg)](/images/posts/2026/azc-268-checkpoints.svg)

## Understand the Azure Files performance model

Azure Files performance is defined by IOPS (input/output operations per second), throughput (measured in MiB/s), and latency (measured in milliseconds). The relationship between these is straightforward: throughput is the product of IOPS and the size of each I/O operation. For example, 10,000 IOPS with a 1 MiB I/O size results in 10 GiB/s of throughput, whereas the same IOPS with a 4 KiB I/O size yields only 38 MiB/s [Understand Azure Files performance](https://learn.microsoft.com/en-us/azure/storage/files/understand-performance).

When diagnosing Azure Files, you must distinguish between end-to-end latency and service latency. End-to-end latency includes the time for the request to travel from the client to Azure and back. Service latency is the time the Azure Files service itself takes to process the request. If your end-to-end latency is high but service latency is low, the bottleneck is likely your network connection or client-side processing, not the storage service [Understand Azure Files performance](https://learn.microsoft.com/en-us/azure/storage/files/understand-performance).

Azure Files offers two media tiers: SSD and HDD. SSD file shares provide single-digit millisecond latency for both reads and writes, making them suitable for latency-sensitive workloads. HDD file shares provide single-digit millisecond write latency but do not guarantee single-digit millisecond read latency [Understand Azure Files performance](https://learn.microsoft.com/en-us/azure/storage/files/understand-performance). The choice of media tier is made at the storage account level and cannot be changed without migrating to a new file share [Understand Azure Files performance](https://learn.microsoft.com/en-us/azure/storage/files/understand-performance).

Queue depth is another critical factor for Azure Files. It represents the number of outstanding I/O requests that the storage resource can service. High queue depth is achieved through parallelism, which can be increased by using multiple clients, files, and threads. The formula for queue depth is: clients × files × threads. A workload with a queue depth of 64 is generally considered optimal for achieving upper performance limits [Understand Azure Files performance](https://learn.microsoft.com/en-us/azure/storage/files/understand-performance). Single-threaded applications will struggle to reach the performance targets of Azure Files, regardless of the media tier.

## Understand the Azure Blob Storage performance model

Azure Blob Storage performance is governed by scale and performance targets, which are often referred to as limits but can be increased upon request. When clients approach or exceed these targets, Azure Storage may throttle requests, increasing latency [Performance checklist for developers (Azure Blob Storage)](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist-developers). The primary optimisation strategies for Blob Storage focus on parallel transfers, block sizes, and retry policies.

To maximise throughput in Blob Storage, you should use parallel block transfers with smaller block sizes, but maintain sizes above 4 MiB for standard accounts or 256 KiB for premium accounts to activate high-throughput block blobs [Performance checklist for developers (Azure Blob Storage)](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist-developers). Larger block sizes automatically activate high-throughput block blobs, which provide high-performance ingest that is not affected by partition naming [Performance checklist for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist).

Parallelism must be balanced to avoid exceeding device capabilities or storage targets, which causes throttling. Setting appropriate limits on concurrent requests is essential. For example, if you are uploading many small files, you should aggregate data before uploading instead of uploading each entry individually. Saving log entries locally and uploading them periodically as a single blob is a more efficient approach [Performance checklist for developers (Azure Blob Storage)](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist-developers).

If you are copying data between containers or accounts, use server-to-server APIs such as Put Block From URL. This reduces bandwidth usage because you do not need to download and then upload data [Performance checklist for developers (Azure Blob Storage)](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist-developers). For bulk transfers, use AzCopy, which is optimised for high transfer rates and parallel uploads [Performance checklist for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist).

## Diagnose your specific bottleneck

To determine whether your issue is related to IOPS, throughput, or latency, follow this decision path:

1. **Check the service type:** Are you using Azure Files or Blob Storage?
2. **Check the metrics:**
   - For Azure Files, monitor `SuccessE2ELatency` and `SuccessServerLatency`. If `SuccessE2ELatency` is high but `SuccessServerLatency` is low, investigate your network connection [Understand Azure Files performance](https://learn.microsoft.com/en-us/azure/storage/files/understand-performance).
   - For Blob Storage, monitor request rates and throughput against the Azure Storage scale and performance targets [Performance checklist for developers (Azure Blob Storage)](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist-developers).
3. **Check the workload pattern:**
   - If you are running a latency-sensitive workload with many small files, Azure Files SSD tier is likely the better choice [Understand Azure Files performance](https://learn.microsoft.com/en-us/azure/storage/files/understand-performance).
   - If you are running a throughput-intensive workload with large files, Blob Storage with parallel transfers and large block sizes is likely the better choice [Performance checklist for developers (Azure Blob Storage)](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist-developers).
4. **Check the parallelism:**
   - For Azure Files, ensure your workload is multi-threaded with multiple files to achieve high queue depth [Understand Azure Files performance](https://learn.microsoft.com/en-us/azure/storage/files/understand-performance).
   - For Blob Storage, ensure you are using parallel transfers and appropriate block sizes [Performance checklist for developers (Azure Blob Storage)](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist-developers).

## Verify your configuration

Once you have identified the bottleneck, verify your configuration against the recommended practices. For Azure Files, ensure you are using the correct media tier and that your workload is multi-threaded. For Blob Storage, ensure you are using the Azure Storage client libraries, which are optimised for performance and handle proven performance practices internally [Performance checklist for developers (Azure Blob Storage)](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist-developers).

Use the [Performance checklist for developers](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-performance-checklist-developers) for Blob Storage and the [Understand Azure Files performance](https://learn.microsoft.com/en-us/azure/storage/files/understand-performance) article for Azure Files to guide your optimisation efforts. Remember that performance is not just about the storage service; it is also about the client application and the network connection. A well-configured storage account will not perform well if the client is single-threaded or the network is congested.

By focusing on the specific metrics that matter for your service type, you can avoid the common pitfall of confusing capacity with performance. This approach allows you to make informed decisions about storage tier selection, workload parallelisation, and network optimisation, ensuring that your applications meet their performance targets without unnecessary throttling.
