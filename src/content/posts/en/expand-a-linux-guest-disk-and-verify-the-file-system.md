---
title: "Expand a Linux guest disk and verify the file system"
description: "Expand a Linux guest disk on Hyper-V by updating the partition table and file system, ensuring GPT headers are aligned."
pubDate: 2025-03-17
category: hyper-v
tags: ["hyper-v", "linux", "gpt", "vhdx"]
translationKey: expand-a-linux-guest-disk-and-verify-the-file-system
draft: false
---

You have increased the size of a virtual hard disk (VHDX) attached to a Linux virtual machine, but the guest operating system still reports the original capacity. The hypervisor has updated the block device, but the guest partition table and file system have not yet been informed of the change. This is a two-step process: first, update the partition layout to reflect the new disk boundaries, and second, expand the file system to use the newly available space.

The first thing to check is the partition table type. If the disk uses a GUID Partition Table (GPT), resizing the VHDX can leave the secondary GPT header at the end of the disk misaligned with the new disk size. Hyper-V allows shrinking or expanding VHDX files without regard for the partition structures inside [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Best-Practices-for-running-Linux-on-Hyper-V). If you expand the disk and then check the partition layout with a tool like `fdisk` or `parted`, you may see a warning about the first and secondary GPT headers. This warning is safe to resolve, but it must be addressed before the file system can be grown.

## Update the partition layout

You need to run the partition management tool inside the Linux guest. The goal is to extend the existing partition to fill the new disk space. Using `parted` is generally safer and more direct for this operation than `fdisk`, as it avoids the risk of misconfiguring partition boundaries.

For `parted`, you can extend the partition to use all available space:

```bash
sudo parted /dev/sda resizepart 1 100%
```

After the partition table is updated, the kernel needs to recognise the change. You can usually do this without a reboot by using `partprobe` or `blockdev`:

```bash
sudo partprobe /dev/sda
# or
sudo blockdev --rereadpt /dev/sda
```

If the kernel does not pick up the change immediately, a reboot may be necessary. Once the guest is back online or the partition table is reloaded, check that the partition device (e.g., `/dev/sda1`) reflects the new size using `lsblk`.

## Fix GPT headers if required

If the disk uses GPT, the expansion may have left the secondary GPT header at the old end of the disk. The `parted` tool will often detect this and prompt you to fix it. If you use `fdisk`, it updates the backup GPT location to the new disk end, but it does not explicitly 'fix' misalignment warnings in the same way `parted fix` does.

The Microsoft documentation notes that shrinking or expanding a VHDX with a GPT causes a warning when a partition management tool checks the layout, and the administrator is warned to fix the first and secondary GPT headers [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Best-Practices-for-running-Linux-on-Hyper-V). This manual step is safe to perform without data loss.

To fix the GPT headers using `parted`:

```bash
sudo parted /dev/sda
(parted) fixx
(parted) quit
```

Verify the fix by running `fdisk -l /dev/sda` or `parted /dev/sda print` and ensuring there are no warnings about misaligned headers.

## Grow the file system

With the partition expanded and the GPT headers corrected, the next step is to grow the file system. The command depends on the file system type.

For ext4, use `resize2fs`:

```bash
sudo resize2fs /dev/sda1
```

For XFS, use `xfs_growfs`:

```bash
sudo xfs_growfs /mount/point
```

Note that XFS can only be grown, not shrunk, and the mount point must be specified. ext4 can be grown while mounted, but it is safer to ensure no heavy I/O is occurring.

## Verify the change

After growing the file system, verify that the guest OS sees the new capacity. Use `df -h` to check the file system size and `lsblk` to check the block device size. The file system size should now match the partition size, which should match the new VHDX size.

If you encounter issues, check the following:

1. **Partition table not updated**: Ensure the partition table was written and the kernel has recognised the change. A reboot may be necessary.
2. **GPT headers not fixed**: If the GPT headers are misaligned, the file system may not see the full partition size. Fix the headers as described above.
3. **File system type mismatch**: Ensure you are using the correct command for your file system type. `resize2fs` is for ext2/3/4, and `xfs_growfs` is for XFS.

By following these steps, you can safely expand a Linux guest disk on Hyper-V and verify that the file system is using the new space. Always ensure you have a backup before making changes to partition tables or file systems.


References for Expand a Linux guest disk and verify the file system: [Physical storage architectures for Hyper-V in Windows Server](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-storage-architecture), [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/Best-Practices-for-running-Linux-on-Hyper-V), [Supported SUSE Linux Enterprise Server (SLES) virtual machines on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/supported-suse-virtual-machines-on-hyper-v).
