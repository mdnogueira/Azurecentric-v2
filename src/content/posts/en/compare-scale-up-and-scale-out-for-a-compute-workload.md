---
title: "Compare scale-up and scale-out for a compute workload"
description: "Compare scale-up and scale-out for Azure Batch workloads using autoscale formulas and node sizing."
pubDate: 2025-04-09
category: compute
tags: ["azure-batch", "autoscaling", "vm-sizes", "compute-optimization", "cloud-architecture"]
translationKey: compare-scale-up-and-scale-out-for-a-compute-workload
draft: false
---

You need to decide whether a Batch workload scales best by adding more nodes or by using larger nodes. Azure Batch does not support changing the size of a node after it has been allocated to a pool. You cannot scale up an existing node. Therefore, "scale-up" in this context refers to provisioning larger VM sizes for new nodes, while "scale-out" refers to increasing the count of nodes. The optimal strategy often combines both, but understanding their distinct trade-offs is essential for cost and performance.

## Scale-out: Increasing Node Count

Scale-out is the default and most common scaling strategy for Azure Batch. It involves adding more compute nodes to the pool to handle increased task volume. This approach is ideal for stateless, parallelisable workloads where tasks can be distributed across many nodes.

### Autoscale Formulas for Scale-Out

Azure Batch uses autoscale formulas to dynamically adjust the number of nodes. These formulas evaluate metrics such as `$PendingTasks`, `$ActiveTasks`, and `$RunningTasks` to determine the target node count. The service evaluates the formula at regular intervals and adjusts the pool accordingly.

For example, a formula might look like this:

```text
startingNumberOfVMs = 1;
maxNumberofVMs = 25;
pendingTaskSamplePercent = $PendingTasks.GetSamplePercent(180 * TimeInterval_Second);
pendingTaskSamples = pendingTaskSamplePercent < 70 ? startingNumberOfVMs : avg($PendingTasks.GetSample(180 * TimeInterval_Second));
$TargetDedicatedNodes=min(maxNumberofVMs, pendingTaskSamples);
$NodeDeallocationOption = taskcompletion;
```

This formula scales the pool based on the average number of pending tasks over the last 180 seconds. It ensures the pool never exceeds 25 nodes. The `$NodeDeallocationOption = taskcompletion` setting ensures that nodes are only removed when running tasks finish, preventing task interruption.

### Benefits and Limitations

*   **Benefits:** Scale-out provides linear scalability. You can add more nodes to handle more tasks. It is generally more cost-effective for bursty workloads because you only pay for the nodes you need.
*   **Limitations:** Network latency between nodes can impact performance if tasks need to communicate frequently. Also, each node has overhead (OS, Batch agent), so very small tasks might not benefit from many small nodes.

## Scale-Up: Choosing Larger VM Sizes

Scale-up involves selecting VM sizes with more vCPUs, memory, and storage per node. This is useful for memory-intensive or CPU-bound tasks that cannot be easily parallelised across multiple nodes. Since you cannot change the size of an existing node, you must create a new pool with the desired VM size.

### Selecting VM Sizes

Azure Batch supports almost all VM sizes available in Azure, including HPC and GPU-enabled series. You can list supported VM sizes in a region using the Azure CLI:

```azurecli-interactive
az batch location list-skus --location <azure-region>
```

When choosing a size, consider:

*   **Application Requirements:** Multithreaded applications benefit from more vCPUs. Memory-intensive applications need larger RAM.
*   **Tasks per Node:** By default, one task runs per node. However, you can configure multiple tasks to run in parallel on a single node if the node has sufficient resources. This is effectively a form of scale-up within a node.
*   **Quotas:** Larger VM sizes consume more cores from your Batch account quota. Ensure your quota allows for the desired node count and size.

### Benefits and Limitations

*   **Benefits:** Larger nodes reduce network overhead for inter-task communication. They are better for tasks that require significant resources per instance.
*   **Limitations:** Fewer nodes can be provisioned within the same core quota. If the workload is not parallelisable, adding more nodes does not help. Also, if a node fails, you lose more work per node.

## Combining Scale-Up and Scale-Out

In many cases, the best approach is a combination. You might choose a medium-sized VM (scale-up) and then scale out the number of nodes based on task volume. This balances resource utilisation and parallelism.

### Decision Criteria

1.  **Task Parallelism:** If tasks are independent and parallelisable, scale-out is preferred. If tasks are monolithic and resource-intensive, scale-up is better.
2.  **Resource Requirements:** Use the [Batch Management API](batch-apis-tools.md) to check available VM sizes and their specs. Choose a size that matches the peak resource needs of a single task.
3.  **Cost Efficiency:** Compare the cost per task for different VM sizes and node counts. Larger nodes might be more cost-effective if they reduce overhead, but smaller nodes might be cheaper if tasks are small.
4.  **Quota Constraints:** Check your Batch account core quotas. If quotas are tight, you might need to choose larger nodes to fit more work within the limit.

### Example Scenario

Suppose you have a video encoding workload where each video file is processed independently. You might choose a `Standard_D4s_v3` VM (4 vCPUs, 16 GB RAM) and scale out to 10 nodes. If encoding is CPU-bound, you might increase to `Standard_D8s_v3` (8 vCPUs, 32 GB RAM) and scale out to 5 nodes, keeping the total cores similar but reducing node count and network overhead.

## Verification and Next Steps

After configuring your pool, monitor the autoscale formula execution and node utilisation. Use the Azure portal or Batch APIs to check if the target node count is being met. Adjust the formula parameters or VM size if performance or cost targets are not met.

Remember, you cannot change the VM size of an existing node. If you need to change the size, you must create a new pool with the desired configuration and submit tasks to it. This is a key operational constraint to keep in mind when designing your scaling strategy.

For more details on autoscale formulas, see the [Azure Batch autoscaling documentation](https://learn.microsoft.com/en-us/azure/batch/batch-automatic-scaling). For VM size selection, refer to the [Choose VM sizes and images for pools](https://learn.microsoft.com/en-us/azure/batch/batch-pool-vm-sizes) guide.
