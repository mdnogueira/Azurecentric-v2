---
title: "Plan checkpoint and restart behaviour for long-running jobs"
description: "Plan long-running Azure Batch jobs using constraints, job manager tasks, and restart policies to handle failures and timeouts."
pubDate: 2026-06-16
category: compute
tags: ["azure-batch", "job-manager-task", "task-retries", "job-constraints", "batch-scheduling"]
translationKey: plan-checkpoint-and-restart-behaviour-for-long-running-jobs
draft: false
---

Long-running batch workloads rarely proceed without interruption. Nodes fail, connectivity drops, and applications hang. If you submit a job without explicit constraints, Azure Batch will keep trying until you intervene or the job reaches its maximum lifetime. The first step in planning for reliability is defining how the service should behave when things go wrong.

## Define the boundaries before you start

Azure Batch imposes a hard limit on task lifetime: a task cannot run for more than 180 days from the moment it is added to the job. Completed tasks persist for only 7 days. If your workload approaches these limits, you must structure the work into smaller chunks or implement external state tracking. For most operational jobs, the immediate risk is not the 180-day cap, but uncontrolled retries or indefinite hangs.

You can constrain a job at two levels: the job itself and individual tasks. Job-level constraints apply to all tasks in the collection. Task-level constraints allow you to tune behaviour for specific units of work.

### Job-level wallclock time

Set a maximum wallclock time for the job. If the job runs longer than this limit, Batch terminates the job and all its tasks. This prevents a single misconfigured job from consuming pool resources indefinitely. The documentation notes that if a job is terminated, Batch only terminates running tasks on accessible compute nodes. Tasks on unusable nodes may remain in their current state. You must account for this when designing cleanup logic.

### Job-level retry limits

Specify the maximum number of task retries at the job level. This includes whether a task is always retried or never retried. Retrying a task means it is requeued to run again if it fails. Without this constraint, a task that fails due to a transient issue might be retried indefinitely, or worse, a task that fails due to a permanent error might spin forever if the service does not detect the failure state correctly. Note that a task stuck in a running state due to node preemption or lost connectivity will remain running until Batch can reschedule it or the node is removed. If no other node is available, the task may stay running indefinitely. You need a strategy to detect and handle these stuck tasks, such as querying the task state and checking the associated node's status.

## Use a job manager task for control

For long-running or complex jobs, a job manager task is often the most reliable way to control execution. A job manager task is started before all other tasks in the job and is handled specifically by Batch. It is queued as soon as the job is created and is restarted if it fails. This makes it ideal for creating and submitting subsequent tasks, monitoring progress, and determining when the job is complete.

A job manager task is required for jobs created by a job schedule. It is also recommended for any job where you need to dynamically determine the workload. The job manager task is given the highest priority when it needs to be restarted. If an idle node is not available, Batch may terminate another running task in the pool to make room for the job manager task. This ensures that the control plane of your job remains responsive.

You can tie the termination of the job manager task to the termination of all tasks in the job. This allows you to use the `onAllTasksComplete` property to automatically terminate the job when all tasks are in the completed state. If you do not use a job manager task, you should initially set `onAllTasksComplete` to `noaction`, then set it to `terminatejob` only after you have finished adding tasks to the job. This prevents premature termination if tasks are added asynchronously.

## Plan for restarts and dependencies

When a task fails, Batch can retry it based on the constraints you set. However, if the failure is due to a transient issue, such as a network glitch or a temporary resource constraint, a retry might succeed. If the failure is permanent, you need to ensure that the job does not waste resources on futile retries.

Task dependencies allow you to specify that a task depends on the completion of other tasks. This is useful for workflows where downstream tasks consume the output of upstream tasks. You must enable task dependencies on your Batch job before you can use this feature. With task dependencies, you can configure scenarios like task B depending on task A, or task C depending on both task A and task B. This ensures that tasks are executed in the correct order and that dependencies are met before execution begins.

If you are using a job schedule, the job manager task is the only way to define the tasks before the job is instantiated. The job schedule specifies when to run jobs and includes the specifications for the jobs to be run. You can specify the duration of the schedule and how frequently jobs are created. If a job is still running when the next recurrence interval is reached, Batch will not create a new job until the previous one finishes. This ensures that only one job at a time runs under a given schedule, which can help manage resource usage.

## Verify your configuration

Before submitting a long-running job, verify the following:

1. **Constraints**: Ensure that `maxWallClockTime` and `maxTaskRetryCount` are set at the job level to prevent uncontrolled execution.
2. **Job Manager Task**: Confirm that the job manager task is configured to handle task creation and monitoring. Check that it has the necessary permissions to interact with the Batch service.
3. **Dependencies**: If using task dependencies, ensure that the dependency graph is valid and that all upstream tasks are completed before downstream tasks start.
4. **Termination**: Set `onAllTasksComplete` to `terminatejob` if you want the job to terminate automatically when all tasks are complete. Otherwise, manually terminate the job after verification.
5. **Stuck Tasks**: Implement a monitoring mechanism to detect tasks stuck in the running state due to node issues. Query the task state and check the associated node's status to determine if rescheduling is possible.

By defining these boundaries and using a job manager task, you can ensure that your long-running batch jobs are resilient to failures and do not consume resources indefinitely. The key is to anticipate failure modes and configure Batch to handle them gracefully.

### Example: Job Manager Task Setup

The following illustrates how a job manager task might be configured to submit subsequent tasks. This is an illustrative example and assumes the use of the Azure Batch SDK or REST API.

```csharp
// Prerequisites: Azure Batch account, pool, and authenticated client
// This code is illustrative and has not been tested

var jobManagerTask = new CloudTask("jobManagerTaskId", "cmd /c echo Starting job manager")
{
    ResourceFiles = new List<ResourceFile> { new ResourceFile("https://storageaccount.blob.core.windows.net/scripts/jobmanager.ps1", "jobmanager.ps1") },
    RunExe = true,
    RunCommandLine = "powershell.exe -File jobmanager.ps1"
};

jobManagerTask.JobManagerTask = new JobManagerTask
{
    OnAllTasksComplete = OnAllTasksComplete.TerminateJob
};

await batchClient.JobManagerTask.AddTaskAsync(jobId, jobManagerTask);
```

This example shows a job manager task that runs a PowerShell script. The script would typically contain logic to submit additional tasks based on the job's requirements. The `OnAllTasksComplete` property is set to `TerminateJob`, ensuring that the job terminates when all tasks are complete.

### Cleanup

After the job completes, you should clean up the job and its associated tasks. If the job was terminated due to a wallclock time limit, you may need to manually delete the job and its tasks to free up resources. If the job completed successfully, you can delete the job to remove it from the Batch account. Remember that completed tasks persist for only 7 days, so you should retrieve any necessary output data before this period expires.

By planning for restarts, defining constraints, and using a job manager task, you can ensure that your long-running batch jobs are reliable and efficient. The key is to anticipate failure modes and configure Batch to handle them gracefully.

References for Plan checkpoint and restart behaviour for long-running jobs: [Jobs and tasks in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/jobs-and-tasks), [Schedule Batch jobs for efficiency](https://learn.microsoft.com/en-us/azure/batch/batch-job-schedule).
