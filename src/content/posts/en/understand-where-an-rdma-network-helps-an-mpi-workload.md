---
title: "Understand where an RDMA network helps an MPI workload"
description: "Determine when Azure Batch MPI workloads benefit from RDMA-capable VM sizes versus standard networking."
pubDate: 2024-08-21
category: compute
tags: ["azure-batch", "mpi", "rdma", "hpc", "virtual-machines"]
translationKey: understand-where-an-rdma-network-helps-an-mpi-workload
draft: false
---

You are configuring an Azure Batch pool for a tightly coupled Message Passing Interface (MPI) workload. The documentation lists specific virtual machine sizes as "RDMA capable". The immediate question is whether selecting one of these sizes is necessary for your job to run, or if it is strictly a performance optimisation for specific scenarios.

The short answer is that RDMA is not a requirement for MPI to function on Azure Batch. You can run MPI workloads on standard VM sizes. However, RDMA becomes a critical component when your workload involves large data transfers between nodes with low latency requirements. If your application is communication-bound, skipping RDMA-capable sizes may result in significantly slower execution times compared to CPU-bound or loosely coupled tasks.

[![MPI Workload Execution Flow with RDMA Consideration](/images/posts/2024/azc-084-checkpoints.svg)](/images/posts/2024/azc-084-checkpoints.svg)

## Understanding the role of RDMA in MPI

MPI is designed for tightly coupled workloads where applications need to communicate with each other frequently. In Azure Batch, this is handled via multi-instance tasks. By default, compute nodes in a pool communicate over the standard virtual network fabric. This involves the hypervisor and the host network stack, which introduces latency and consumes CPU cycles for data movement.

Remote Direct Memory Access (RDMA) allows one computer to access the memory of another without involving the operating system or CPU of the recipient. This bypasses the standard network stack, reducing latency and CPU overhead. Azure provides specific VM sizes, often referred to as HPC sizes, that include enhanced networking capabilities supporting RDMA over Converged Ethernet (RoCE). The Azure documentation on HPC VM sizes explicitly identifies which sizes support this feature.

When you use an RDMA-capable size, your MPI application can leverage this high-performance network. This is particularly beneficial for simulations involving fluid dynamics or finite element analysis, where nodes exchange large amounts of state data frequently. For these workloads, the reduction in latency and the increase in bandwidth can be the difference between a feasible simulation time and an impractical one.

## Configuring the Batch pool for inter-node communication

Regardless of whether you use RDMA, running MPI on Azure Batch requires specific pool configurations. Multi-instance tasks allow a single logical task to span multiple compute nodes. The Batch service creates a primary task on a master node and subtasks on the remaining nodes.

To support this, you must enable inter-node communication on the pool. This is done by setting the `InterComputeNodeCommunicationEnabled` property to true. Additionally, you must disable concurrent task execution by setting `TaskSlotsPerNode` to 1. This ensures that each node is dedicated to a single subtask, preventing resource contention that could destabilise the MPI communication.

```csharp
CloudPool myCloudPool =
    myBatchClient.PoolOperations.CreatePool(
        poolId: "MultiInstanceSamplePool",
        targetDedicatedComputeNodes: 3,
        virtualMachineSize: "Standard_HB120rs_v3", // RDMA-capable size
        VirtualMachineConfiguration: new VirtualMachineConfiguration(
            imageReference: new ImageReference(
                publisher: "MicrosoftWindowsServer",
                offer: "WindowsServer",
                sku: "2019-datacenter-core",
                version: "latest"),
            nodeAgentSkuId: "batch.node.windows amd64"));

// Multi-instance tasks require inter-node communication.
myCloudPool.InterComputeNodeCommunicationEnabled = true;
myCloudPool.TaskSlotsPerNode = 1;
```

If you attempt to run a multi-instance task in a pool with inter-node communication disabled, or with `TaskSlotsPerNode` greater than 1, the task will remain indefinitely in the "active" state and never execute. This is a common configuration error that can be difficult to diagnose if you are not aware of the requirement.

## Choosing the right VM size

Not all VM sizes support RDMA. The Azure documentation on VM sizes lists the specific families that offer this capability. When selecting a size, consider the following:

1. **Workload Type**: If your MPI application is CPU-bound and performs minimal inter-node communication, a standard general-purpose or compute-optimised VM may be sufficient and more cost-effective. RDMA adds value primarily when network throughput and latency are bottlenecks.
2. **Data Volume**: Large data transfers between nodes benefit most from RDMA. If your application exchanges small messages frequently, the overhead of setting up RDMA connections might outweigh the benefits, although RoCE is generally efficient for both.
3. **Cost**: RDMA-capable VMs are typically more expensive than standard sizes. Evaluate whether the performance gain justifies the higher compute cost for your specific job duration and scale.

For Linux nodes, you must use Intel MPI to take advantage of RDMA. Windows nodes typically use Microsoft MPI (MS-MPI), which also supports RDMA on compatible hardware. Ensure your MPI implementation matches the OS and hardware capabilities.

## Network considerations

When provisioning a Batch pool, you may choose to place it in a Virtual Network to allow communication with other resources, such as file servers or license servers. This is done by specifying a subnet ID when creating the pool. However, note that compute nodes in a pool can communicate with each other for multi-instance tasks even without a Virtual Network. The Virtual Network is primarily for external communication.

If you do use a Virtual Network, be aware of IP address conflicts. Azure Batch pools should avoid the `172.17.0.0/16` subnet, as this is the default for Docker bridge networks and can cause conflicts with services running on the compute nodes. Additionally, if you use user-defined routes for forced tunneling, you must ensure that traffic to the Batch service and Azure Storage is not blocked, as this will prevent the nodes from functioning correctly.

## Verification and next steps

To verify if RDMA is beneficial for your workload, consider running a baseline test on a standard VM size and comparing it with an RDMA-capable size. Monitor the network throughput and latency during the MPI execution. Tools like `mpiexec` can provide insights into communication patterns.

If you decide to proceed with an RDMA-capable size, ensure that your MPI application is configured to use the appropriate network interface. For MS-MPI, this is often automatic, but for Intel MPI, you may need to specify the network interface explicitly.

The decision to use RDMA should be driven by your application's communication profile. If your simulation involves heavy data exchange between nodes, RDMA is likely a worthwhile investment. If the workload is primarily computational, a standard VM size may offer a better balance of performance and cost.

Start by reviewing the [Azure Batch MPI documentation](https://learn.microsoft.com/en-us/azure/batch/batch-mpi) to understand the multi-instance task structure, and then consult the HPC VM sizes page to identify the specific RDMA-capable options available in your region.
