---
title: "Use Cluster-Aware Updating with a tested maintenance process"
description: "Configure Cluster-Aware Updating with a tested Updating Run Profile to automate safe, repeatable maintenance on Windows Server failover clusters."
pubDate: 2025-01-11
category: high-availability
tags: ["failover-clustering", "cluster-aware-updating", "maintenance", "windows-server", "powershell"]
translationKey: use-cluster-aware-updating-with-a-tested-maintenance-process
draft: false
---

Cluster maintenance often feels like a balancing act between keeping services available and ensuring nodes receive critical updates. Cluster-Aware Updating (CAU) removes the manual coordination from this process, but only if you configure it with a clear, tested plan. The feature automates the sequence of putting nodes into maintenance mode, moving workloads, applying updates, and restarting, but it relies on your configuration to define what "safe" actually means for your specific environment.

The first decision is whether CAU will coordinate updates itself or be managed remotely. Self-updating mode embeds the CAU role within the cluster, allowing it to update itself on a schedule. Remote-updating mode uses a separate Update Coordinator computer to trigger and monitor the process. Both modes require the Failover Clustering feature and tools, but the installation scope differs. For self-updating, you need the tools on every node. For remote updating, the tools sit on the coordinator, though nodes still need specific remote management configurations to allow the coordinator to interact with them.

## Establish the prerequisites

Before configuring CAU, the cluster must meet several baseline requirements. All nodes must be in the same Active Directory domain, and the cluster name must resolve via DNS. The Cluster service must be running on all nodes, and there must be sufficient nodes online to maintain quorum. Note that quorum is a state of operational availability, not a backup mechanism; it ensures the cluster can make decisions, but it does not protect data from corruption or loss.

Remote management configuration is critical. By default, Windows Management Instrumentation (WMI) and PowerShell remoting are enabled, but you must verify that the firewall allows automatic restarts. CAU requires a firewall rule to allow inbound RPC traffic on dynamic ports for the `wininit.exe` process. If you are using Windows Firewall, enabling the **Remote Shutdown** rule group on each node satisfies this requirement. You can enable this rule automatically when adding the CAU cluster role or manually using PowerShell:

```powershell
Set-NetFirewallRule -Group "@firewallapi.dll,-36751" -Profile Domain -Enabled true
```

You also need an administrator account with local administrator rights on all cluster nodes. If your account lacks these permissions on every node, CAU will prompt for credentials during the run, which can interrupt automated processes. For remote-updating mode, the Update Coordinator must also be in the same domain and have network connectivity to all nodes.

## Configure the updating mode

Choose the mode that fits your operational model. Self-updating mode is useful for unattended scenarios, such as branch office clusters with minimal local support. To enable it, you add the CAU clustered role to the failover cluster. This role requires a virtual computer object (VCO) in Active Directory, which CAU can create automatically if the cluster has sufficient permissions, or you can prestage it manually.

Remote-updating mode is often preferred for environments where you want a dedicated management station to oversee the process. In this mode, the Update Coordinator is not a cluster member. You install the Failover Clustering Tools on the coordinator and use the CAU UI or PowerShell cmdlets to trigger runs. This mode is particularly useful for Server Core installations where a GUI is not available on the nodes themselves.

Regardless of the mode, you must decide on the update source. CAU uses plug-ins to fetch updates. The default plug-in, `Microsoft.WindowsUpdatePlugin`, integrates with Windows Update or WSUS. Microsoft recommends disabling automatic update settings on the cluster nodes to prevent conflicts. Combining CAU with other automatic update methods can cause unpredictable results, including service interruptions. Ensure all nodes are uniformly configured to use the same update source.

## Create a tested Updating Run Profile

An Updating Run Profile is an XML file that stores configuration settings for an Updating Run. It allows you to define parameters such as retry limits, time bounds, and the order of node updates. Using a profile ensures consistency across multiple runs and clusters. It does not store cluster-specific information like credentials, making it shareable across clusters of a similar class.

Key settings to configure include:

-   **MaxRetriesPerNode**: The maximum number of times CAU will retry an update on a node before marking it as failed. The default is 3, with a maximum of 64.
-   **MaxFailedNodes**: The maximum number of nodes that can fail during the run before CAU stops the entire process. The default is approximately one-third of the total nodes.
-   **StopAfter**: A time limit in minutes after which the run will be terminated if it has not completed. This includes time spent running pre- and post-update scripts.
-   **PreUpdateScript** and **PostUpdateScript**: Paths to PowerShell scripts that run before and after updates. These scripts must be accessible to all nodes, preferably on a highly available file share with read permissions for the Everyone group and restricted write access.

When creating a profile, be aware that the CAU UI does not support file paths with spaces. If your scripts are located in such paths, use PowerShell to manage the profile and quote the paths appropriately.

To test your configuration, run the CAU Best Practices Analyzer (BPA). It checks the cluster environment for readiness, including network connectivity, permissions, and firewall rules. The BPA model primarily tests for readiness to apply Microsoft updates using the default plug-in. If you use a non-Microsoft plug-in, you must independently validate your environment.

## Execute and verify

Once the profile is ready, you can initiate an Updating Run. In remote-updating mode, you can use the CAU UI or PowerShell cmdlets like `Invoke-CauRun`. In self-updating mode, you configure the schedule through the CAU cluster role properties.

During the run, CAU will:

1.  Put a node into maintenance mode.
2.  Move clustered roles off the node.
3.  Install updates and dependent updates.
4.  Restart the node if necessary.
5.  Bring the node out of maintenance mode.
6.  Restore clustered roles.
7.  Move to the next node.

For continuously available workloads, such as Hyper-V with live migration or file servers with SMB Transparent Failover, this process can occur with minimal service interruption. For other roles, a planned failover may cause a transient interruption.

After the run, review the results. Check the CAU UI or use `Get-CauRun` in PowerShell to see the status of each node. If the run failed, examine the logs and the BPA output to identify configuration gaps. Adjust the Updating Run Profile as needed, particularly the time limits and retry counts, to accommodate the specific update load and script execution times.

A successful run is not just about updates being installed; it is about the cluster maintaining its intended availability posture. Verify that all clustered roles are running correctly on their new nodes and that no unexpected dependencies were broken by the updates. This verification step is crucial before scheduling subsequent runs or relying on the profile for future maintenance windows.

## Cleanup and maintenance

Updating Run Profiles are static; they do not automatically update when you modify the self-updating configuration. If you change the profile, you must reapply it to the CAU cluster role or the remote coordinator. Regularly review the profiles to ensure they still align with your operational requirements, especially after significant changes to the cluster topology or update sources.

If you need to uninstall CAU, you can remove the Failover Clustering feature or tools using Server Manager, PowerShell, or DISM. In self-updating mode, ensure the CAU cluster role is removed before uninstalling the tools to avoid leaving orphaned resources.

By focusing on a single, well-tested Updating Run Profile and verifying the cluster state after each run, you establish a reliable maintenance process. This approach minimizes the risk of unplanned downtime and ensures that your cluster updates are applied consistently and safely.


References for Use Cluster-Aware Updating with a tested maintenance process: [Cluster-Aware Updating overview](https://learn.microsoft.com/en-us/windows-server/failover-clustering/cluster-aware-updating), [Cluster-Aware Updating requirements and best practices](https://learn.microsoft.com/en-us/windows-server/failover-clustering/cluster-aware-updating-requirements), [Cluster-Aware Updating advanced options and updating run profiles](https://learn.microsoft.com/en-us/windows-server/failover-clustering/cluster-aware-updating-options).
