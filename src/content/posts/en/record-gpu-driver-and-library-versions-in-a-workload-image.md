---
title: "Record GPU driver and library versions in a workload image"
description: "Record GPU driver and library versions in a Batch custom image using Azure Compute Gallery and snapshot-based provisioning."
pubDate: 2025-05-31
category: compute
tags: []
translationKey: record-gpu-driver-and-library-versions-in-a-workload-image
draft: false
---

You are building an Azure Batch pool for GPU workloads. The first thing to verify is not the pool size, but the consistency of the software stack on each compute node. If the driver version drifts between nodes, your jobs will fail or behave unpredictably. The solution is to bake the exact driver and library versions into a custom image before the nodes are provisioned.

Azure Batch supports creating pools from custom images. The recommended path is using an Azure Compute Gallery (ACG) Shared Image. This approach ensures that every node starts with the same operating system, drivers, and application binaries, reducing the variability introduced by post-provisioning scripts. Direct managed image support is being retired, so new deployments should use the Gallery.

## Prepare a base VM with the required GPU software

Start with a supported Azure Marketplace image. Azure Batch requires that the base image for a custom image pool is a first-party Azure Marketplace image. Third-party images with additional license and purchase terms cannot be used as a base for direct managed images, and while Azure Compute Gallery offers more flexibility, you must ensure the gallery image has identical purchase plan information if the base image has one. To verify the list of supported images, use the Azure CLI command `az batch pool supported-images` or the Batch REST API.

Create a VM using a size that supports GPUs, such as a `Standard_NC` or `Standard_ND` series. Ensure the VM uses managed disks and the default temp drive. Do not install Azure extensions like the Custom Script extension on this VM, as pre-installed extensions can cause deployment problems when the Batch node agent runs.

Connect to the VM via SSH (Linux) or RDP (Windows). Install the NVIDIA GPU driver and any CUDA libraries or application binaries required by your workload. To record the versions, run specific commands. For example, on Linux, you might use:

```bash
nvidia-smi --query-gpu=driver_version,cuda_version --format=csv
```

Document the output. This output is the evidence that your image contains the correct software stack. If your workload requires specific library paths, ensure they are set in the environment variables or configuration files on the VM.

## Create a snapshot and a managed image

Once the software is installed and verified, generalize the VM. Generalization removes unique system information, allowing the image to be used for multiple VMs. Follow the OS documentation for generalization, such as `waagent -deprovision+user` for Linux or `sysprep` for Windows.

Create a snapshot of the OS disk. A snapshot is a full, read-only copy of the VHD. You can use the Azure CLI command `az snapshot create` or the portal. It is critical to use the snapshot method rather than capturing the image directly from the running VM, as this ensures data consistency. For large pools, creating the managed image from a snapshot is the recommended approach to scale Batch pools reliably.

Create a managed image from the snapshot using `az image create`. This managed image resource must exist in the same subscription and region as your Batch account. The resource ID will be needed in the next step.

## Publish the image to an Azure Compute Gallery

Azure Batch pools using custom images are best managed through Azure Compute Gallery Shared Images. This allows for versioning and cross-region replication, which is beneficial for large pools.

Create an Azure Compute Gallery. Then, create an image definition and an image version from your managed image. The image version captures the specific state of your GPU drivers and libraries. You can use the Azure CLI to create the gallery and image:

```bash
# Create a gallery
az sig create \
    --gallery-name myGallery \
    --resource-group myResourceGroup \
    --location eastus

# Create an image definition
az sig image-definition create \
    --gallery-name myGallery \
    --gallery-image-definition myGPUImage \
    --resource-group myResourceGroup \
    --os-type Linux \
    --publisher myPublisher \
    --offer myOffer \
    --sku mySKU

# Create an image version from the managed image
az sig image-version create \
    --gallery-name myGallery \
    --gallery-image-definition myGPUImage \
    --resource-group myResourceGroup \
    --location eastus \
    --managed-image /subscriptions/{sub-id}/resourceGroups/{rg-name}/providers/Microsoft.Compute/images/myImage \
    --version 1.0.0
```

This code is an illustrative example. Ensure you replace the placeholders with your actual subscription ID, resource group, and image details. The `--managed-image` parameter points to the managed image you created from the snapshot. Replicas are managed separately to support large-scale provisioning.

## Create the Batch pool using the Shared Image

Now you can create a Batch pool using the Shared Image. You need the resource ID of the image version. The format is:

`/subscriptions/{sub-id}/resourceGroups/{rg-name}/providers/Microsoft.Compute/galleries/{gallery-name}/images/{image-definition-name}/versions/{version-id}`

Use the Azure CLI to create the pool:

```bash
az batch pool create \
    --id myGPUPool \
    --vm-size Standard_NC6 \
    --target-dedicated-nodes 2 \
    --image /subscriptions/{sub-id}/resourceGroups/{rg-name}/providers/Microsoft.Compute/galleries/myGallery/images/myGPUImage/versions/1.0.0 \
    --node-agent-sku-id {node-agent-sku-id}
```

The `--node-agent-sku-id` must match the OS type and version of your image. Use the `az batch pool supported-images` command to retrieve the valid SKU IDs for your chosen OS. If the SKU does not match the image, the nodes will fail to start.

## Verify the installation

Once the pool is running, connect to one of the compute nodes. Verify that the GPU driver and CUDA libraries are present and match the versions you recorded earlier. You can use the same commands you used during the VM preparation phase.

If the versions do not match, it indicates that the image was not created correctly or the wrong image version was referenced. Check the image version in the Azure Compute Gallery and ensure the pool is referencing the correct version ID.

By baking the GPU driver and library versions into the custom image, you ensure that all nodes in your Batch pool have a consistent software environment. This reduces debugging time and improves the reliability of your GPU workloads. The key is to use a snapshot-based approach and publish the image to an Azure Compute Gallery for version control and scalability.

If you encounter allocation failures, check that the image version still exists and that the Batch account has the necessary permissions to access the Azure Compute Gallery. The image version itself must persist for the lifetime of the pool.

tags: [azure-batch, gpu, custom-images, azure-compute-gallery, devops]
diagram: {title: GPU Image Provisioning Flow, nodes: [{name: Base VM}, {name: Snapshot}, {name: Managed Image}, {name: Azure Compute Gallery}, {name: Batch Pool}]}
claims: [{claim: 

References for Record GPU driver and library versions in a workload image: [Use a managed image to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-custom-images), [Use the Azure Compute Gallery to create a custom image pool](https://learn.microsoft.com/en-us/azure/batch/batch-sig-images).
