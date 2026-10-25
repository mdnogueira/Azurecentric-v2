---
title: "Choose CPU or GPU infrastructure for an AI workload"
description: "Compare CPU and GPU candidates for an AI workload using software support, memory requirements, end-to-end performance and the cost of the required result."
pubDate: 2024-03-06
category: compute
tags: [azure-compute, gpu, ai-infrastructure, performance, capacity-planning]
translationKey: choose-cpu-or-gpu-infrastructure-for-an-ai-workload
draft: false
---

“AI workload” is not enough information to select a GPU VM. Identify the actual computation, the software that performs it and the result the service must deliver. Training a model, preparing its data and serving individual predictions can place very different demands on the infrastructure.

The decision is whether the application can use a candidate's hardware effectively and meet its requirements. An accelerator that is visible to the operating system is not evidence that the model is running on it or that the overall service is faster.

## Separate the stages before choosing the hardware

Map the workload from input to output. Include data access, preprocessing, the model operation and the point where a result becomes available to the caller.

For training, record the model, framework, data volume and acceptable completion time. For inference, include request concurrency, response-time requirements and whether batching is acceptable. Keep model quality and the required numerical behaviour part of the acceptance criteria.

This gives the comparison a clear job. A candidate that performs one operation quickly can still fail the service target if data preparation or a downstream dependency dominates the elapsed time.

## Confirm that the software can use the device

Microsoft's [GPU VM guidance](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes-gpu) distinguishes compute-oriented GPU offerings from graphics and visualisation offerings. A GPU in a VM does not make every N-series family interchangeable for AI.

Check the model runtime and framework against the intended GPU, operating system and driver requirements. Confirm the supported software versions before provisioning. Installing a driver is part of making the device usable; it does not automatically move application work to it.

A CPU candidate remains worth measuring when the software supports that execution path and it might meet the service target. A GPU candidate is worth measuring when a supported accelerated implementation addresses the identified processing requirement. Neither label establishes the result in advance.

Use a practical comparison:

| Question | CPU candidate | GPU candidate |
|---|---|---|
| Software path | Does the application provide a supported CPU implementation? | Does it support the specific device and required runtime? |
| Memory | Does host memory fit the model, process and data preparation? | Does device memory fit the intended model operation as well as host-side work? |
| Performance | Does the service or job meet the acceptance target? | Does acceleration improve the required end-to-end result? |
| Operation | Can the team build, update and recover the environment? | Can it also manage the driver and accelerated software dependencies? |

These are selection criteria, not reported results from a benchmark.

## Shortlist specific families rather than all GPUs

The documented NC T4 v3 offering focuses on inference, while NC A100 v4 addresses midrange AI training and batch inference. The ND A100 offerings address larger deep-learning and accelerated HPC configurations.

Use those documented workload descriptions to narrow the search, then inspect the individual size. Check GPU type and count, device memory, host memory, storage and networking. Do not infer that a fractional graphics offering has the same compute capability or software support as a dedicated compute GPU.

Also avoid treating all HPC work as GPU work. Microsoft's [HPC size guidance](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes-hpc) describes CPU-based HB and HX offerings with substantial memory and networking capabilities. The application's implementation and communication pattern determine whether those capabilities are relevant.

## Test the complete processing path

Build a repeatable pilot using representative inputs and the intended software stack. Record model and runtime versions, configuration, input shape and the output checks. Keep those conditions consistent across candidates.

Measure preparation, execution and result delivery. For an inference service, include startup and the request pattern the application must handle. For a batch job, include the steps needed to prepare the machine and make its output available.

If a candidate is poorly utilised, investigate before increasing its size. The application may be waiting for data, executing unsupported operations on the CPU or handling too little concurrent work to benefit from the accelerator.

This article contains no invented timing, utilisation or cost figures. The pilot should produce the evidence needed to accept or reject a candidate.

## Assess scaling, availability and cost together

Multi-node execution adds another question: how do workers exchange data? A supported distributed implementation, its communication requirements and the selected VM networking need to agree. Adding more independent VMs does not establish useful scaling.

[Azure Batch](https://learn.microsoft.com/en-us/azure/batch/batch-technical-overview) can schedule parallel jobs, including supported tightly coupled workloads. It does not turn an application into a distributed implementation or guarantee faster model execution.

Before a larger deployment, check regional offerings, subscription quotas and the intended allocation. Compare the total arrangement and runtime needed for the accepted result, including storage, idle periods and environment management.

Retain the CPU and GPU test configurations with their results. Select the infrastructure that meets the workload and operational requirements, and review it when the model, software or request pattern changes.

