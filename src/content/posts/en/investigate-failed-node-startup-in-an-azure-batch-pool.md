---
title: "Investigate failed node startup in an Azure Batch pool"
description: "Troubleshoot Azure Batch node startup failures by distinguishing pool-level allocation errors from node-level start task and configuration issues."
pubDate: 2026-04-21
category: hpc-ai
tags: ["troubleshooting", "hpc", "azure-batch", "node-errors", "start-task", "dns"]
translationKey: investigate-failed-node-startup-in-an-azure-batch-pool
draft: false
---

A node that fails to start in an Azure Batch pool is a symptom, not a single cause. The failure might occur before the node is allocated, during the allocation process, or after the node is ready but before it can run tasks. The first step is to determine where the failure happened. The error location dictates the troubleshooting path.

## Distinguish pool-level from node-level failures

Pool operations such as creation, resizing, and deletion can fail asynchronously. If the pool itself is in an error state, nodes will not start because the underlying infrastructure was not provisioned correctly. Check the pool state and any associated error codes first.

Pool errors often stem from:

- **Resize timeouts**: If the pool cannot allocate the requested number of nodes within the specified timeout, it enters a steady state with errors. Common causes include insufficient core quotas, lack of subnet IP addresses, or resource locks on the underlying Virtual Machine Scale Set (VMSS). The default timeout is 15 minutes, but large pools using custom images may require up to 30 minutes.
- **Relay provider errors**: These errors are relayed from lower-layer services like VMSS. They provide structured JSON details, including an error code (e.g., `AllocationFailed`, `BadRequest`) and a provider-specific message. For example, a mismatch between the VM size and the hypervisor generation of the image will result in a `BadRequest` error from the provider.
- **Resource locks**: If a scope lock is applied to the VMSS or other Batch-created resources (such as NSGs or load balancers), resize operations will fail.

If the pool is healthy and nodes are allocated, the issue is likely at the node level. Nodes that fail to start properly will typically show a specific state and error code.

## Investigate node startup errors

When a node is allocated but fails to become usable, Batch sets the `computeNodeState` to a specific value and populates the `computeNodeError` property. One frequent cause of startup failure is a failed start task.

### Start task failures

A start task runs on each node when it starts. If you configure the start task with `waitForSuccess` set to `true`, and the start task fails, the node enters the `starttaskfailed` state. The node is unusable but still incurs charges.

To diagnose this:

1. Check the `startTaskInformation` property on the node, specifically the `taskExecutionResult` and `taskFailureInformation`.
2. Review the `stdout` and `stderr` logs from the start task. These logs are available via the Azure portal, Batch Explorer, or the Batch REST API.
3. Ensure the start task is re-entrant. If the node reboots, the start task may run again. If the task installs applications to the OS disk while storing data on the ephemeral disk, sync issues can occur.

### Application package or container download failures

If the node fails to download or uncompress application packages or container images, the `computeNodeState` is set to `unusable`. The `computeNodeError` property will contain details about the failure. Unlike start task failures, Batch does not automatically recover nodes that fail to install application packages or containers.

### Network and DNS issues

Nodes in a virtual network may fail to start if traffic is blocked to key ports, or if outbound traffic to Azure Storage is blocked. Custom DNS configurations that cannot resolve Azure storage endpoints will also cause failures. Check the network security groups (NSGs) and DNS settings associated with the subnet.

## Recovering an unusable node

Once you have identified the cause, you can take action to recover the node. The available options depend on the state of the node and the nature of the failure.

### Reboot or reimage

- **Reboot**: Restarting a node can fix latent issues such as stuck processes. If a start task or job preparation task is configured, it will run again after the reboot.
- **Reimage**: Reinstalling the operating system on the node. Start tasks and job preparation tasks rerun after reimaging. Note that reimage is not supported for pools using `VirtualMachineConfiguration` with OS disks.

### Remove and replace

If rebooting or reimaging does not resolve the issue, or if the node is stuck in an `unusable` state due to disk full conditions or persistent configuration errors, you may need to remove the node from the pool. Batch will then allocate a new node to replace it.

- Use the `removeNodes` API to remove the problematic node.
- Ensure you have retrieved any necessary data from the node before removal.
- If the node was disk-full, deleting old jobs or tasks on the node can free up space, allowing a reboot to recover the node without removal. However, the `list-node-files` API only lists files in Batch-managed directories. If your tasks created files elsewhere, this API does not show them. You may need to connect remotely to investigate.

### Disable task scheduling

To investigate a node without losing failed task data or causing further failures, you can disable task scheduling on the node. This takes the node offline for new tasks but allows you to connect remotely (via RDP for Windows or SSH for Linux) to examine logs and configurations. After resolving the issue, re-enable scheduling.

## Verification

After applying a fix, verify the node state:

1. Check the `computeNodeState` property. It should transition from `unusable` or `starttaskfailed` to `idle` or `running`.
2. Confirm that the `computeNodeError` property is cleared or indicates a successful state.
3. Submit a test task to the node to ensure it can execute workloads successfully.

If the node remains in an error state, upload the Batch agent log files from the node to support for further analysis. These logs are available via the Azure portal, Batch Explorer, or the `uploadBatchServiceLogs` API.

References for Investigate failed node startup in an Azure Batch pool: [Pool and node errors](https://learn.microsoft.com/en-us/azure/batch/batch-pool-node-error-checking), [Error handling and detection in Azure Batch](https://learn.microsoft.com/en-us/azure/batch/error-handling).
