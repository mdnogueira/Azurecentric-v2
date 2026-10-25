---
title: "Use production checkpoints with a clear recovery purpose"
description: "Configure Hyper-V production checkpoints for AD workloads, manage storage impact, and apply or delete checkpoints safely."
pubDate: 2025-05-10
category: hyper-v
tags: ["hyper-v", "production-checkpoints", "virtual-machines", "windows-server", "backup-and-recovery"]
translationKey: use-production-checkpoints-with-a-clear-recovery-purpose
draft: false
---

A checkpoint is not a backup. It is a point-in-time capture of a virtual machine's state. When you use production checkpoints, you are choosing a method that relies on guest-integrated backup technology rather than saving the running state. This distinction matters for recovery, storage management, and supported workloads.

The first decision is whether the workload supports production checkpoints. Active Directory Domain Services (AD DS) and Active Directory Lightweight Directory Services (AD LDS) roles only support production checkpoints. For other server workloads, production checkpoints are the default for new virtual machines on Windows Server 2016 and later, but you must still verify that the workload can tolerate the backup process inside the guest.

## Select the correct checkpoint type

Open Hyper-V Manager and right-click the virtual machine. Select **Settings** and navigate to the **Checkpoints** section under **Management**. Here you can choose between production checkpoints and standard checkpoints.

Production checkpoints are "point in time" images created using backup technology inside the guest. They are supported for all production workloads that can participate in the backup process. Standard checkpoints capture the state, data, and hardware configuration of a running virtual machine. They are intended for development and test scenarios where you need to recreate a specific state to troubleshoot a problem.

If you select production checkpoints, you can also specify whether the host should take a standard checkpoint if a production checkpoint cannot be taken. Clearing this checkbox means that if a production checkpoint fails, no checkpoint is taken at all. This prevents the creation of an unsupported standard checkpoint by accident.

## Manage storage and availability

Checkpoints consume disk space on the physical storage where the checkpoint files are stored. If available space runs out, virtual machines with checkpoints or virtual hard disks on that disk may pause automatically. Hyper-V Manager shows the status of these virtual machines as paused-critical.

You can change the checkpoint file location to store checkpoint configuration files on a different drive. This helps manage storage impact, but it does not eliminate the need to monitor disk space. If a virtual machine runs a server workload in a production environment, you should take the virtual machine offline and apply or delete checkpoints to prevent storage exhaustion.

To delete checkpoints, you must shut down the virtual machine to complete the process. Leaving checkpoints in place indefinitely increases the risk of storage exhaustion and complicates recovery. If you need to recreate a specific state for troubleshooting, standard checkpoints may be more appropriate, but they are not supported for production workloads.

## Apply or delete checkpoints

When you are ready to recover from a checkpoint, you can apply it to restore the virtual machine to the checkpointed state. This is done through Hyper-V Manager by selecting the checkpoint and choosing to apply it. The virtual machine will be restored to the state captured at the time of the checkpoint.

If you decide to delete a checkpoint, you must shut down the virtual machine first. This ensures that the checkpoint files are properly merged or removed without leaving the virtual machine in an inconsistent state. Deleting checkpoints is necessary to free up storage space and maintain the health of the virtual machine.

For workloads that do not support production checkpoints, or where the backup process inside the guest fails, you may need to fall back to standard checkpoints. However, this should only be done for development and test scenarios. For production workloads, ensure that the guest is configured to support production checkpoints and that the backup process is functioning correctly.

## Verify the configuration

After configuring the checkpoint type, verify that the virtual machine is using the correct setting. Check the **Checkpoints** section in the virtual machine settings to confirm the selection. If you have specified a fallback to standard checkpoints, test the production checkpoint process to ensure it works as expected.

Monitor the storage space on the physical disk where checkpoint files are stored. Ensure that there is sufficient space to accommodate the checkpoint files and that the virtual machine can resume from a checkpoint if needed. Regularly review and delete old checkpoints to prevent storage exhaustion.

For production workloads, consider implementing a backup strategy that includes regular backups of the virtual machine data, rather than relying solely on checkpoints. Checkpoints are a recovery tool for specific states, not a substitute for comprehensive backup and disaster recovery planning.

References for Use production checkpoints with a clear recovery purpose: [Choose between standard or production checkpoints in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/Choose-between-standard-or-production-checkpoints-in-Hyper-V), [Avoid using checkpoints on a virtual machine that runs a server workload in a production environment](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/avoid-using-checkpoints-on-a-virtual-machine-server-workload-production), [Enable or disable checkpoints in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/Enable-or-disable-checkpoints-in-Hyper-V).
