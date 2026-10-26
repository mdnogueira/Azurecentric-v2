---
title: "Investigate a checkpoint chain before deleting files"
description: "Investigate Hyper-V checkpoint chains and disk space before deletion to prevent corruption and storage exhaustion."
pubDate: 2025-08-27
category: hyper-v
tags: ["checkpoints", "hyper-v", "troubleshooting", "vhd", "windows-server"]
translationKey: investigate-a-checkpoint-chain-before-deleting-files
draft: false
---

You are looking at a Hyper-V host running low on disk space, or perhaps you are planning to delete a checkpoint to reclaim storage. The immediate instinct is to select the checkpoint in Hyper-V Manager and click **Delete**. Before you do, you need to understand the chain structure. Deleting a checkpoint is not a simple file removal; it is a merge operation that can fail if the chain is broken or if the underlying storage cannot accommodate the write operations required to consolidate the data.

The core issue is that Hyper-V virtual hard disks (VHDs) often use a differencing disk structure when checkpoints are involved. A differencing disk records changes made after a checkpoint was taken, pointing back to a parent disk. If you have a chain of checkpoints, you have a linked list of these differencing disks. Deleting a checkpoint triggers a merge, where the changes in the differencing disk are written back into its parent. This process requires significant free space on the physical volume hosting the VHDs.

## Understand the checkpoint type first

Not all checkpoints behave the same way during creation, which influences their suitability for different workloads. Since Windows Server 2016, Hyper-V supports two types: standard and production checkpoints [Choose between standard or production checkpoints in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/Choose-between-standard-or-production-checkpoints-in-Hyper-V).

Production checkpoints are the default for new virtual machines. They are designed for production workloads and use backup technology inside the guest OS to create a consistent "point in time" image. This makes them the supported method for virtual machines running critical roles like Active Directory Domain Services [Choose between standard or production checkpoints in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/Choose-between-standard-or-production-checkpoints-in-Hyper-V).

Standard checkpoints capture the state, data, and hardware configuration of a running virtual machine. They are intended for development and test scenarios. Deleting a standard checkpoint involves a direct merge of the differencing disk into its parent. This process is more aggressive and can be risky if not managed correctly, especially in complex chains.

Before you proceed, identify the type of checkpoint you are dealing with. Right-click the virtual machine in Hyper-V Manager, select **Settings**, and under the **Management** section, check the **Checkpoints** setting [Enable or disable checkpoints in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/Enable-or-disable-checkpoints-in-Hyper-V)[Choose between standard or production checkpoints in Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/Choose-between-standard-or-production-checkpoints-in-Hyper-V). This tells you whether the VM is configured for production or standard checkpoints. If you are unsure, assume it is a production checkpoint unless you explicitly configured it otherwise.

## Inspect the checkpoint chain

A single checkpoint is easy to manage. A chain of checkpoints is where things get complicated. If you have taken multiple checkpoints, you have a chain of differencing disks. Each checkpoint in the chain points to a parent disk, which may itself be a differencing disk pointing to another parent, all the way back to the original base VHD.

The danger lies in the merge operation. When you delete a checkpoint, Hyper-V merges the differencing disk into its parent. If the parent is shared by other differencing disks in the chain, merging it will corrupt the relationship between those other disks and the parent, making them unusable [Ensure sufficient physical disk space is available when virtual machines use differencing virtual hard disks](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/ensure-sufficient-physical-disk-space-is-available-when-virtual-machines-use-differencing). Therefore, you must verify the structure of the chain before deleting any checkpoint.

To inspect the chain, you can use Hyper-V Manager or PowerShell. In Hyper-V Manager, select the virtual machine and look at the **Checkpoint** pane. This shows the hierarchy of checkpoints. However, for a more detailed view of the underlying VHD files, PowerShell is more reliable.

```powershell
# Illustrative example: Inspect the checkpoint chain
Get-VM -Name "MyVM" | Get-VHD | Where-Object {$_.Path -like "*.avhdx"} | Format-List Path, ParentPath, DiskNumber
```

This command lists all differencing disks (`.avhdx` files) associated with the VM, showing their parent paths. This helps you visualise the chain. If you see multiple `.avhdx` files pointing to the same parent, you have a branching chain, which is a red flag. Deleting a checkpoint in a branching chain can lead to corruption.

## Check physical disk space

Even if the chain is linear, deleting a checkpoint requires free space. Differencing virtual hard disks require available space on the hosting volume so that space can be allocated when writes to the virtual hard disks occur [Ensure sufficient physical disk space is available when virtual machines use differencing virtual hard disks](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/ensure-sufficient-physical-disk-space-is-available-when-virtual-machines-use-differencing). If available space is exhausted, the merge operation will fail, and the virtual machine could be affected. This is a common cause of sudden disk space exhaustion on Hyper-V hosts.

The Best Practices Analyzer for Hyper-V includes a check for this scenario: **Ensure sufficient physical disk space is available when virtual machines use differencing virtual hard disks** [Ensure sufficient physical disk space is available when virtual machines use differencing virtual hard disks](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/ensure-sufficient-physical-disk-space-is-available-when-virtual-machines-use-differencing). This check warns you if one or more virtual machines are using differencing disks and if the available space on the hosting volume is insufficient.

Before deleting a checkpoint, check the free space on the volume hosting the VHDs. A good rule of thumb is to ensure you have at least 20-30% free space, or more if the differencing disks are large. If the space is tight, consider merging the differencing disks into their parent to reclaim space gradually, rather than deleting a checkpoint all at once.

## Delete the checkpoint safely

Once you have verified the checkpoint type, inspected the chain, and confirmed sufficient disk space, you can proceed with the deletion.

1.  Open **Hyper-V Manager** and select the virtual machine.
2.  In the **Actions** pane, click **Checkpoint** to view the list of checkpoints.
3.  Right-click the checkpoint you want to delete and select **Delete**.
4.  Confirm the deletion. Hyper-V will begin the merge process.

If you are using PowerShell, you can use the `Remove-VMSnapshot` cmdlet.

```powershell
# Illustrative example: Remove a checkpoint
Remove-VMSnapshot -VMName "MyVM" -Name "Checkpoint1"
```

Monitor the merge process. It can take some time, depending on the size of the differencing disk and the speed of the underlying storage. Do not interrupt the process, as this can corrupt the virtual hard disk.

## Verify the deletion

After the deletion is complete, verify that the checkpoint has been removed and the merge was successful. In Hyper-V Manager, check the **Checkpoint** pane to ensure the checkpoint is no longer listed. You can also check the VHD files on the host to ensure the differencing disk has been merged into the parent and the `.avhdx` file has been removed or renamed.

If the deletion fails, check the Event Viewer on the Hyper-V host for errors related to Hyper-V or VHD management. Common errors include insufficient disk space, permission issues, or corruption in the VHD chain. If you encounter corruption, you may need to restore the virtual machine from a backup or repair the VHD using the `Edit Disk` wizard in Hyper-V Manager [Ensure sufficient physical disk space is available when virtual machines use differencing virtual hard disks](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-analyzer/ensure-sufficient-physical-disk-space-is-available-when-virtual-machines-use-differencing).

By following these steps, you can safely delete checkpoints in Hyper-V without risking data loss or corruption. Always prioritise understanding the chain structure and ensuring sufficient disk space before initiating a merge operation.
