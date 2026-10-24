---
title: "Understand Cluster Shared Volumes in a Hyper-V design"
description: "Configure CSV BitLocker for Windows Server 2025, distinguishing between AD DS and workgroup unlock methods."
pubDate: 2025-03-12
category: backup-dr
tags: ["csv", "bitlocker", "failover-clustering", "hyper-v", "windows-server-2025"]
translationKey: understand-cluster-shared-volumes-in-a-hyper-v-design
draft: true
---

You are designing a Hyper-V failover cluster on Windows Server 2025 and need to encrypt the storage. The immediate technical constraint is not whether to use BitLocker, but how to configure the unlock mechanism so the cluster service can access the volumes automatically when a node starts or when a role fails over.

Cluster Shared Volumes (CSV) allow multiple nodes to read and write to the same disk simultaneously. This architecture relies on a coordinator node for metadata and I/O redirection. When you add BitLocker encryption, the cluster service must be able to unlock the volume without user intervention. The method you choose depends entirely on whether your cluster is joined to an Active Directory Domain Services (AD DS) environment or is a standalone workgroup cluster.

[![CSV BitLocker Unlock Flow](/images/posts/2025/azc-156-checkpoints.svg)](/images/posts/2025/azc-156-checkpoints.svg)

## Understand the CSV architecture and encryption requirements

CSV is a clustered file system layered above NTFS or ReFS. It simplifies management by presenting shared storage as a single namespace (`\\ClusterStorage\VolumeN`) to all nodes. However, this shared access creates a specific challenge for encryption: the volume must be unlocked on every node that needs to access it, but the unlock mechanism must be consistent.

In Windows Server 2025, CSV supports both NTFS and ReFS. If you use ReFS on a SAN, note that CSV will operate in redirected mode, meaning write access is sent to the coordinator node. This is a design limitation for SAN-attached ReFS volumes, not a general CSV restriction. To leverage Direct I/O performance on SAN-attached disks, format drives with NTFS. ReFS on SANs operates in redirected mode by design, which impacts performance.

BitLocker integrates with the Failover Clustering service. The cluster service "views" the volume as a physical disk resource. You cannot use the standard BitLocker Control Panel applet for CSV volumes because they are mount points without drive letters. You must use PowerShell or the `Manage-BDE` command-line interface.

## Choose the correct protector for your environment

The choice of BitLocker protector determines how the cluster unlocks the volume. There are two distinct paths: AD DS-based unlocking for domain-joined clusters, and local cluster database unlocking for workgroup or AD-less clusters.

### Domain-joined clusters (AD DS)

If your cluster is joined to AD DS, the recommended protector is the `ADAccountOrGroup` protector. This is a SID-based protector bound to the Cluster Name Object (CNO) or a specific domain group.

The cluster service uses the CNO account to unlock the volume. This is secure because the protector is stored in Active Directory and protected by the CNO password. Every node in the cluster has access to the CNO account, so any node can unlock the volume.

However, this method has dependencies. If the Active Directory controller is unresponsive or slow, volume unlock during failover may time out. If the AD controller is completely unavailable, the online process for the drive will fail. You must ensure that your AD infrastructure is robust enough to support this dependency.

### Workgroup or AD-less clusters

If your cluster is not joined to AD DS, or if you want to avoid AD dependencies for volume unlocking, you must use the new functionality introduced in later Windows Server versions. The Failover Clustering service generates and maintains its own BitLocker Key protector.

This key is encrypted and saved in the local cluster database. The cluster database is a replicated store backed by the system volume on every cluster node. This means the system volume on every node should be BitLocker protected as well. If the system drive is not BitLocker-protected, the cluster flags a warning event during the online and unlock process. In an AD-less setup, if the system volume is not encrypted, the cluster validation logs a specific message indicating the risk.

This method is more resilient to AD outages because the unlock key is stored locally in the replicated cluster database. However, it requires that all nodes have their system volumes encrypted.

## Provision BitLocker on CSV volumes

Regardless of the protector you choose, you must provision BitLocker using PowerShell. You cannot use the GUI. The process involves putting the volume into maintenance mode, enabling encryption, and then configuring the cluster to use the correct protector.

### Prerequisites

1.  **BitLocker Feature Installed**: Ensure the `BitLocker Drive Encryption` feature is installed on all cluster nodes. You can install it using:
    ```powershell
    Install-WindowsFeature -ComputerName "Node1","Node2" -Name "BitLocker" -IncludeAllSubFeature -IncludeManagementTools
    ```
    A restart is required after installation.

2.  **Administrative Privileges**: You must run PowerShell commands with administrative privileges on the node where the CSV is currently hosted.

3.  **Storage Vendor Recommendations**: Always consult your storage vendor for specific configuration recommendations. If their guidance conflicts with general Microsoft documentation, follow the vendor's advice.

### Step-by-step provisioning (Workgroup/Local Database Protector)

This example demonstrates provisioning a CSV with a local recovery key protector, which is stored in the cluster database. This is suitable for workgroup clusters or when you prefer to avoid AD dependencies for unlock.

1.  **Move the CSV to the target node**:
    Identify the node where you want to enable encryption and move the CSV to it.
    ```powershell
    Get-ClusterSharedVolume -Name "Cluster Disk 1" | Move-ClusterSharedVolume Resource -Node Node1
    ```

2.  **Put the volume into maintenance mode**:
    This stops all clustered roles using the volume and interrupts client access.
    ```powershell
    Get-ClusterSharedVolume -Name "Cluster Disk 1" | Suspend-ClusterResource
    ```
    Confirm the action when prompted.

3.  **Enable BitLocker with a recovery key protector**:
    Use the `Enable-BitLocker` cmdlet. Specify the mount point, which is typically `C:\ClusterStorage\VolumeN`.
    ```powershell
    Enable-BitLocker -MountPoint "C:\ClusterStorage\Volume1" -RecoveryPasswordProtector
    ```
    Save the numerical recovery password displayed in the output. You will need it in the next step.

4.  **Retrieve the protector information**:
    Get the Key Protector ID and the recovery password.
    ```powershell
    (Get-BitlockerVolume -MountPoint "C:\ClusterStorage\Volume1").KeyProtector
    ```
    Note the `KeyProtectorId` and `RecoveryPassword`.

5.  **Configure the cluster parameter**:
    Set the `BitLockerProtectorInfo` parameter on the CSV resource. The format is `{KeyProtectorId}:RecoveryPassword`.
    ```powershell
    Get-ClusterSharedVolume "Cluster Disk 1" | Set-ClusterParameter -Name BitLockerProtectorInfo -Value "{26935AC3-8B17-482D-BA3F-D373C7954D29}:271733-258533-688985-480293-713394-034012-061963-061963" -Create
    ```
    Verify the parameter was set correctly:
    ```powershell
    Get-ClusterSharedVolume "Cluster Disk 1" | Get-ClusterParameter BitLockerProtectorInfo
    ```

6.  **Resume the cluster resource**:
    Bring the volume out of maintenance mode.
    ```powershell
    Get-ClusterSharedVolume -Name "Cluster Disk 1" | Resume-ClusterResource
    ```
    If the resource fails to come online, check the `BitLockerProtectorInfo` key for accuracy. If it is correct, investigate storage connectivity or AD availability (if using AD protector).

### Step-by-step provisioning (AD DS Protector)

If you are using an AD DS protector, the process is simpler because the cluster service can automatically bind to the CNO. You still need to put the volume in maintenance mode and enable BitLocker, but you do not need to manually set the `BitLockerProtectorInfo` parameter with a recovery key. Instead, you add the `ADAccountOrGroup` protector.

1.  **Move and Suspend**:
    Move the CSV to the target node and suspend the resource as shown above.

2.  **Enable BitLocker with AD protector**:
    ```powershell
    Enable-BitLocker -MountPoint "C:\ClusterStorage\Volume1" -ADAccountOrGroupProtector -AccountIdentifier "DOMAIN\CNO$"
    ```
    Replace `DOMAIN\CNO$` with your actual Cluster Name Object account.

3.  **Resume the resource**:
    ```powershell
    Get-ClusterSharedVolume -Name "Cluster Disk 1" | Resume-ClusterResource
    ```
    The cluster service will automatically handle the protector binding and unlocking.

## Verify the configuration

After provisioning, verify that the CSV is online and accessible from all nodes. Use `Get-ClusterSharedVolumeState` to check the I/O mode. If the volume is in redirected mode, it may indicate a storage connectivity issue or a protector mismatch.

```powershell
Get-ClusterSharedVolumeState -Name "Cluster Disk 1"
```

Check the event logs on all nodes for any BitLocker or Failover Clustering errors. If you are using the local database protector, ensure that the system volumes on all nodes are BitLocker-protected to avoid validation warnings.

## Cleanup and considerations

If you need to remove BitLocker encryption, reverse the process. Put the volume in maintenance mode, disable BitLocker, and remove the cluster parameter. Be aware that disabling BitLocker does not automatically remove the protector from the cluster database. You may need to manually clear the `BitLockerProtectorInfo` parameter.

Always test your failover scenarios after enabling BitLocker. Verify that the cluster can successfully fail over roles to nodes that have not previously hosted the CSV. This ensures that the unlock mechanism is working correctly across all nodes.

For more details on CSV architecture and I/O redirection, refer to the [Use Cluster Shared Volumes in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/failover-cluster-csvs) documentation. For specific BitLocker configuration steps, see [Use BitLocker with Cluster Shared Volumes](https://learn.microsoft.com/en-us/windows-server/failover-clustering/bitlocker-on-csv-in-ws-2022).
