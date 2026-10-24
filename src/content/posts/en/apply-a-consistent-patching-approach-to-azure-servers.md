---
title: "Apply a consistent patching approach to Azure servers"
description: "Configure Azure VM patching modes to balance platform orchestration control with guest OS autonomy."
pubDate: 2025-11-07
category: compute
tags: ["azure-virtual-machines", "patch-management", "automatic-patching", "availability-first", "linux", "windows"]
translationKey: apply-a-consistent-patching-approach-to-azure-servers
draft: true
---

You need to patch Azure Virtual Machines, but you are unsure whether to let the Azure platform manage the updates or leave it to the guest operating system. The choice determines who controls the reboot timing and how the platform limits the impact of a faulty patch across your fleet.

Azure provides distinct patch orchestration modes. `AutomaticByPlatform` gives Azure control over the schedule and applies availability-first principles. `AutomaticByOS` (Windows) and `ImageDefault` (Linux) leave control to the guest. Selecting the right mode depends on your need for coordinated reboots and your compliance with supported image requirements.

[![Azure VM Patching Orchestration Flow](/images/posts/2025/azc-242-checkpoints.svg)](/images/posts/2025/azc-242-checkpoints.svg)

## Platform orchestration vs. native updates

`AutomaticByPlatform` is the mode where Azure manages the patching lifecycle. When enabled, Azure assesses the VM for Critical and Security patches, downloads them, and applies them during off-peak hours for the VM's time zone. This mode is supported for both Linux and Windows VMs, provided they are created from supported platform images.

A key feature of `AutomaticByPlatform` is its adherence to availability-first principles. Azure orchestrates updates in phases across regions, availability zones, and availability sets to limit the blast radius of a faulty patch. For example, VMs in different availability zones are not updated concurrently, and within an availability set, no more than 20% of VMs are updated at a time. This phased approach is managed by the Azure platform, not the guest OS.

In contrast, `AutomaticByOS` is available only for Windows VMs. It enables the native Windows Automatic Updates service within the guest. While this allows the OS to manage its own update schedule, it does not support Azure’s availability-first orchestration. The platform does not coordinate the reboot timing across your fleet, which can lead to simultaneous reboots if many VMs happen to trigger updates at the same time.

## Linux configuration and constraints

For Linux VMs, the equivalent of `AutomaticByPlatform` is the only mode that provides platform-level orchestration. The default mode for Linux VMs is `ImageDefault`, which honors the default patching configuration of the image used to create the VM. This mode does not support availability-first patching.

To enable `AutomaticByPlatform` on a Linux VM, you must set the `patchMode` property to `AutomaticByPlatform` in the VM template or via the REST API. The VM must have the Azure VM Agent installed, and for Linux, the agent version must be 2.2.53.1 or higher. Custom images are not currently supported for `AutomaticByPlatform`.

```json
{
  "location": "eastus",
  "properties": {
    "osProfile": {
      "linuxConfiguration": {
        "provisionVMAgent": true,
        "patchSettings": {
          "patchMode": "AutomaticByPlatform"
        }
      }
    }
  }
}
```

This code is an illustrative example of the JSON structure required for the REST API. It assumes the VM is being created or updated in the `eastus` region. The `patchMode` property is the critical setting that switches control from the image default to Azure’s orchestration.

## Windows configuration and limitations

Windows VMs offer more flexibility in patch mode selection. You can choose between `AutomaticByPlatform`, `AutomaticByOS`, and `Manual`.

`AutomaticByPlatform` disables the native Windows Automatic Updates service and replaces it with Azure’s orchestration. This is often the preferred choice for Windows VMs in production environments where consistent, controlled patching is required.

`AutomaticByOS` leaves the native Windows Automatic Updates service enabled. This mode is set by default if no other patch mode is specified. However, it does not support availability-first patching, meaning Azure will not coordinate the reboot timing across your VM fleet.

`Manual` mode disables Automatic Updates entirely. This is useful if you plan to use a third-party patch management solution or Azure Update Manager for custom scheduling. Switching between modes on Windows VMs has constraints. For instance, you cannot switch between `AutomaticByOS` and `Manual` modes directly. You must first switch to `AutomaticByPlatform` as an intermediate step if needed.

## Verification and next steps

To verify the current patch mode of a VM, you can use the Azure CLI or PowerShell to inspect the `patchSettings` property. For example:

```bash
az vm show -g myResourceGroup -n myVM --query "osProfile.linuxConfiguration.patchSettings.patchMode"
```

This command returns the current patch mode. If it returns `AutomaticByPlatform`, Azure is managing the patching schedule. If it returns `ImageDefault` (for Linux) or `AutomaticByOS` (for Windows), the guest OS or image default is in control.

When deciding on a patching approach, consider the following:

1. **Orchestration Control**: If you need Azure to coordinate reboots and limit blast radius, use `AutomaticByPlatform`.
2. **OS Support**: `AutomaticByPlatform` is supported for both Linux and Windows. `AutomaticByOS` is Windows-only.
3. **Image Requirements**: `AutomaticByPlatform` requires supported platform images. Custom images are not supported.
4. **Agent Version**: Ensure the Azure VM Agent is up to date, especially for Linux VMs using `AutomaticByPlatform`.

If you are managing a mixed environment of Windows and Linux VMs, `AutomaticByPlatform` provides a consistent approach to patching across both operating systems. For Windows VMs where native update policies are already established and orchestration control is less critical, `AutomaticByOS` may be sufficient. However, for most production workloads, the availability-first principles of `AutomaticByPlatform` offer a more robust patching strategy.

Once you have selected the appropriate mode, monitor the patch assessment results in Azure Resource Graph to ensure patches are being applied as expected. This provides visibility into the patching status and helps identify any VMs that may be failing to update due to configuration issues or network restrictions.


References for Apply a consistent patching approach to Azure servers: [Automatic Guest Patching for Azure Virtual Machines and Scale Sets](https://learn.microsoft.com/en-us/azure/virtual-machines/automatic-vm-guest-patching), [Understand VM reboots](https://learn.microsoft.com/en-us/azure/virtual-machines/understand-vm-reboots), [Run scripts in an Azure Linux VM](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/run-scripts-in-vm).
