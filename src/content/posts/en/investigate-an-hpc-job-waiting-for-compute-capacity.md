---
title: "Investigate an HPC job waiting for compute capacity"
description: "Troubleshoot Azure Batch jobs waiting for compute by checking quotas, VM availability, and autoscale formula logic."
pubDate: 2025-02-05
category: hpc-ai
tags: ["hpc", "troubleshooting", "capacity-planning", "autoscaling", "azure-batch", "quotas"]
translationKey: investigate-an-hpc-job-waiting-for-compute-capacity
draft: false
---

Your Azure Batch job is in the `Active` state, but the tasks are not running. The pool shows nodes in a `Starting` or `Idle` state, or perhaps the node count is simply lower than the number of tasks waiting. Before rewriting your workload, you need to determine which constraint is holding the job back. In Azure Batch, a job waiting for compute is usually a symptom of one of three things: a hard quota limit, a regional VM availability gap, or an autoscale formula that isn't triggering the growth you expect.

## Check the Batch account core quota first

The most common reason a pool fails to reach its target node count is a quota limit on the Batch account itself. When you create a Batch account, you can specify the pool allocation mode. If you used the default Batch service configuration, your account is limited to a maximum number of cores that can be used for processing. The Batch service scales compute nodes only up to that core limit. Even if your autoscale formula requests 50 nodes, the service will not provision them if the total cores exceed your account's quota.

You can view your current quota usage and limits via the Azure portal or the Batch Management API. If your target node count is not being reached, check the "Quotas and limits" section for your Batch account. You may need to request a quota increase. This is a critical prerequisite because no amount of autoscale tuning will bypass a hard quota ceiling.

> [!NOTE]
> If you created your account with user subscription mode, then your account shares in the core quota for the subscription. In this case, check the [Virtual Machines limits](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-virtual-machines-limits) for the subscription instead.

## Verify VM size availability in the region

Even with sufficient quota, your pool might be waiting for specific VM sizes that are not available in the region where your Batch account resides. Azure Batch supports almost all VM sizes available in Azure, but availability varies by region and time. If your pool is configured to use a specific size, such as an HPC-optimised `H-series` or a GPU-enabled `ND-series`, and that size is temporarily unavailable in the region, the nodes will not be provisioned.

You can check the list of VM sizes supported by Batch in a specific region using the Azure CLI:

```azurecli-interactive
az batch location list-skus --location <your-region>
```

This command returns the SKUs supported by Batch in that region. If your desired size is not in the list, or if it is listed but unavailable, you have two options: switch to a different VM size that is available, or move your Batch account to a region where the required size is available. It is also worth noting that Batch does not support VM SKU sizes that have only remote storage; a local temporary disk is required for Batch operations.

## Review your autoscale formula logic

If quotas are sufficient and VM sizes are available, the issue likely lies in your autoscale formula. An autoscale formula is a string value that contains one or more statements. Batch periodically reviews service metrics data and uses it to adjust the number of nodes in the pool based on your formula and at an interval that you define. If the formula is not evaluating the correct metrics, or if the logic is too conservative, the pool will not scale up to meet the demand.

Consider the `$PendingTasks` metric, which defines the number of tasks that are running or queued. A common formula might look like this:

```
startingNumberOfVMs = 1;
maxNumberofVMs = 25;
pendingTaskSamplePercent = $PendingTasks.GetSamplePercent(180 * TimeInterval_Second);
pendingTaskSamples = pendingTaskSamplePercent < 70 ? startingNumberOfVMs : avg($PendingTasks.GetSample(180 * TimeInterval_Second));
$TargetDedicatedNodes=min(maxNumberofVMs, pendingTaskSamples);
$NodeDeallocationOption = taskcompletion;
```

In this example, the pool scales based on the average number of pending tasks in the last 180 seconds. If your tasks are short-lived and complete quickly, the 180-second sample window might smooth out the spikes, causing the pool to scale too slowly. Conversely, if your tasks are long-running, the pool might scale up unnecessarily. You can adjust the time interval and the threshold (e.g., `70`) to better match your workload's behaviour.

Also, be aware that `$PendingTasks` includes tasks that are in the internal queue used by Batch service for scheduling. If a task is deleted before it can be scheduled, it might persist within the queue, causing it to still be counted in `$PendingTasks`. This can lead to the pool scaling up for tasks that no longer exist. Monitor the `$ActiveTasks` and `$RunningTasks` metrics to get a clearer picture of the actual workload.

## Inspect node deallocation and task states

Finally, check the node deallocation option and the state of your tasks. The `$NodeDeallocationOption` variable determines the action that occurs when compute nodes are removed from a pool. If you are using `requeue`, tasks are ended immediately and put back on the job queue. This can cause a cycle where nodes are removed, tasks are requeued, and the autoscale formula sees an increase in pending tasks, triggering another scale-up. If you are using `taskcompletion`, the pool waits for currently running tasks to finish before removing the node. This is generally more efficient but can delay scale-down.

If your tasks are stuck in a `Waiting` or `Active` state without progressing to `Running`, check the node agent logs on the compute nodes. Sometimes, the issue is not with the Batch service but with the node itself, such as a network connectivity problem or a misconfigured application environment. Ensure that the node agent is running and that the tasks can access the required resources.

By systematically checking the quota, VM availability, autoscale formula, and node states, you can identify the root cause of your job waiting for compute. Start with the quota, as it is the most common bottleneck, then move on to the more nuanced aspects of autoscaling and node configuration.

References for Investigate an HPC job waiting for compute capacity: [Autoscale compute nodes in an Azure Batch pool](https://learn.microsoft.com/en-us/azure/batch/batch-automatic-scaling), [Choose VM sizes and images for pools](https://learn.microsoft.com/en-us/azure/batch/batch-pool-vm-sizes).
