---
title: "Separate compute image versions from application releases"
description: "Decouple application updates from VM image maintenance using Azure Compute Gallery VM Applications."
pubDate: 2026-04-19
category: compute
tags: ["azure-compute-gallery", "vm-applications", "infrastructure-as-code", "virtual-machines", "application-deployment"]
translationKey: separate-compute-image-versions-from-application-releases
draft: false
---

You are managing a fleet of virtual machines and find yourself rebuilding images every time a minor application patch is released. This approach ties your infrastructure baseline to your application release cycle, creating unnecessary operational overhead and increasing the risk of configuration drift. The solution is to separate the compute image from the application layer using Azure Compute Gallery VM Applications.

Azure Compute Gallery provides a dedicated resource type for this purpose. While image definitions and versions capture the operating system state, VM Applications allow you to package and distribute application installers or scripts independently. This means you can publish a new application version without touching the underlying image definition, and your virtual machines can pull the latest application configuration at deployment time or during a managed update.

## Understand the resource model

An Azure Compute Gallery organises resources into three main types: the gallery itself, image definitions, and image versions. Image versions are snapshots used to create virtual machine disks. They are static; once created, they do not change. If your application logic changes, you traditionally had to create a new image version, replicate it to target regions, and then update your scale sets or deployment scripts to point to the new version. This process is slow and consumes significant storage and network resources.

VM Applications solve this by decoupling the application payload from the OS image. A VM Application is a resource within the gallery that contains application metadata and distribution information. It does not contain the OS disk. Instead, it points to application artifacts, such as installers stored in a storage account or scripts stored in a repository. When you deploy a virtual machine, you reference both the image version for the OS and the VM Application for the application layer. The application is installed during the VM creation process or via a custom script extension triggered by the application definition.

This separation allows you to update the application definition independently. You can publish a new version of the VM Application, and any new virtual machines deployed will use the latest application payload. Existing virtual machines can be updated by re-running the application installation logic, which can be automated through Azure Automation or configuration management tools.

## Create a VM Application definition

To start, you need an Azure Compute Gallery. If you do not have one, create it in a resource group. Ensure you have the necessary permissions to create resources in that group.

1.  **Prepare the application artifacts**: Upload your application installer or script to a secure location, such as an Azure Storage account with private access. You will need the URI for this artifact.
2.  **Create the VM Application definition**: Use the Azure CLI or portal to create a VM Application definition within your gallery. This definition acts as a container for your application versions.

    Using the Azure CLI, the command is:

    ```azurecli-interactive
    az sig vm-app-definition create \
      --resource-group myGalleryRG \
      --gallery-name myGallery \
      --gallery-vm-app-definition myAppDefinition \
      --publisher myPublisher \
      --offer myOffer \
      --sku mySKU \
      --os-type Linux
    ```

    Replace `myPublisher`, `myOffer`, and `mySKU` with identifiers that make sense for your application. These fields help you organise and identify applications within the gallery.

3.  **Create a VM Application version**: This is where you specify the actual application payload. You create a version within the definition, pointing to your artifact.

    ```azurecli-interactive
    az sig vm-app-version create \
      --resource-group myGalleryRG \
      --gallery-name myGallery \
      --gallery-vm-app-definition myAppDefinition \
      --gallery-vm-app-version 1.0.0 \
      --target-regions "westeurope" \
      --replica-count 1 \
      --artifact-url "https://mystorageaccount.blob.core.windows.net/apps/myapp-installer.sh" \
      --artifact-name "myapp-installer.sh"
    ```

    The `--target-regions` parameter specifies where the application artifact should be replicated. Replication ensures that the artifact is available in the same region as your virtual machines, reducing latency and egress costs. The `--replica-count` parameter controls how many copies of the artifact are kept in each region for high availability and faster distribution.

## Deploy virtual machines with the application

When you create a virtual machine or a scale set, you reference both the image version and the VM Application. The deployment process will use the image version for the OS disk and trigger the application installation based on the VM Application definition.

In a scale set definition, you can specify the VM Application in the `osProfile` or via a custom script extension that reads the application metadata from the gallery. The exact mechanism depends on your configuration management strategy. However, the key point is that the application version is not baked into the image. It is referenced at deployment time.

For example, if you are using Azure VM Image Builder to create custom images, you can include steps to install applications from a VM Application. This allows you to build an image that is pre-configured with the latest application version, but you can still update the application independently for new deployments.

## Update applications without rebuilding images

The primary benefit of this approach is the ability to update applications without creating new image versions. When you have a new application release:

1.  **Create a new VM Application version**: Point the new version to the updated artifact. Replicate it to the target regions.
2.  **Update deployment scripts**: If your deployment process hardcodes the application version, update the script to reference the new version. If you use the `latest` alias, ensure it is updated to point to the new version.
3.  **Deploy new virtual machines**: New virtual machines will automatically use the new application version.
4.  **Update existing virtual machines**: For existing virtual machines, you can use Azure Automation or a configuration management tool to re-run the application installation script. The script can check the VM Application definition for the latest version and install it if necessary.

This process is significantly faster than rebuilding and replicating image versions. It also reduces storage costs, as you are only storing the application artifacts, which are typically smaller than full OS images.

## Considerations and limitations

*   **Replication time**: Replicating application artifacts to multiple regions takes time. Plan your updates accordingly to ensure the artifact is available in all target regions before deploying new virtual machines.
*   **Security**: Ensure your application artifacts are stored securely. Use private storage accounts and signed URLs if necessary. The VM Application definition itself is not encrypted, so protect the metadata.
*   **Permissions**: Users deploying virtual machines need read access to both the image version and the VM Application version. Manage permissions carefully to control who can deploy which application versions.
*   **Compatibility**: Ensure the application is compatible with the operating system version in the image. The VM Application does not enforce OS compatibility; you must manage this separately.

By separating compute images from application releases, you gain agility and reduce operational complexity. You can update applications frequently without the overhead of image management, while still maintaining a consistent and reliable infrastructure baseline.

Verify your setup by deploying a test virtual machine and confirming that the application is installed correctly. Check the VM Application version in the gallery to ensure it points to the correct artifact. Once verified, you can proceed with production deployments.

tags: [azure-compute-gallery, vm-applications, infrastructure-as-code, virtual-machines, application-deployment]
diagram: {title: 

References for Separate compute image versions from application releases: [Overview of Azure Compute Gallery](https://learn.microsoft.com/en-us/azure/virtual-machines/azure-compute-gallery), [Create an image definition and image version](https://learn.microsoft.com/en-us/azure/virtual-machines/image-version), [Create a new VM image version from an existing image version by using Azure VM Image Builder in Linux](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-gallery-update-image-version).}
