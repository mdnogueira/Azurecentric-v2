---
title: "Plan data movement before moving an HPC workload to Azure"
description: "Plan data movement for HPC workloads by choosing the right storage mount strategy for Azure Batch pools."
pubDate: 2025-09-17
category: compute
tags: ["azure-batch", "hpc", "data-movement", "azure-files", "blobfuse", "storage"]
translationKey: plan-data-movement-before-moving-an-hpc-workload-to-azure
draft: false
---

You are moving a high-performance computing workload to Azure Batch, and the bottleneck is not the compute nodes—it is the data. The first decision you must make is how the rendering or simulation tasks access their input assets and where they write their outputs. This choice dictates your pool configuration, your networking requirements, and your cost structure.

The core question is not which storage service is "best," but which access pattern matches your workload. If your tasks need to read a large, shared set of scene files concurrently, copying those files to every node's local disk for each job is inefficient. If your tasks generate massive output files that need to be preserved, relying solely on local node storage risks data loss if a node is reimaged. You need a strategy that aligns data movement with the lifecycle of your Batch jobs.

## Choose the storage type based on access patterns

Azure Batch supports mounting virtual file systems on compute nodes, allowing you to treat cloud storage as a local drive. The documentation outlines three primary approaches, each with distinct trade-offs regarding performance, scale, and complexity.

### Azure Blob Storage with Blobfuse (Linux only)

For Linux pools, Blobfuse allows you to mount an Azure Blob container as a file system. This is a cost-effective option because it avoids the need for dedicated file server VMs. Blobfuse caches files on the node's local disk, which significantly improves performance if multiple tasks on the same node access the same files.

This approach is suitable when:
*   You are running Linux-based rendering or simulation tasks.
*   You want to avoid the overhead of managing a separate file server.
*   Your workload benefits from caching repeated reads of large asset files.

However, Blobfuse is not available for Windows pools. If your HPC application requires Windows, you must look at other options.

### Azure Files (Windows and Linux)

Azure Files provides fully managed file shares accessible via the SMB protocol. It works on both Windows and Linux pools, making it a versatile choice for mixed environments. Azure Files is cost-efficient and can be configured for geo-redundancy.

This approach is suitable when:
*   You need a shared file system accessible from both Windows and Linux nodes.
*   Your workload involves a relatively low number of parallel tasks, as you must review the [performance and scale targets](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets) to ensure Azure Files can handle your concurrency.
*   You want to use standard SMB tools and protocols for file access.

Azure file shares are mounted at the pool level. When a compute node joins the pool, the virtual file system mounts and acts as a local drive on that node. This means the mount persists across tasks on the same node, rather than requiring a new mount operation for every task. You can use `cmdkey` to persist credentials in the pool's start task, simplifying the mount process for subsequent tasks.

### Azure Blob Storage (Direct Copy)

For smaller projects or when assets are unique to each job, you can copy files directly from Blob Storage to the pool VMs using tools like `azcopy`. This is the simplest approach but can become inefficient if you have many large asset files that are reused across multiple jobs.

## Plan the data movement workflow

Once you have selected your storage type, you need to define how data moves into and out of the pool.

### Input Data

If you choose Blobfuse or Azure Files, the data is accessed directly from the mounted file system. Tasks specify paths to input files using the mounted drive letter (Windows) or mount directory (Linux). This eliminates the need for explicit copy steps within each task, reducing task startup time.

If you choose direct Blob Storage access, you must copy files to the node before the task runs. You can use a **job preparation task** to copy all required assets to the node's shared folder (`AZ_BATCH_NODE_SHARED_DIR`). To avoid redundant copies, use the `/XO` parameter with `azcopy` to copy only modified files. Be mindful of the node's temporary drive size; if your assets are large, they may not fit on the local disk.

### Output Data

Output files must be copied off the node before it is reused or deleted. You can use **output files** in the task definition to automatically copy rendered outputs to Blob Storage or Azure Files once the task completes. This ensures that your results are preserved even if the node is reimaged.

## Configure the pool with virtual file mounts

Azure Batch supports mounting up to 10 file systems per pool. You configure this using the `MountConfigurationList` property when creating the pool. The Batch agent handles the mounting process when a node joins the pool, restarts, or is reimaged.

### Prerequisites

*   An Azure subscription with a Batch account.
*   A linked Azure Storage account with a file share or blob container.
*   Appropriate network access: TCP port 445 for Azure Files, TCP port 443 for Blob Storage (Blobfuse), and port 2049 for NFS.

### Example: Mounting an Azure Files share on a Windows pool

The following PowerShell script creates a Windows pool and mounts an Azure Files share to the S: drive. This is an illustrative example based on the [Azure Batch documentation](https://learn.microsoft.com/en-us/azure/batch/virtual-file-mount).

```powershell
# Connect to your Azure subscription
Connect-AzAccount -Subscription "ExamplesubscriptionID"

# Get the Batch account context
$context = Get-AzBatchAccount -AccountName "Examplebatchaccountname"

# Define the file share configuration
$fileShareConfig = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSAzureFileShareConfiguration" -ArgumentList @(
    "Examplestorageaccountname",
    "https://Examplestorageaccountname.file.core.windows.net/Examplefilesharename",
    "S",
    "Examplestorageaccountkey"
)

# Define the mount configuration
$mountConfig = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSMountConfiguration" -ArgumentList @($fileShareConfig)

# Define the VM configuration
$imageReference = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSImageReference" -ArgumentList @("WindowsServer", "MicrosoftWindowsServer", "2016-Datacenter", "latest")
$configuration = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSVirtualMachineConfiguration" -ArgumentList @($imageReference, "batch.node.windows amd64")

# Create the pool with the mount configuration
New-AzBatchPool -Id "Examplepoolname" -VirtualMachineSize "STANDARD_D2_V2" -VirtualMachineConfiguration $configuration -TargetDedicatedComputeNodes 1 -MountConfiguration @($mountConfig) -BatchContext $context
```

### Example: Mounting an Azure Files share on a Linux pool

The following PowerShell script creates a Linux pool and mounts an Azure Files share to a directory path. Note that Linux mounts use directory paths rather than drive letters.

```powershell
# Connect to your Azure subscription
Connect-AzAccount -Subscription "ExamplesubscriptionID"

# Get the Batch account context
$context = Get-AzBatchAccount -AccountName "Examplebatchaccountname"

# Define the file share configuration
$fileShareConfig = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSAzureFileShareConfiguration" -ArgumentList @(
    "Examplestorageaccountname",
    "https://Examplestorageaccountname.file.core.windows.net/Examplefilesharename",
    "S",
    "Examplestorageaccountkey",
    "-o vers=3.0,dir_mode=0777,file_mode=0777,sec=ntlmssp"
)

# Define the mount configuration
$mountConfig = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSMountConfiguration" -ArgumentList @($fileShareConfig)

# Define the VM configuration
$imageReference = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSImageReference" -ArgumentList @("0001-com-ubuntu-server-focal", "canonical", "20_04-lts", "latest")
$configuration = New-Object -TypeName "Microsoft.Azure.Commands.Batch.Models.PSVirtualMachineConfiguration" -ArgumentList @($imageReference, "batch.node.ubuntu 20.04")

# Create the pool with the mount configuration
New-AzBatchPool -Id "Examplepoolname" -VirtualMachineSize "Standard_DS1_v2" -VirtualMachineConfiguration $configuration -TargetDedicatedComputeNodes 1 -MountConfiguration @($mountConfig) -BatchContext $context
```

### Verification

After the pool is created, verify that the file share is mounted correctly. You can connect to a node via RDP (Windows) or SSH (Linux) and check the mount.

For Windows, you can check the S: drive:

```powershell
cmd /c "more S:\folder1\out.txt & timeout /t 90 > NULL"
```

For Linux, you can access the mounted files using the environment variable `AZ_BATCH_NODE_MOUNTS_DIR`:

```bash
/bin/bash -c 'more $AZ_BATCH_NODE_MOUNTS_DIR/S/folder1/out.txt; sleep 20s'
```

If the mount fails, the node will enter an **Unusable** state. Check the node's log files, located at `D:\batch\tasks\fsmounts\fshare-S.log` for Windows or `/mnt/batch/tasks/fsmounts/fshare-S.log` for Linux, to diagnose the issue. Common errors include incorrect credentials or network connectivity issues.

## Next steps

Before deploying your HPC workload, review the [performance and scale targets](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets) for Azure Files to ensure your chosen storage solution can handle your concurrency. If you are using Blobfuse, ensure your Linux nodes have sufficient local disk space for caching. Finally, test your data movement workflow with a small subset of your assets to validate performance and reliability before scaling up.
