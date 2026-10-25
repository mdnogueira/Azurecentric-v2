---
title: "Prepare a repeatable HPC compute image"
description: "Create a repeatable HPC compute image for Azure Batch using snapshots and Azure Compute Gallery, with correct permissions and pool sizing."
pubDate: 2024-06-26
category: compute
tags: ["azure-batch", "azure-compute-gallery", "hpc", "virtual-machines", "infrastructure-as-code"]
translationKey: prepare-a-repeatable-hpc-compute-image
draft: false
---

You have a workload that needs consistent compute nodes: the same libraries, the same environment variables, the same data. Building that image once and reusing it is the difference between a pool that starts quickly and one that starts slowly while every node installs software from scratch. Azure Batch documentation notes that using a Shared Image can reduce the time to reach steady state by up to 25% compared to other methods [Use the Azure Compute Gallery to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-sig-images).

The recommended path is to create a managed image from snapshots, publish it to an Azure Compute Gallery, and reference that gallery image when you create your Batch pool. This approach avoids the pitfalls of post-provisioning scripts and gives you version control over your HPC environment.

[![HPC Image Preparation and Pool Creation Flow](/images/posts/2024/azc-064-checkpoints.svg)](/images/posts/2024/azc-064-checkpoints.svg)

## Why snapshots are the preferred source

You might be tempted to generalize a running virtual machine and capture an image from it. While that is technically possible, Azure Batch documentation explicitly recommends creating managed images using snapshots of the VM's disks instead. The reason is reliability. When you scale a pool, especially one with hundreds of nodes, you need the image source to be immutable and consistent. Snapshots provide a static, read-only copy of the OS and data disks at a specific point in time [Use a managed image to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-custom-images).

There are strict constraints on the base image. You must use a first-party Azure Marketplace image supported by Batch. Third-party images with additional license and purchase terms cannot be used as a base for the direct managed image method; if you need those, you must use the Azure Compute Gallery (Shared Image) method [Use a managed image to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-custom-images). For standard HPC workloads, first-party images are the norm.

Ensure the base OS image uses the default temp drive, as the Batch node agent expects this. Do not encrypt the OS disk, and do not install Azure extensions like the Custom Script extension on the VM before capturing the snapshot, as these can cause deployment failures [Use a managed image to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-custom-images).

## Preparing the VM and capturing the image

Start by creating a VM using a supported first-party Marketplace image. Connect to it via SSH or RDP and install all the software your HPC application requires. If you have large static datasets, mount and format attached data disks now and copy the data. This ensures the data is baked into the image rather than downloaded at runtime.

Once the VM is configured:

1.  **Create snapshots.** Create a snapshot of the OS disk and any data disks. These snapshots are full, read-only copies. You can create these while the VM is running.
2.  **Create a managed image.** Use the `az image create` command, specifying the resource IDs of the snapshots. This creates a managed image resource in your subscription.

If you are using the direct managed image method (which is being retired), the managed image must exist for the lifetime of any Batch pool that uses it directly. If you delete the managed image, the pool cannot scale up, and you may encounter allocation failures. Keep a record of the image's resource ID, which looks like `/subscriptions/{sub id}/resourceGroups/{resource group name}/providers/Microsoft.Compute/images/{image definition name}`.

## Publishing to Azure Compute Gallery

*   **Versioning:** You can create multiple versions of the image as you update your HPC environment.
*   **Replication:** You can replicate the image to multiple regions, allowing pools in different regions to use the same base image.
*   **Performance:** Using a Shared Image can reduce the time to reach steady state by up to 25% and reduce VM idle latency by up to 30% compared to using a raw managed image [Use the Azure Compute Gallery to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-sig-images).

To publish the managed image:

1.  Create an Azure Compute Gallery in the same region as your Batch account (or a region you can replicate to).
2.  Create an image definition in the gallery. Specify the OS type (Linux or Windows) and the state as generalized.
3.  Create an image version from your managed image. This version is what you will reference in your Batch pool.

If your base image had purchase plan information, ensure the gallery image has identical purchase plan information. You can verify this using `az sig image-definition show`. Once the Shared Image version is created, the pool references that version, not the underlying managed image directly.

## Creating the Batch pool

With the Shared Image version ready, you can create your Batch pool. You need Microsoft Entra authentication set up for the Batch client. The identity you use must have permissions to access the Shared Image. Note that Reader permissions are inadequate; you need a role that includes `Microsoft.Compute/disks/beginGetAccess/action`, such as Contributor or a custom role with that specific permission [Use the Azure Compute Gallery to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-sig-images).

When creating the pool, you must specify the Shared Image ID and the correct node agent SKU ID. The node agent SKU must align with the publisher/offer/SKU of the image. You can verify the correct SKU by checking the supported images list for your specific base image publisher/offer/SKU using the Azure CLI or Batch API.

Here is an illustrative example of how you might create a pool using the Azure CLI. This code is an example and has not been run; ensure you replace the placeholders with your actual resource IDs and SKU IDs.

```azurecli
az batch pool create \
    --id hpc-pool \
    --vm-size Standard_E8s_v3 \
    --target-dedicated-nodes 4 \
    --image "/subscriptions/{sub id}/resourceGroups/{rg name}/providers/Microsoft.Compute/galleries/{gallery name}/images/{image def name}/versions/{version id}" \
    --node-agent-sku-id "{node-agent-sku-id}"
```

If you are creating large pools, consider the resize timeout. For pools with more than 300 nodes, increase the `resizeTimeout` property. A general rule is at least 15 minutes per 1,000 VMs. Also, for every pool with up to 300 instances, keep at least one replica of the Shared Image in the same region. For larger pools, keep more replicas to ensure fast provisioning [Use the Azure Compute Gallery to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-sig-images).

## Verification

Once the pool is created, verify that the nodes are running the expected software. Connect to a node via SSH or RDP and check the installed applications and data. If the nodes fail to start, check the node agent logs and ensure the image version and node agent SKU match. If you encounter allocation failures, confirm that the Shared Image version still exists and is accessible.

References for Prepare a repeatable HPC compute image: [Use a managed image to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-custom-images), [Use the Azure Compute Gallery to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-sig-images).
