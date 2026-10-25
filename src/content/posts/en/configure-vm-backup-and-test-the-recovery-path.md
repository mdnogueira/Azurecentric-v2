---
title: "Configure VM backup and test the recovery path"
description: "Configure VM restore points, copy them cross-region, and verify the recovery path using Azure CLI."
pubDate: 2025-07-23
category: compute
tags: ["azure-virtual-machines", "backup-and-recovery", "restore-points", "azure-cli", "disaster-recovery"]
translationKey: configure-vm-backup-and-test-the-recovery-path
draft: false
---

You have a virtual machine running in Azure and need to protect it against regional outages. The first step is not to configure a complex disaster recovery solution, but to ensure you can create a consistent snapshot of the VM and copy it to another region. VM restore points provide granular backup and retention policies, distinct from sitewide disaster recovery solutions that manage automated failovers across multiple regions [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points).

## Create a restore point collection and point

VM restore points are stored in a restore point collection, which is an Azure Resource Manager resource. You must create this collection in the same region as the VM before you can create any restore points [Creating Virtual Machine Restore Points using Azure CLI](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points-cli).

Start by creating the collection. You need Contributor or Owner permissions on the resource group containing the VM. The following command creates a collection named `ExampleRpc` in the `ExampleRg` resource group, referencing the VM by its resource ID [Creating Virtual Machine Restore Points using Azure CLI](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points-cli):

```bash
az restore-point collection create \
  --location "norwayeast" \
  --source-id "/subscriptions/{subscription-id}/resourceGroups/ExampleRg/providers/Microsoft.Compute/virtualMachines/ExampleVM" \
  --resource-group "ExampleRg" \
  --collection-name "ExampleRpc"
```

Once the collection exists, you can create a restore point. By default, Azure attempts to create an application-consistent restore point if the VM agent and extensions support it. For Windows VMs, this uses Volume Shadow Copy Service (VSS) writers. For Linux VMs, it uses pre- and post-scripts to achieve file system consistency [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points). If application consistency is not possible or required, you can explicitly request a crash-consistent restore point, which captures write-order-consistent snapshots similar to the state after a power outage [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points).

To create an application-consistent point:

```bash
az restore-point create \
  --resource-group "ExampleRg" \
  --collection-name "ExampleRpc" \
  --name "ExampleRp"
```

If you need a crash-consistent point, add the `--consistency-mode` parameter [Creating Virtual Machine Restore Points using Azure CLI](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points-cli):

```bash
az restore-point create \
  --resource-group "ExampleRg" \
  --collection-name "ExampleRpc" \
  --name "ExampleRpCrash" \
  --consistency-mode CrashConsistent
```

You can track the progress of the creation using `az restore-point show` [Creating Virtual Machine Restore Points using Azure CLI](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points-cli). Note that concurrent creation of restore points for the same VM is not supported, and you are limited to three application-consistent and three crash-consistent creations per hour per VM [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points).

## Copy the restore point to another region

To protect against a regional failure, copy the restore point to a target region. This feature is in public preview as of the source documentation date [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points). You must first create a restore point collection in the target region that references the source collection [Copy VM restore points to another region](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-copy-restore-points-how-to).

Create the target collection in, for example, `swedencentral`:

```bash
az restore-point collection create \
  --location "swedencentral" \
  --source-id "/subscriptions/{subscription-id}/resourceGroups/ExampleRg/providers/Microsoft.Compute/restorePointCollections/ExampleRpc" \
  --resource-group "ExampleRg" \
  --collection-name "ExampleRpcTarget"
```

Then, trigger the copy of the restore point by referencing the source restore point in the request body [Copy VM restore points to another region](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-copy-restore-points-how-to). This is a long-running operation. The API returns a `201` status code and provides headers for polling the status [Copy VM restore points to another region](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-copy-restore-points-how-to).

Using the Azure CLI, you can initiate the copy by creating a new restore point in the target collection with the `sourceRestorePoint` property [Copy VM restore points to another region](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-copy-restore-points-how-to). However, the CLI documentation does not explicitly show the `sourceRestorePoint` parameter in the `az restore-point create` command, so you may need to use the REST API or PowerShell for this specific step [S2, S3]. The REST API request body should look like this [Copy VM restore points to another region](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-copy-restore-points-how-to):

```json
{
    "name": "ExampleRpTarget",
    "properties": {
        "sourceRestorePoint": {
            "id": "/subscriptions/{subid}/resourceGroups/ExampleRg/providers/microsoft.compute/restorePointCollections/ExampleRpc/restorePoints/ExampleRp"
        }
    }
}
```

To verify the copy status, you can check the instance view of the target restore point. The `provisioningState` will be `Succeeded` when the data copy is complete, and the `instanceView` will show `ReplicationState/succeeded` for each disk restore point [Copy VM restore points to another region](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-copy-restore-points-how-to).

## Verify the recovery path

Creating a restore point and copying it is only half the equation. You must verify that you can actually restore the VM. The recovery path involves restoring individual disks from the disk restore points and then creating a new VM with those disks [Creating Virtual Machine Restore Points using Azure CLI](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points-cli).

First, retrieve the disk restore point IDs from the source restore point [Creating Virtual Machine Restore Points using Azure CLI](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points-cli):

```bash
osDiskRestorePoint=$(az restore-point show --resource-group "ExampleRg" --collection-name "ExampleRpc" --name "ExampleRp" --query "sourceMetadata.storageProfile.osDisk.diskRestorePoint.id" -o tsv)
dataDiskRestorePoint=$(az restore-point show --resource-group "ExampleRg" --collection-name "ExampleRpc" --name "ExampleRp" --query "sourceMetadata.storageProfile.dataDisks[0].diskRestorePoint.id" -o tsv)
```

Next, create new disks from these restore points [Creating Virtual Machine Restore Points using Azure CLI](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points-cli):

```bash
az disk create --resource-group "ExampleRg" --name "ExampleOSDisk" --sku Premium_LRS --size-gb 128 --source $osDiskRestorePoint
az disk create --resource-group "ExampleRg" --name "ExampleDataDisk1" --sku Premium_LRS --size-gb 128 --source $dataDiskRestorePoint
```

Finally, create a new VM and attach these disks [Creating Virtual Machine Restore Points using Azure CLI](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points-cli). This step confirms that the restore points are valid and usable. If the disk creation fails, the restore point may be corrupted or the source VM may have been moved, which is not supported when restore points exist [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points).

## Limitations and considerations

VM restore points are incremental, meaning only changes are stored after the first full copy, which helps reduce costs [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points). However, there are several limitations to be aware of [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points):

- Restore points are supported only for managed disks.
- Ultra disks, Premium SSD v2 disks, Write-accelerated disks, Ephemeral OS disks, and shared disks are not supported for crash consistency mode. Ephemeral OS disks and shared disks are not supported for application consistency mode.
- A maximum of 500 VM restore points can be retained for a VM at any time.
- Cross-region copying does not support private links, and customer-managed key encrypted restore points are converted to platform-managed key encrypted when copied [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points).
- You cannot create a single restore point across multiple VMs, such as those in a Uniform orchestration virtual machine scale set [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points).

When testing the recovery path, ensure that the target region has the necessary capacity and that the VM size is available. Also, remember that moving a VM between resource groups or subscriptions after creating restore points is not supported, as it breaks the reference between the VM and its restore points [Use virtual machine restore points](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machines-create-restore-points).
