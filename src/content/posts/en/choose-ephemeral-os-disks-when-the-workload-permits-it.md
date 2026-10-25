---
title: "Choose ephemeral OS disks when the workload permits it"
description: "Decide when ephemeral OS disks fit your workload by checking VM size, placement, and lifecycle constraints."
pubDate: 2025-09-15
category: compute
tags: ["azure-virtual-machines", "vm-sizing", "azure-cli"]
translationKey: choose-ephemeral-os-disks-when-the-workload-permits-it
draft: false
---

You are planning a new virtual machine deployment and have noticed the option to use an ephemeral OS disk. It sounds like a small configuration choice, but it fundamentally changes how the operating system is stored and how the VM behaves when it is reimaged. The decision to enable this feature depends on whether your workload can tolerate the loss of local data and whether your chosen VM size supports the required cache or temp disk space.

Ephemeral OS disks are designed for workloads where the OS is treated as immutable infrastructure. Instead of writing the OS to a persistent managed disk, the OS is stored in the local cache or temporary disk of the host. This reduces latency for OS disk operations. However, this benefit comes with a strict limitation: any data written to the OS disk is lost when the VM is reimaged. Therefore, this feature is suitable for stateless applications, build agents, or web servers that store state externally, but it is not appropriate for databases or any application that expects the OS disk to persist changes.

## Check VM size and storage compatibility

Not all virtual machine sizes support ephemeral OS disks. The host must have a local cache or temporary disk that is larger than the OS image being deployed. If you attempt to enable this option on an unsupported size, the deployment will fail or the option will be greyed out in the portal.

When selecting a VM size, you need to ensure it supports Premium storage and has sufficient local storage. The documentation notes that if the option is greyed out, you may have selected a size that does not have a cache or temp disk larger than the OS image. You should review the VM size specifications for the region you are targeting to confirm local storage capacity. For example, many DS and DSv2-series sizes support this feature, but you must verify the specific cache size against your OS image size.

## Choose the placement strategy

Azure offers two placement options for ephemeral OS disks: `CacheDisk` and `ResourceDisk`. This choice determines where the OS image is stored on the host and affects how the local storage is utilised.

*   **CacheDisk**: The OS is stored in the host's cache disk. This placement is suitable for workloads that benefit from low-latency OS disk access. However, the cache disk is also used for caching data from attached managed disks, so you need to ensure that the cache size is sufficient for both the OS and any attached data disks.
*   **ResourceDisk**: The OS is stored in the host's temporary disk. This is a separate local storage volume. This placement is useful if you want to preserve the cache disk for data disk caching or if the cache disk is not large enough to hold the OS image. The temporary disk is also local to the host, so it shares the same durability characteristics as the cache disk.

In the Azure portal, you can select this option in the **Advanced** section of the **Disks** tab, under **OS cache placement** or **Temp disk placement**. The screenshot below shows this selection in the portal.



When using templates or CLI, you specify the placement using the `--ephemeral-os-disk-placement` parameter. For example, to use the resource disk, you would set `--ephemeral-os-disk-placement ResourceDisk`. The caching policy for the OS disk must be set to `ReadOnly` to ensure that writes are not persisted to the ephemeral storage.

## Understand the impact on VM lifecycle

Using an ephemeral OS disk changes how you manage the VM's lifecycle. Because the OS is not stored on a persistent managed disk, you cannot detach and reattach the OS disk to another VM. If you need to move the OS to a different VM, you must redeploy the VM from the image.

Reimaging a VM with an ephemeral OS disk is a supported operation. When you reimage the VM, the OS is restored from the image, and any local changes are lost. This is a clean way to reset the VM to its initial state. However, you cannot use an ephemeral OS disk as a source for creating a specialized VM from an existing disk, as the OS disk is not a persistent managed disk that can be attached to a new VM. If you need to recover from a failed VM by attaching its OS disk to a new VM, you must use a standard persistent OS disk.

## Verify the deployment

After deploying a VM with an ephemeral OS disk, you should verify that the feature is active. You can check the VM's configuration in the portal or by using the CLI. The OS disk type should indicate that it is ephemeral. You can also test the behavior by writing a file to the OS disk and then reimaging the VM. The file should be gone after the reimage, confirming that the OS disk is indeed ephemeral.

If you are using a scale set, the same principles apply. You can configure ephemeral OS disks for both flexible and uniform scale sets. The deployment process is similar, but you need to ensure that all VM instances in the scale set are configured consistently. If you need to update the scale set, you must use an update policy that supports rolling updates or automatic upgrades, as the OS disk cannot be swapped individually for each instance.

## When to avoid ephemeral OS disks

There are several scenarios where you should avoid using ephemeral OS disks:

*   **Stateful applications**: If your application stores state on the OS disk, such as a database or a file server, you will lose data when the VM is reimaged.
*   **Custom OS images with significant local changes**: If you have a custom OS image that includes significant local configurations or data that you expect to persist, you should use a standard persistent OS disk.
*   **VMs that require OS disk attachment**: If you need to detach and reattach the OS disk to another VM for recovery or migration purposes, you cannot use an ephemeral OS disk.

In summary, ephemeral OS disks are a powerful feature for stateless workloads that can benefit from reduced latency and cost. However, they require careful consideration of VM size, placement, and lifecycle management. Always verify that your workload can tolerate the loss of local data before enabling this feature.

### Prerequisites

*   A supported VM size with sufficient local cache or temporary disk space.
*   Azure CLI version 2.0.25 or greater, or Azure PowerShell module.
*   An image that is compatible with ephemeral OS disks.

### Example: Deploying a VM with an ephemeral OS disk using Azure CLI

The following example demonstrates how to deploy a Linux VM with an ephemeral OS disk placed on the resource disk. This is an illustrative example and has not been run.

```bash
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --image UbuntuLTS \
  --ephemeral-os-disk true \
  --ephemeral-os-disk-placement ResourceDisk \
  --os-disk-caching ReadOnly \
  --admin-username azureuser \
  --generate-ssh-keys
```

This command creates a VM with an ephemeral OS disk. The `--ephemeral-os-disk true` parameter enables the feature, `--ephemeral-os-disk-placement ResourceDisk` specifies the placement, and `--os-disk-caching ReadOnly` ensures that the OS disk is not writable. The `--generate-ssh-keys` parameter generates SSH keys for authentication.

### Verification

After the deployment, you can verify the configuration by checking the VM's properties in the portal or by using the CLI:

```bash
az vm show \
  --resource-group myResourceGroup \
  --name myVM \
  --query 'storageProfile.osDisk' \
  --output table
```

This command should show that the OS disk is ephemeral and that the caching policy is set to `ReadOnly`.

### Cleanup

To avoid incurring unnecessary costs, you should delete the VM and its associated resources when they are no longer needed. You can do this using the Azure portal or CLI, ensuring you remove associated resources like public IPs and network interfaces as per standard Azure resource management.

### Decision Criteria

| Feature | Ephemeral OS Disk | Standard Persistent OS Disk |
|---|---|---|
| Data Persistence | Lost on reimage | Persists |
| Cost | Lower (no managed disk) | Higher (managed disk) |
| Latency | Lower (local storage) | Higher (network storage) |
| Encryption | Supported on many VM sizes | Supported |
| Attach/Detach | Not supported | Supported |
| Use Case | Stateless workloads | Stateful workloads |

If your workload is stateless and you need low-latency OS disk access, an ephemeral OS disk is a good choice. If your workload is stateful or requires OS disk attachment, you should use a standard persistent OS disk.

### Next Steps

*   Review the VM size specifications for your region to confirm local storage capacity.
*   Test your workload with an ephemeral OS disk in a non-production environment to verify that it can tolerate the loss of local data.
*   Consider using Azure Compute Gallery for managing and distributing your OS images, especially if you need to support multiple VM sizes or regions.

### Review Questions

*   What is the exact minimum local cache size required for specific VM sizes in different regions?
*   Are there any specific OS images that are not compatible with ephemeral OS disks?
*   How does the performance of CacheDisk placement compare to ResourceDisk placement for specific workloads?
*   What are the exact steps to recover a VM if the host fails and the ephemeral OS disk is lost?

### Sources

*   [Deploy Ephemeral OS disks](https://learn.microsoft.com/en-us/azure/virtual-machines/ephemeral-os-disks-deploy)
*   [Attach an existing OS disk to a VM](https://learn.microsoft.com/en-us/azure/virtual-machines/attach-os-disk)
*   [Swap between OS disks using the Azure CLI](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/os-disk-swap)
