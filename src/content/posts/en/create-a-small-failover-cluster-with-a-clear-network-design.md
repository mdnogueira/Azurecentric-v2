---
title: "Create a small failover cluster with a clear network design"
description: "Create a Windows Server 2022 failover cluster with explicit network and identity controls, validating prerequisites before deployment."
pubDate: 2024-06-01
category: backup-dr
tags: ["failover-clustering", "windows-server-2022", "network-design", "active-directory", "validation"]
translationKey: create-a-small-failover-cluster-with-a-clear-network-design
draft: true
---

You are planning a small failover cluster on Windows Server 2022. The immediate technical question is how to structure the network and identity so the cluster is supported and manageable from day one. The answer lies in strict adherence to validation, isolated network roles, and explicit control over the cluster name object (CNO) placement.

Failover clustering is not a simple "add servers" operation. Microsoft supports a cluster solution only if the complete configuration passes all validation tests and if all hardware is certified for the version of Windows Server that the cluster nodes are running [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster). This means the network design must be proven compatible before the cluster is created, not after.

[![Failover Cluster Creation Flow](/images/posts/2024/azc-055-checkpoints.svg)](/images/posts/2024/azc-055-checkpoints.svg)

## Verify prerequisites and network isolation

Before installing any clustering features, you must ensure the environment meets the baseline requirements. All servers that you want to add as cluster nodes must be running the same version of Windows Server and joined to the same Active Directory domain [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster). Mismatched versions or domain memberships are immediate blockers.

The network design is the most critical variable. You must avoid single points of failure in the infrastructure that connects your cluster nodes [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements). For a small cluster, this typically means connecting nodes via multiple, distinct networks or using redundant switches. If you are using iSCSI, you should dedicate each network adapter to either network communication or iSCSI traffic; do not mix cluster heartbeat and storage traffic on the same adapter unless explicitly supported and validated [Failover clustering hardware requirements and storage options](https://learn.microsoft.com/en-us/windows-server/failover-clustering/clustering-requirements).

You also need to verify account requirements. The account you use to create the cluster must be a domain user with administrator rights on all nodes [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster). Crucially, this account must have **Create Computer objects** permission in the Organizational Unit (OU) or container where the servers will reside, or a domain administrator must prestage the cluster computer object [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster). Without this, the cluster creation will fail when it attempts to register the CNO in Active Directory.

## Install the Failover Clustering feature

You must install the Failover Clustering feature on every server that you want to add as a failover cluster node. This is done via Server Manager or PowerShell on each node individually.

1. Start **Server Manager**.
2. On the **Manage** menu, select **Add Roles and Features**.
3. Select **Role-based or feature-based installation**.
4. On the **Select destination server** page, select the target server.
5. On the **Select features** page, select the **Failover Clustering** check box.
6. To install the failover cluster management tools, select **Add Features** and then **Next**.
7. Select **Install**.

A server restart is not required for the Failover Clustering feature [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster). Repeat this procedure on every node. After installation, apply the latest updates from Windows Update [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster).

## Validate the configuration

Do not skip validation. The Cluster Validation Wizard checks hardware compatibility, network configuration, and storage connectivity. It is the only way to ensure your specific network design meets Microsoft's support requirements.

1. On a computer with the Failover Cluster Management Tools installed, start **Failover Cluster Manager**.
2. Under **Management**, select **Validate Configuration**.
3. On the **Select Servers or a Cluster** page, enter the NetBIOS name or FQDN of each server you plan to add. Separate multiple names by a comma or semicolon (e.g., `server1.contoso.com, server2.contoso.com`) [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster).
4. On the **Testing Options** page, select **Run all tests (recommended)** [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster).
5. Review the **Summary** page. If there are warnings or failures, select **View Report** to determine which issues must be corrected [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster).

A warning indicates that the aspect of the failover cluster can be supported but might not meet recommended best practices. A failure indicates the configuration is not supported. You must resolve failures before proceeding [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster).

## Create the failover cluster with explicit network design

When you create the cluster, you define the cluster name object (CNO) and its network address. This is where your network design becomes operational.

1. In **Failover Cluster Manager**, select **Create Cluster**.
2. On the **Select Servers** page, add the validated nodes.
3. On the **Access Point for Administering the Cluster** page, configure the CNO:
    - **Cluster Name**: Enter the name for the cluster. By default, this creates a computer object in the default container or the OU where the nodes reside. To place the CNO in a specific OU, enter the distinguished name (e.g., `CN=ClusterName, OU=Clusters, DC=Contoso, DC=com`) [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster). This is a best practice for security and Group Policy isolation. Note that specifying a Distinguished Name requires the creating account to have **Create Computer objects** permission in that specific OU, or the CNO must be prestaged.
    - **IP Address**: If your servers do not use DHCP, you must configure one or more static IP addresses for the failover cluster. Select the check box next to each network you want to use for cluster management and enter the IP address. This IP address will be associated with the cluster name in DNS [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster).

    For a small cluster, you typically assign a single static IP address on the management network. Ensure this IP is not in use by any other device and is resolvable via DNS before creation.
4. On the **Confirmation** page, review the settings. By default, **Add all eligible storage to the cluster** is selected. Clear this if you plan to configure storage later [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster).
5. Select **Next** to create the cluster.

## Verify the cluster

After creation, verify that the cluster name is listed under **Failover Cluster Manager** in the navigation tree [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster). Expand the cluster name and check the **Nodes**, **Storage**, and **Networks** sections. It may take some time for the cluster name to successfully replicate in DNS. Once replicated, the cluster name should appear as a server with a **Manageability** status of **Online** in Server Manager [Create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster).

The first actionable step is to confirm the CNO is in the intended OU and that the cluster IP resolves correctly. If DNS replication is delayed, wait and recheck rather than attempting to force registration. A cluster that passes validation and has a correctly placed CNO is ready for workload configuration.
