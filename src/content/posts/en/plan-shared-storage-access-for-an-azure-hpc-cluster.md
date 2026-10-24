---
title: "Plan shared storage access for an Azure HPC cluster"
description: "Mount Azure Files on Azure Batch pools using PowerShell, covering prerequisites, configuration, and troubleshooting steps."
pubDate: 2024-10-14
category: compute
tags: ["azure-batch", "azure-files", "virtual-file-mount", "powershell", "hpc"]
translationKey: plan-shared-storage-access-for-an-azure-hpc-cluster
draft: true
---

You need shared storage for an Azure Batch pool, but you want tasks to access it as a local drive rather than fetching files individually. Azure Files provides a fully managed SMB share that can be mounted on both Windows and Linux compute nodes. This approach simplifies data access for parallel tasks, provided you account for the performance characteristics of the underlying service.

Azure Files is cost-efficient and supports data replication to another region for global redundancy. However, it is not a universal solution for every workload. The planning guidance for Azure Batch advises using Azure Files when you have pools that run a relatively low number of parallel tasks if using non-premium Azure Files. For larger scale or higher performance requirements, you should review the [Azure Files scale targets](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets) to determine if the service meets your IOPS and throughput needs. If your workload involves thousands of concurrent nodes accessing large assets, other options like Avere vFXT or BlobFuse might be more appropriate.

[![Azure Batch Pool Mount Flow](/images/posts/2024/azc-103-checkpoints.svg)](/images/posts/2024/azc-103-checkpoints.svg)

## Prerequisites and networking

Before configuring the mount, ensure your environment meets the basic requirements. You need an Azure account with an active subscription, Azure PowerShell installed, and an existing Batch account linked to an Azure Storage account that contains a file share. Note that mounting a virtual file system is not supported on Batch pools created before August 8, 2019.

Networking is critical for Azure Files. The compute nodes must have access to the storage account over TCP port 445. If your Batch pool is deployed in a virtual network, you must ensure that no required traffic is blocked. Specifically, traffic to and from the `storage` service tag must be allowed on port 445. For Linux nodes, the Batch agent installs the `cifs-utils` package to support the SMB protocol, so the nodes must also have access to the appropriate package manager URLs to download this dependency.

## Mounting configuration

Azure Batch supports mounting up to 10 file systems per pool. The configuration is defined using a `MountConfiguration` object, which is assigned to the pool's `MountConfigurationList` property. This configuration is applied when a node joins the pool, restarts, or is reimaged.

The configuration requires the storage account name, the relative mount path (the location on the node where the share will appear), and the storage account key. The mount path is relative to the standard `\\fsmounts` directory. On Linux nodes, this base directory is accessible via the `AZ_BATCH_NODE_MOUNTS_DIR` environment variable. The Batch agent implements mounting differently on Windows and Linux: on Linux, it uses the `mount` command with `cifs-utils`; on Windows, it uses `cmdkey` to add credentials and then `net use` to mount the share.

### Windows pool example

For a Windows pool, the mount is typically presented as a drive letter. The following PowerShell script creates a pool with one Windows Server 2016 node and mounts an Azure file share to the S drive. This code is illustrative and assumes you have already created the storage account and file share.

```powershell
# Connect to your subscription
Connect-AzAccount -Subscription "ExamplesubscriptionID"

# Get the Batch account context
$context = Get-AzBatchAccount -AccountName "Examplebatchaccountname"

# Define the file share configuration
# Parameters: Storage Account Name, URL, Mount Path (Drive Letter), Storage Account Key
$fileShareConfig = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSAzureFileShareConfiguration" -ArgumentList @(
    "Examplestorageaccountname",
    "https://Examplestorageaccountname.file.core.windows.net/batchfileshare1",
    "S",
    "Examplestorageaccountkey"
)

# Create the mount configuration
$mountConfig = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSMountConfiguration" -ArgumentList @($fileShareConfig)

# Define the VM image and configuration
$imageReference = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSImageReference" -ArgumentList @("WindowsServer", "MicrosoftWindowsServer", "2016-Datacenter", "latest")
$configuration = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSVirtualMachineConfiguration" -ArgumentList @($imageReference, "batch.node.windows amd64")

# Create the pool with the mount configuration
New-AzBatchPool -Id "Examplepoolname" -VirtualMachineSize "STANDARD_D2_V2" -VirtualMachineConfiguration $configuration -TargetDedicatedComputeNodes 1 -MountConfiguration @($mountConfig) -BatchContext $context
```

Tasks can then access the mounted files using the drive path, for example `S:\folder1\out.txt`. Note that the Batch agent grants access only to Azure Batch tasks. If you connect to the node using Remote Desktop Protocol (RDP), your user account will not have automatic access to the S drive. You would need to manually add credentials using `cmdkey`.

### Linux pool example

For Linux nodes, the mount is available via the `AZ_BATCH_NODE_MOUNTS_DIR` environment variable. The following script creates a pool with one Ubuntu 20.04 node and mounts the share to the S directory within that path. The mount options specify SMB version 3.0 and set permissions to allow access.

```powershell
# Connect to your subscription
Connect-AzAccount -Subscription "ExamplesubscriptionID"

# Get the Batch account context
$context = Get-AzBatchAccount -AccountName "Examplebatchaccountname"

# Define the file share configuration
# Parameters: Storage Account Name, URL, Mount Path, Storage Account Key, Mount Options
$fileShareConfig = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSAzureFileShareConfiguration" -ArgumentList @(
    "Examplestorageaccountname",
    "https://Examplestorageaccountname.file.core.windows.net/Examplefilesharename",
    "S",
    "Examplestorageaccountkey",
    "-o vers=3.0,dir_mode=0777,file_mode=0777,sec=ntlmssp"
)

# Create the mount configuration
$mountConfig = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSMountConfiguration" -ArgumentList @($fileShareConfig)

# Define the VM image and configuration
$imageReference = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSImageReference" -ArgumentList @("0001-com-ubuntu-server-focal", "canonical", "20_04-lts", "latest")
$configuration = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSVirtualMachineConfiguration" -ArgumentList @($imageReference, "batch.node.ubuntu 20.04")

# Create the pool with the mount configuration
New-AzBatchPool -Id "Examplepoolname" -VirtualMachineSize "Standard_DS1_v2" -VirtualMachineConfiguration $configuration -TargetDedicatedComputeNodes 1 -MountConfiguration @($mountConfig) -BatchContext $context
```

Tasks can access the files using the environment variable, for example `/bin/bash -c 'more $AZ_BATCH_NODE_MOUNTS_DIR/S/folder1/out.txt'`. Alternatively, you can access the mount directly via the path `/mnt/batch/tasks/fsmounts/S` if you connect to the node via SSH.

## Troubleshooting mount failures

If a mount configuration fails, the compute node will enter an **Unusable** state. The first step in diagnosis is to inspect the `ComputeNodeError` property for details on the error. You can also upload the batch logs to your storage account to review the mount logs, which are located at the `AZ_BATCH_NODE_MOUNTS_DIR` location.

On Windows, the mount log file is named `fshare-<DriveLetter>.log` and is located in `D:\batch\tasks\fsmounts`. On Linux, it is located in `/mnt/batch/tasks/fsmounts`. Common errors include permission denied or incorrect network passwords. For example, a Windows error might indicate "System error 86 has occurred. The specified network password is not correct," which suggests the storage account key is invalid or expired.

If you cannot diagnose the issue remotely, you can manually mount the file share on the node. For Windows, use `net use` with the storage account credentials. For Linux, use the `mount` command with the appropriate options. This manual step can help isolate whether the issue is with the Batch agent's configuration or the underlying network/storage connectivity.

## Verification

To verify the mount, run a simple task that reads a file from the mounted share. Check the task's output files to ensure the data was read correctly. If the task fails, review the task's error logs and the node's mount logs for clues. For more details on mounting virtual file systems, see the [Mount a virtual file system on a pool](https://learn.microsoft.com/en-us/azure/batch/virtual-file-mount) documentation.
