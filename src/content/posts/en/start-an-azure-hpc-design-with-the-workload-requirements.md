---
title: "Start an Azure HPC design with the workload requirements"
description: "Identify the compute, memory, communication and data requirements of an HPC job before choosing Azure VM families or a scheduling platform."
pubDate: 2024-01-17
category: compute
tags: [hpc, azure-batch, compute, workload-design]
translationKey: start-an-azure-hpc-design-with-the-workload-requirements
draft: false
---

An HPC design needs more information than the number of processor cores requested. Two jobs using the same number of cores can behave very differently if one spends its time calculating independently and the other spends it exchanging data between nodes.

Start with the application and its working data. The useful first deliverable is a workload profile that explains what the job needs, how it runs and how you will judge the result. The VM family comes after that profile, rather than becoming the requirement itself.

Microsoft's documentation describes [HPC VM families](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes-hpc), [GPU VM families](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes-gpu) and [Azure Batch](https://learn.microsoft.com/en-us/azure/batch/batch-technical-overview). These address different parts of the design; none removes the need to understand the application.

## Establish how the work is divided

For an illustrative example, consider a team running a collection of engineering simulations. If each simulation can run independently with its own input files, the scheduling problem is different from one simulation that distributes a tightly coupled calculation across many machines.

Independent tasks can often be scheduled as separate pieces of work. For a tightly coupled application using MPI, communication latency and the supported network fabric become central design questions. More nodes will not necessarily produce a proportionate improvement if the application spends more time coordinating them.

Ask the application owner which execution modes are supported, which scheduler the team already uses and whether there is evidence of useful scaling. Keep observations from a real run separate from expectations about a different VM family.

## Describe the resource demand

Build a short profile that can be checked against the available infrastructure:

| Requirement | What to establish |
|---|---|
| CPU | Supported architecture, useful core count and relevant instruction requirements |
| Memory | Working set per task or process, plus memory-bandwidth sensitivity |
| Accelerator | Whether the application actually supports a particular GPU and its software stack |
| Communication | Independent tasks or tightly coupled processes, with the required MPI and network support |
| Storage | Input size, working files, checkpoint traffic and durable output |
| Runtime | Typical duration, restart behaviour and any completion deadline |

Avoid turning one successful machine configuration into a universal rule. A memory-bound solver and a GPU-enabled training application may both be described as compute workloads, but they do not justify the same infrastructure.

Check application licensing too. A deployment that can allocate more cores is not necessarily licensed to use them, and a licence server can become a dependency of the entire run.

## Follow the data through the job

Record where the input begins, where the job reads it, where temporary files are written and where results must remain afterwards. Include data preparation and result transfer in the elapsed time you care about.

A fast calculation does not make the overall process fast if staging the inputs dominates the working day. Equally, a shared filesystem serving many nodes needs to be evaluated under the expected access pattern. Capacity alone does not describe the required throughput, latency or metadata behaviour.

Decide what happens after a failed node or interrupted job. If the application supports checkpoints, identify where they are stored and how the job resumes from them. Temporary working storage and durable recovery data need deliberately different treatment.

## Choose the operating approach

Azure Batch provides managed pools, jobs and tasks, including support for multi-instance tasks for suitable parallel applications. It is worth evaluating when that operating model fits the workload. An existing HPC scheduler and its operational tooling may lead to a different approach.

For MPI applications, check the documented requirements of the selected VM family, network configuration, operating system and MPI implementation together. RDMA support is a compatibility requirement to verify, rather than a label that makes every distributed application faster.

Confirm regional availability and quota before committing to a design. Quota gives a limit within which you can request resources; it does not reserve physical capacity for a particular start time.

Use a representative pilot to test the profile. Record the image, application and library versions, node count, dataset, configuration, elapsed time and cost assumptions. That gives the team something reproducible to compare when it changes the compute, storage or network design.
