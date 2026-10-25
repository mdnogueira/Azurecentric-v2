---
title: "Configure and verify a cluster witness"
description: "Configure a file share witness for Windows Server failover clustering using PowerShell, with verification steps."
pubDate: 2024-09-18
category: backup-dr
tags: ["failover-clustering", "quorum", "file-share-witness", "windows-server", "powershell"]
translationKey: configure-and-verify-a-cluster-witness
draft: false
---

When a cluster has an even number of voting nodes, quorum is at risk. If half the nodes go down or lose network connectivity, the cluster cannot determine a majority and stops. Adding a witness vote breaks the tie. A file share witness is a practical option when a disk witness is unavailable, such as in Storage Spaces Direct or Always On Availability Groups, or when a cloud witness is not viable due to unreliable internet connectivity.

This guide covers configuring a file share witness on a non-domain joined device using PowerShell. While the graphical wizard in Failover Cluster Manager is the standard approach for domain-joined environments, the documentation specifies PowerShell for non-domain joined scenarios, where local account credentials are required.

## Prerequisites and constraints

Before configuring the witness, ensure the following conditions are met:

- The Failover Cluster is installed and running.
- You have **Full Control** permissions on the Failover Cluster.
- The device hosting the file share is physically separate from the cluster nodes or sites to avoid a single point of failure in network, power, or rack infrastructure.
- The device has a minimum of 5 MB of free space.
- The device hosts an SMB 2 or later file share.

If the device is non-domain joined, you must create a local account on the witness device for the cluster to authenticate. Store these credentials securely, as they will be required during configuration.

> [!WARNING]
> Do not use Distributed File System (DFS) or replicated storage for the witness. These technologies can cause partition-in-space or partition-in-time scenarios, where cluster nodes run independently, leading to potential data loss.

## Configure the file share

The file share must be dedicated to the single cluster and not used for user or application data. A single file server can host multiple file shares for multiple clusters, but each share must be exclusive to one cluster.

For a non-domain joined device, configure the share as follows:

1. Create a local account on the witness device for the cluster to use.
2. Create an SMB file share using SMB 2 or later.
3. Update share permissions to remove all users and groups except the new local account. Grant the local account **Change** and **Read** permissions.
4. Modify file system permissions to grant the local account **Modify**, **Read & execute**, **List folder contents**, and **Read** permissions. Write access is required.

## Configure the cluster quorum

Source documentation specifies PowerShell for non-domain joined scenarios. Use the `Set-ClusterQuorum` cmdlet to configure the witness, providing the local account credentials via the `-Credential` parameter.

Run the following command on a computer with Failover Cluster Management Tools installed:

```powershell
Set-ClusterQuorum -Cluster ExampleClusterName -FileShareWitness \\FileShareWitnessServer\WitnessShare -Credential (Get-Credential)
```

Replace `<ClusterName>` with the name of your cluster and `\\FileShareWitnessServer\WitnessShare` with the path to the file share witness. You will be prompted to enter the local credential for the file share witness.

## Verify the configuration

After configuring the quorum, verify the settings and health of the cluster.

1. Check the quorum configuration:

    ```powershell
    Get-ClusterQuorum -Cluster <ClusterName> | Format-List *
    ```

    This command displays the current quorum resource and its status.

2. Run the validation test:

    ```powershell
    Test-Cluster -Node <Node1>,<Node2> -Include "Validate Quorum Configuration"
    ```

    Replace `<Node1>,<Node2>` with the names of your cluster nodes. The test output indicates if the quorum configuration is optimal. If the test passes, the witness is correctly configured and the cluster is set to sustain the loss of half its nodes, provided the witness remains accessible.

If the validation test fails, review the error messages and ensure the file share permissions and network connectivity are correct. Do not change the quorum configuration unless you have determined that the change is appropriate for your cluster.

## Maintenance considerations

The witness does not store the full cluster database. It maintains cluster state information in a log file, which is insufficient for restoring the cluster database after a total outage. If you shut down all nodes for maintenance, you must start the cluster service from the last-man-standing node. Starting from a node that has not been the last to hold quorum may result in data loss or cluster startup failure.

Regularly review the quorum configuration, especially after adding or evicting nodes, adding or removing storage, or recovering from a long-term node or witness failure. The **Validate Quorum Configuration** test is the recommended method to ensure the configuration remains optimal.

References for Configure and verify a cluster witness: [Configure a file share witness for Failover Clustering in Windows Server](https://learn.microsoft.com/en-us/windows-server/failover-clustering/file-share-witness), [Configure and manage the quorum in a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/manage-cluster-quorum).
