---
title: "Choose a VM size using workload requirements"
description: "Choose an Azure VM size by identifying the workload constraint, checking memory and I/O limits, reviewing regional quotas and validating a representative workload."
pubDate: 2024-03-04
category: compute
tags: ["azure-virtual-machines", "vm-sizing", "performance"]
translationKey: choose-a-vm-size-using-workload-requirements
draft: false
---

A VM size is a collection of resource limits, not just a vCPU count. Two candidates with similar CPU capacity can differ in memory, disk throughput and networking. A useful selection starts with the resource the application is waiting for and the service outcome it must achieve.

Write down that outcome before opening the size selector. It might be a batch job finishing inside a maintenance window or an application meeting its response-time target at peak demand. Without that condition, comparing sizes becomes a search for impressive specifications rather than a capacity decision.

## Build a small workload profile

For an existing system, capture representative behaviour across normal and busy periods. Record CPU demand, memory use, storage latency and throughput, and network traffic alongside the application's own measurements.

Include operating system and supporting services in the memory and CPU budget. Backup, monitoring and security software still need resources even when they are not the main application.

For a new application, use vendor requirements and a representative test as the starting point. Record what is estimated and what has actually been measured. The article does not provide benchmark results from a deployment.

Use a short selection record:

| Requirement | Evidence to collect |
|---|---|
| Processing | Concurrency, CPU demand and whether work can use more cores |
| Memory | Working set, expected growth and behaviour under pressure |
| Storage | Capacity, IOPS, throughput and acceptable latency |
| Network | Traffic volume, connection patterns and downstream constraints |
| Operations | Maintenance, restart and recovery requirements |
| Acceptance | The client or job result that establishes sufficient performance |

A quiet observation period does not prove that a workload has no peaks. Keep scheduled processing and less frequent operational work in the profile.

## Use the family to narrow the shortlist

Microsoft's [VM size overview](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes) groups sizes by resource characteristics. General-purpose families provide a balanced CPU-to-memory ratio. Compute-optimised families emphasise CPU capacity relative to memory, while memory-optimised families provide a higher memory-to-CPU ratio.

Those categories help narrow the search, but they are not application certifications. A database is not automatically a memory problem, and a storage-optimised family does not remove every I/O bottleneck.

For example, compare a general-purpose candidate with a memory-optimised candidate if the measured constraint is memory pressure. Keep the application's CPU needs and the exact size's storage and networking limits in that comparison.

The [memory-optimised size guidance](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes-memory) and individual series specifications provide those details. Record the complete size name and the limits relevant to the workload rather than only the family label.

## Check the whole storage path

Review both the VM's storage limits and the proposed disks. A disk's advertised capability does not establish what the VM can deliver across all its attached storage.

Separate durable application data from temporary storage and confirm the intended recovery arrangement. A local performance feature is useful only when its data-loss behaviour fits the application.

If the workload is waiting on a remote service, increasing the VM's core count may leave that dependency unchanged. Keep the test focused on the suspected constraint instead of changing several layers at once.

## Verify region and quota before the pilot

Check that the candidate is offered in the intended region and that the deployment meets its subscription constraints. Microsoft's [vCPU quota guidance](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas) describes both total regional vCPU quota and VM-family vCPU quota. A deployment must fit both.

This read-only Azure CLI example checks usage in an example region:

```bash
az vm list-usage --location "East US" --output table
```

The command has not been run against a subscription for this article. Confirm the selected subscription and substitute the intended region before using it.

Do not treat a quota value as a measurement of application performance. Similarly, a size appearing in a catalogue is not an allocation result. Retain an alternative that meets the workload requirements if the planned deployment cannot be allocated.

## Compare the cost of the useful result

Compare the proposed compute arrangement with its disks, operating system and application licensing, supporting services and expected runtime. The lowest VM hourly price is not automatically the lowest cost for a completed job or a supported application.

Use published prices for the actual region and purchasing arrangement when preparing the estimate. Record the assumptions instead of presenting a generic family as universally cheapest.

Run the representative workload on the shortlist and compare it with the acceptance condition. Change one relevant variable at a time, then record the result and the remaining capacity margin.

Choose the size when the evidence supports the workload and operational requirements. Keep that record for later reviews: growth, software changes and a different demand pattern can invalidate an otherwise reasonable sizing decision.

