---
title: "Configure an Azure Batch pool for a repeatable compute job"
description: "Configure a repeatable Azure Batch pool using start tasks, scaling, and job constraints for consistent compute."
pubDate: 2024-12-14
category: compute
tags: ["azure-batch", "compute-automation", "start-tasks", "scaling", "jobs-and-tasks"]
translationKey: configure-an-azure-batch-pool-for-a-repeatable-compute-job
draft: false
---

You have a compute job that needs to run repeatedly. The first decision is how to handle the infrastructure. Creating a new pool for every job ensures isolation and a clean state, but it introduces allocation latency. Keeping a pool alive allows tasks to start immediately, but you must manage the lifecycle of the nodes and the applications running on them. For a repeatable job where the environment must be consistent and the workload is predictable, a dedicated pool with a start task and automatic scaling is usually the most reliable approach.

The key to repeatability is ensuring that every node in the pool is in the same state before it accepts work. Azure Batch handles this through the start task. This task runs on every node when it joins the pool and whenever it is restarted or reimaged. It is the mechanism that installs your application, configures the environment, and prepares the node for the actual workload. Without a start task, you would need to manage application deployment manually or rely on application packages, which are also installed via the start task process.

[![Azure Batch Pool Lifecycle and Start Task Flow](/images/posts/2024/azc-125-checkpoints.svg)](/images/posts/2024/azc-125-checkpoints.svg)

## Define the pool configuration

A pool is a collection of compute nodes. When you create a pool, you specify the operating system, the node size, and the number of nodes. The node size determines the CPU, memory, and local storage available to each task. You can choose from almost all Azure VM families, but you must select the size at creation time; it cannot be changed later [Nodes and pools in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/nodes-and-pools).

For a repeatable job, you should consider using Spot VMs if the workload is flexible and can tolerate preemption. Spot nodes take advantage of surplus capacity and are less expensive per hour than dedicated nodes, but they may be reclaimed by Azure if capacity is needed elsewhere [Nodes and pools in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/nodes-and-pools). If the job is critical and cannot be interrupted, use dedicated nodes. You can mix both types in the same pool, assigning targets for each, but you must ensure that any work lost due to preemption is minimal and easy to recreate [Nodes and pools in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/nodes-and-pools).

The pool also requires a virtual machine configuration. This includes the image reference and the node agent SKU. The node agent is the program that runs on each node and communicates with the Batch service. You must select the correct SKU for the operating system of your base image. You can find the mapping of SKU IDs to image references using the Batch REST API [Nodes and pools in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/nodes-and-pools).

## Prepare nodes with a start task

The start task is the most important component for ensuring repeatability. It runs before any job tasks are assigned to the node. If the start task fails, the node is not considered ready, and no tasks will be scheduled on it. This prevents your job from running on a misconfigured node [Jobs and tasks in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/jobs-and-tasks).

A typical start task downloads the application and its dependencies from Azure Storage and installs them. For example, you might have a PowerShell script that downloads a zip file from a storage account and extracts it to a specific directory. The start task command line must be robust and idempotent, meaning it can be run multiple times without causing issues. Remember that the command line does not run under a shell by default, so you may need to invoke the shell explicitly, such as `cmd /c MyTaskApplication.exe` on Windows nodes [Jobs and tasks in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/jobs-and-tasks).

You can also use application packages to manage application versions. Application packages are uploaded to the Batch account and can be referenced by the start task or the job tasks. This simplifies versioning and deployment. If you use application packages, the start task can simply install the package, ensuring that every node has the correct version [Nodes and pools in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/nodes-and-pools).

## Scale the pool automatically

For a repeatable job, the workload may vary. Automatic scaling allows the pool to adjust the number of nodes based on the current demand. You define a scaling formula that Batch evaluates periodically. The formula can be based on task metrics, such as the number of queued tasks, or resource metrics, such as CPU usage [Nodes and pools in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/nodes-and-pools).

A common formula for a repeatable job is to scale based on the number of queued tasks. For example, you might want one node for every ten queued tasks. This ensures that you have enough compute capacity to process the workload efficiently without over-provisioning. When the queue is empty, the pool can scale down to zero nodes, saving costs [Nodes and pools in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/nodes-and-pools).

When the pool scales down, you need to decide how to handle running tasks. You can specify a node deallocation option that either stops tasks immediately or allows them to complete. Allowing tasks to complete is safer but may delay the scaling operation. Stopping tasks immediately is faster but may result in lost work if the tasks are not idempotent [Nodes and pools in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/nodes-and-pools).

## Manage job lifecycle

Once the pool is configured, you submit jobs and tasks. A job is a collection of tasks that run on the pool. For a repeatable job, you might create a new job for each run. This allows you to track the progress and results of each execution separately.

You can set job constraints, such as the maximum wallclock time and the maximum number of task retries. These constraints help you manage failures and prevent jobs from running indefinitely. You can also set the job priority, which determines the order in which tasks are scheduled within the pool. Higher priority jobs are scheduled first, but tasks in lower priority jobs are not preempted [Jobs and tasks in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/jobs-and-tasks).

By default, jobs remain in an active state even after all tasks are complete. You can configure the job to terminate automatically when all tasks are complete. This is useful for repeatable jobs where you want to clean up the job record after each run. However, if you use a job manager task, you should set the termination behavior after adding all tasks to the job, as the job manager task is considered a task itself [Jobs and tasks in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/jobs-and-tasks).

## Example configuration

The following is an illustrative example of how you might configure a pool with a start task and automatic scaling. This example uses the Azure Batch .NET SDK, but the concepts apply to other clients. Note that SDK property names and usage may vary by version, so consult the specific SDK documentation for the correct property assignment.

```csharp
// Prerequisites: Azure Batch account credentials and client setup
// This code is illustrative and has not been tested.

// Define the pool
var pool = new CloudPool(id: "my-repeatable-pool")
{
    VirtualMachineSize = "Standard_D2s_v3",
    TargetDedicatedComputeNodes = 0, // Start with zero nodes
    ScaleFormula = "max(0, ceil($QueueLength / 10))", // Scale based on queue
    StartTask = new StartTask
    {
        CommandLine = "cmd /c starttask.cmd",
        ResourceFiles = new List<ResourceFile> { new ResourceFile("https://mystorage.blob.core.windows.net/scripts/starttask.cmd", "starttask.cmd") },
        WaitForSuccess = true
    }
};

// Add the pool to the Batch account
batchClient.PoolOperations.CreatePool(pool);
```

This example creates a pool that starts with zero nodes. The start task downloads a script from storage and runs it. The scaling formula ensures that nodes are added when there are more than ten queued tasks. The `WaitForSuccess` flag ensures that the node is not used until the start task completes successfully.

## Verification

After creating the pool, you can verify the configuration by checking the node state. When you submit a job, the Batch service will allocate nodes if the scaling formula requires it. You can monitor the node state in the Azure portal or using the Batch client. Nodes will transition from `starting` to `idle` as they are allocated and the start task executes. If the start task fails, the node will remain in an `unusable` or error state, and you can investigate the logs to determine the cause [Jobs and tasks in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/jobs-and-tasks).

Once the job is complete, you can delete the pool if you no longer need it. If you plan to reuse the pool for future jobs, ensure that the start task is still valid and that the node agent is up to date. Regularly reviewing the pool configuration and scaling policies will help you maintain an efficient and reliable Batch environment.

References for Configure an Azure Batch pool for a repeatable compute job: [Nodes and pools in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/nodes-and-pools), [Jobs and tasks in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/jobs-and-tasks).
