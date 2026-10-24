---
title: "Test a planned failover and record the application result"
description: "Execute a planned failover in a Windows Server failover cluster and verify application health using PowerShell."
pubDate: 2025-05-07
category: backup-dr
tags: []
translationKey: test-a-planned-failover-and-record-the-application-result
draft: true
---

You need to confirm that a clustered role on Windows Server 2025 survives a planned node removal. The goal is to verify that the cluster coordinates a graceful migration and that the application starts correctly on the new node. This is not a simulation of a crash; it is a controlled move that allows the service to shut down and restart cleanly.

## Check the cluster state before moving

Before initiating any move, confirm that the cluster is healthy and that the role you intend to move is currently online. The [failover clustering overview](https://learn.microsoft.com/en-us/windows-server/failover-clustering/failover-clustering-overview) explains that clustered roles are proactively monitored. If the cluster service is already struggling, a planned move may expose deeper issues rather than testing the application's resilience.

Use PowerShell to check the current state of the cluster and the specific role. Run the following commands on any node with the Failover Cluster Management Tools installed:

```powershell
# Illustrative example: verify cluster status and node health
Get-Cluster
Get-ClusterNode

# Illustrative example: check the specific role's state
Get-ClusterGroup -Name 'MyClusterRole' | Select-Object Name, State, OwnerNode
```

Ensure the `State` of the role is `Online` and the `OwnerNode` is the node you intend to move it *from*. If the role is already offline or in a failed state, resolve those issues before attempting a planned failover. The [create a failover cluster](https://learn.microsoft.com/en-us/windows-server/failover-clustering/create-failover-cluster) guidance notes that validation tests are critical during initial setup, but for an existing cluster, checking the current operational state is the relevant prerequisite.

## Execute the planned failover

A planned failover requires you to specify the target node explicitly. This tells the cluster service to coordinate the shutdown of the role on the source node and the startup on the target node. This is distinct from an unplanned failover, which forces a restart without graceful shutdown and can risk data loss.

Use the `Move-ClusterGroup` cmdlet with the `-PreferredNode` parameter. This initiates the planned move:

```powershell
# Illustrative example: move the role to the target node
Move-ClusterGroup -Name 'MyClusterRole' -PreferredNode 'TargetNode'
```

The cluster service will now manage the transition. It will stop the resources on the current owner, move the ownership, and start the resources on the target node. This process may take some time depending on the complexity of the role and its dependencies. Do not interrupt this process.

## Verify the application result

The `Move-ClusterGroup` command completes when the cluster service has finished its internal coordination. However, the cluster service does not verify the application's internal state. You must confirm that the application is actually running and serving requests on the new node.

First, check the state of the cluster group again:

```powershell
Get-ClusterGroup -Name 'MyClusterRole' | Select-Object Name, State, OwnerNode
```

The `State` should be `Online` and `OwnerNode` should be `TargetNode`. If the state is `Offline` or `Failed`, the role did not start correctly. Next, verify the application itself. For a file share, try accessing the share path. For a SQL Server role, run a simple query. For a Hyper-V role, check that the virtual machines are running.

If the application fails to start, check the System event log on the new node. The [failover clustering system log events](https://learn.microsoft.com/en-us/windows-server/failover-clustering/system-events) documentation lists relevant events. Look for:

*   **Event 1181: NETRES_RESOURCE_START_ERROR**: The cluster resource cannot be brought online because the associated service failed to start.
*   **Event 1069: RCM_RESOURCE_FAILURE**: The cluster resource failed.

These events indicate the cluster service tried to start the resource but encountered an error. The error code in the event details will help you pinpoint whether it's a service configuration issue, a missing dependency, or a network problem.

## Record the outcome

Document the result of the test. Note the source and target nodes, the duration of the failover, and whether the application remained accessible. If the application experienced downtime, record the length and the error messages. This record is essential for planning future maintenance and for troubleshooting if the failover fails in a real incident.

If the test is successful, you have confirmed that your clustered role can survive a planned node failure. If it fails, you have identified a specific issue to resolve before the next planned maintenance window. Either way, you have a concrete verification of your cluster's readiness.

Consider testing the reverse failover to ensure the role can move back to the original node. This confirms bidirectional resilience. Also, consider testing unplanned failovers in a non-production environment to understand how the cluster handles sudden node failures. These tests provide a more complete picture of your cluster's availability.

The key is to treat the planned failover as a verification step, not just a routine operation. By checking the cluster health first, executing the move carefully, and verifying the application state, you ensure that your high-availability setup is actually working as intended.

tags: [failover-clustering, windows-server-2025, high-availability, powershell, troubleshooting]
diagram: {title: Planned Failover Verification Flow, nodes: [Check Cluster State, Execute Move-ClusterGroup, Check Cluster Group State, Verify Application Functionality, Record Outcome and Events]}
claims: [{claim: Clustered roles are proactively monitored and restarted or moved if they are not working., source_id: S2, evidence_span: If they are not working, they are restarted or moved to another node.}, {claim: Event 1181 indicates a cluster resource cannot be brought online because the associated service failed to start., source_id: S3, evidence_span: Cluster resource '%1' cannot be brought online because the associated service failed to start. The service return code is '%2'.}, {claim: Validation tests are strongly recommended before creating a failover cluster to ensure hardware and settings are compatible., source_id: S1, evidence_span: Before you create the failover cluster, we strongly recommend that you validate the configuration to make sure that the hardware and hardware settings are compatible with failover clustering.}]
review_questions: [What is the specific application-level verification method for the clustered role being tested?, Are there any specific network or storage dependencies that need to be checked on the target node before the move?, What is the acceptable downtime threshold for the application during a planned failover?]
}
