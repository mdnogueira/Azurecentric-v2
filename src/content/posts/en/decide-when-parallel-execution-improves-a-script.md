---
title: "Decide when parallel execution improves a script"
description: "Decide when parallel execution improves a script using PowerShell 7.5 performance data."
pubDate: 2025-10-10
category: automation
tags: []
translationKey: decide-when-parallel-execution-improves-a-script
draft: false
---

Parallel execution is not a universal speed-up. It introduces overhead and complexity that can make a script slower, or harder to debug, if the workload does not match the execution model. The decision to parallelise depends on the type of work, the available CPU resources, and the constraints of the PowerShell version you are running.

The first thing to check is whether your script is I/O bound or CPU bound. If the script spends most of its time waiting for network responses, file system operations, or external processes, parallel execution often helps. If the script is purely CPU intensive, parallel execution can improve performance, but only if the processor has multiple cores and the work can be split into independent chunks.

## Choose the right parallel mechanism

PowerShell 7.5 provides three main mechanisms for parallel execution, each with different trade-offs. `Start-Job` creates a new PowerShell process for each task. This is the most isolated but also the most resource-intensive option. The overhead of creating a new process and serialising data between processes can outweigh the benefits, especially for small tasks. As the official documentation notes, "In many cases, a linear loop is faster" when using `Start-Job` [Optimize performance using parallel execution](https://learn.microsoft.com/en-us/powershell/scripting/dev-cross-plat/performance/parallel-execution).

`Start-ThreadJob` uses thread-based jobs within the same PowerShell process. This is lighter-weight than `Start-Job` and avoids the serialization overhead. It is available in PowerShell 7 and higher, and can be installed via the `ThreadJob` module in Windows PowerShell 5.1 [Optimize performance using parallel execution](https://learn.microsoft.com/en-us/powershell/scripting/dev-cross-plat/performance/parallel-execution).

`ForEach-Object -Parallel` is designed for pipeline usage. It uses runspaces to execute code in parallel. As of PowerShell 7.1, it reuses runspaces from a runspace pool by default, which reduces overhead [Optimize performance using parallel execution](https://learn.microsoft.com/en-us/powershell/scripting/dev-cross-plat/performance/parallel-execution). This is generally the most efficient option for pipeline-based parallelism in PowerShell 7.5.

## Measure before you parallelise

The performance impact of parallel execution varies significantly based on the workload. The following illustrative example uses a benchmarking function to compare the relative performance of different parallel approaches. This code is provided as an example to demonstrate how to measure performance; it has not been tested in this environment.

```powershell
# Illustrative example: Measure-Parallel function
# This function compares Start-Job, Start-ThreadJob, ForEach-Object -Parallel, and Start-Process
# It simulates 20 jobs with a batch size of 5
Measure-Parallel -Approach All -BatchSize 5 -JobCount 20 -Verbose
```

The results from a Windows computer running PowerShell 7.5.1 show significant differences [Optimize performance using parallel execution](https://learn.microsoft.com/en-us/powershell/scripting/dev-cross-plat/performance/parallel-execution):

- `Start-Process`: 0.26 seconds. Fastest because it avoids job management overhead, but limited to single external commands.
- `ForEach-Object -Parallel`: 0.79 seconds. Low overhead due to runspace pooling.
- `Start-ThreadJob`: 2.37 seconds. Moderate overhead.
- `Start-Job`: 7.58 seconds. Highest overhead due to process creation and serialization.

These ratios provide a sense of relative performance, but your actual times will vary based on hardware and workload. The key takeaway is that `Start-Job` is often the slowest option for parallel execution in PowerShell 7.5.

## Manage concurrency and state

Running scripts in parallel doesn't guarantee improved performance. You must balance the overhead of parallel execution with the type of work done. The `ThrottleLimit` parameter in `Start-ThreadJob` and `ForEach-Object -Parallel` allows you to limit the number of jobs running at one time. As more jobs are started, they are queued and wait until the current number of jobs drops below the throttle limit. The default runspace pool size is 5 for `ForEach-Object -Parallel` [Optimize performance using parallel execution](https://learn.microsoft.com/en-us/powershell/scripting/dev-cross-plat/performance/parallel-execution).

State management is another critical consideration. When running parallel processes, each process has its own runspace. This means that variables and state from the parent scope are not automatically shared. You must use the `Using:` scope modifier to pass data into parallel jobs, and you must use synchronized data structures, such as a synchronized hashtable, to share state between threads [Displaying progress while multi-threading](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/write-progress-across-multiple-threads).

For example, if you need to track progress across multiple threads, you can use a synchronized hashtable to update a common state object. This allows you to display progress without race conditions. However, this adds complexity to your script. If your script does not need to share state, parallel execution is simpler and safer.

## Verify your results

Before deploying a parallel script, verify that it produces the same results as the sequential version. Parallel execution can introduce race conditions, especially when multiple threads write to the same file or database. Test with a small dataset first, and then scale up. Monitor CPU and memory usage to ensure that the parallel execution is not causing resource contention.

If your script is not showing significant performance improvements, consider whether the overhead of parallel execution is outweighing the benefits. In some cases, a linear loop or a more efficient algorithm may be faster than parallel execution. The goal is to find the right balance between complexity and performance.

tags: [powershell, performance, parallel-execution, scripting, best-practices]
diagram:
  title: Parallel Execution Decision Flow
  nodes:
    - Is the workload I/O bound or CPU bound?
    - Does the script need to share state between threads?
    - Is the overhead of parallel execution justified?
    - Have you measured performance with a benchmark?
    - Is the script producing correct results?
claims:
  - claim: Start-Job creates a new PowerShell process for each job, which can be slower than linear execution for small tasks.
    source_id: S1
    evidence_span: "Start-Job runs each job in a separate process, each with a new instance of PowerShell. In many cases, a linear loop is faster."
  - claim: ForEach-Object -Parallel uses runspaces and reuses them from a pool by default in PowerShell 7.1+.
    source_id: S1
    evidence_span: "As of PowerShell 7.1, ForEach-Object -Parallel reuses runspaces from a runspace pool by default."
  - claim: Synchronized hashtables are required to share state between parallel threads in PowerShell.
    source_id: S3
    evidence_span: "A synced hashtable is a thread safe data structure that can be modified by multiple threads simultaneously without throwing an error."
  - claim: Start-Process is the fastest option for running single external commands, but lacks job management overhead.
    source_id: S1
    evidence_span: "The Start-Process approach performs best because it doesn't have the overhead of job management."
  - claim: ThrottleLimit limits the number of concurrent jobs, queuing excess jobs until a slot is available.
    source_id: S1
    evidence_span: "As more jobs are started, they're queued and wait until the current number of jobs drops below the throttle limit."
review_questions:
  - "How does the performance of ForEach-Object -Parallel compare to Start-ThreadJob on Linux vs Windows?"
  - "What are the specific memory implications of using a synchronized hashtable for large datasets?"
  - "How can you handle errors in parallel jobs without losing the context of which job failed?"
