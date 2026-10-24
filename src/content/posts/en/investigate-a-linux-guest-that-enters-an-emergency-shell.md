---
title: "Investigate a Linux guest that enters an emergency shell"
description: "Troubleshoot a Linux VM in emergency shell by verifying mount points, fstab, and synthetic storage visibility."
pubDate: 2025-05-12
category: hyper-v
tags: ["hyper-v", "linux", "troubleshooting", "emergency-shell", "synthetic-drivers"]
translationKey: investigate-a-linux-guest-that-enters-an-emergency-shell
draft: true
---

A Linux virtual machine dropping into an emergency shell is a clear signal that the boot process could not mount the root filesystem. On a Hyper-V host, this usually points to a configuration error in `/etc/fstab`, filesystem corruption, or a failure in the synthetic storage driver that prevents the virtual disk from appearing as a block device. The first step is to determine whether the disk is visible to the kernel and whether the mount instructions are correct.

## Check if the virtual disk is visible

[![Linux VM Emergency Shell Troubleshooting Flow](/images/posts/2025/azc-178-checkpoints.svg)](/images/posts/2025/azc-178-checkpoints.svg)

The synthetic storage driver (`hv_storvsc`) is part of the mainline Linux kernel. If the driver is not loaded, the virtual disk will not appear as a block device, and the boot process will fail before the operating system can mount the root partition. However, in most modern Linux distributions, this driver is built into the kernel, so its absence usually indicates a kernel issue rather than a missing package.

From the emergency shell, check if the `hv_storvsc` module is loaded. Run the following command:

```bash
lsmod | grep hv_storvsc
```

If the output is empty, the storage driver is not loaded. This is a strong indicator that the kernel is not communicating with the Hyper-V synthetic storage controller. You can also check if the `hv_utils` module is loaded, as it is part of the Linux integration services and indicates general Hyper-V connectivity:

```bash
lsmod | grep hv_utils
```

If the `hv_utils` module is present, the kernel has basic integration with the host, but the storage driver might still be missing or failing. In this case, check the kernel ring buffer for errors related to the storage device:

```bash
dmesg | grep -i error
```

Look for messages related to `hv_storvsc` or `ext4`/`xfs` filesystem errors. These messages can provide clues about why the filesystem failed to mount.

## Verify the virtual disk is visible

Once the driver is loaded, check if the virtual disk is visible to the operating system. Run the following command:

```bash
lsblk
```

You should see the virtual disk, typically named `sda` or `vda`, with the partitions listed below it. If the disk is not visible, the issue may be with the virtual machine configuration or the virtual hard disk file itself. Ensure that the virtual machine is using a Generation 2 configuration if it is a modern Linux distribution, and that the virtual hard disk is attached to the correct controller.

If the disk is visible but the root partition is not mounted, check the `/etc/fstab` file for errors. A common mistake is a typo in the UUID or mount point. In an emergency shell, the root filesystem is often mounted read-only at `/sysroot`. You can check the `fstab` file by running:

```bash
cat /sysroot/etc/fstab
```

Look for any entries that reference the root partition. If the UUID is incorrect or the mount point is wrong, the boot process will fail. You can also check the kernel ring buffer for errors related to the storage device:

```bash
dmesg | grep -i error
```

## Check Hyper-V integration services

Even if the storage driver is loaded, other integration services may be disabled, which can affect the virtual machine's ability to boot correctly. For example, the `hv_vmbus` driver is essential for communication with the Hyper-V host.

Check if the `hv_vmbus` module is loaded:

```bash
lsmod | grep hv_vmbus
```

If it is not loaded, the virtual machine may not be able to communicate with the host, which can cause boot failures. You can also check the status of the integration services daemons:

```bash
ps -ef | grep hv
```

Look for processes such as `hv_kvp_daemon`, `hv_vss_daemon`, and `hv_fcopy_daemon`. If these processes are not running, the integration services may not be functioning correctly. For more information on these daemons, see [Manage Hyper-V Integration Services](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/manage-hyper-v-integration-services).

## Restore the virtual machine

If the issue is a missing driver, you can try to load the module manually:

```bash
modprobe hv_storvsc
```

If the module loads successfully, try to mount the root filesystem manually. In an emergency shell, the root filesystem is often mounted at `/sysroot`. You can change root to this directory and repair the system:

```bash
chroot /sysroot
```

Once inside the chroot environment, you can edit the `/etc/fstab` file to fix any errors. If the filesystem is corrupted, you can run a filesystem check:

```bash
e2fsck -f /dev/sda1
```

Replace `/dev/sda1` with the appropriate partition for your root filesystem. After making any changes, exit the chroot environment and reboot the virtual machine:

```bash
exit
reboot
```

If the issue is with the virtual machine configuration, check the settings in Hyper-V Manager. Ensure that the virtual machine is using a Generation 2 configuration if it is a modern Linux distribution, and that the virtual hard disk is attached to the correct controller.

## Verify the fix

After resolving the issue, reboot the virtual machine and verify that it boots correctly. Check the system logs for any errors that may have occurred during the boot process.

```bash
journalctl -b -1
```

This command shows the logs from the previous boot, which can help identify any remaining issues. If the virtual machine boots correctly, the issue is resolved. If the issue persists, you may need to investigate further or seek additional support.

tags: [hyper-v, linux, troubleshooting, emergency-shell, synthetic-drivers]
diagram:
  title: Linux VM Emergency Shell Troubleshooting Flow
  nodes:
    - Start: Linux VM boots to emergency shell
    - Check1: Is hv_storvsc module loaded?
    - Check2: Is virtual disk visible (lsblk)?
    - Check3: Is root partition mountable?
    - Action1: Load module (modprobe)
    - Action2: Check VM config in Hyper-V
    - Action3: Repair filesystem or restore backup
    - End: VM boots successfully
claims:
  - claim: Synthetic storage driver failure can prevent disk visibility in a Linux VM on Hyper-V.
    source_id: S2
    evidence_span: "Hyper-V specific Storage device... grants high-performance access to storage devices"
  - claim: Linux integration services are provided through the Linux kernel.
    source_id: S1
    evidence_span: "Linux integration services are generally provided through the Linux kernel."
  - claim: The hv_storvsc driver is part of the mainline Linux kernel.
    source_id: S1
    evidence_span: "Linux integration services are generally provided through the Linux kernel."
review_questions:
  - "What specific kernel version is required for hv_storvsc on the user's Linux distribution?"
  - "Are there any known issues with specific Linux distributions and Hyper-V synthetic drivers?"
  - "What is the recommended backup strategy for Hyper-V Linux virtual machines?"
}
