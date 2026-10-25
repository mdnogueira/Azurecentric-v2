---
title: "Investigate an assessment with incomplete server data"
description: "Troubleshoot missing performance data in Azure Migrate by verifying appliance connectivity, vCenter statistics, and Hyper-V configuration."
pubDate: 2026-08-11
category: cloud
tags: ["azure-migrate", "troubleshooting", "assessment", "performance-data", "vmware", "hyper-v"]
translationKey: investigate-an-assessment-with-incomplete-server-data
draft: false
---

You open the Azure Migrate assessment report and see that the performance coverage is low, or the export flags `PercentageOfCoresUtilizedMissing` and `PercentageOfMemoryUtilizedMissing`. The sizing recommendations are likely based on allocated cores and memory rather than actual utilisation, which can lead to over-provisioning if the workload is bursty or under-provisioning if the peak demand is missed.

This is a common symptom when the Azure Migrate appliance cannot collect the necessary performance counters. The assessment service relies on configuration data and performance data fetched at specific intervals. If the data is missing, the service falls back to static allocation data. To restore accurate performance-based sizing, you need to verify the health of the data collection pipeline, starting with the appliance and moving to the source environment.

[![Azure Migrate Performance Data Collection Flow](/images/posts/2026/azc-341-checkpoints.svg)](/images/posts/2026/azc-341-checkpoints.svg)

## Check the appliance connection status

The first thing to verify is whether the appliance can communicate with the source servers. If the appliance cannot connect, no data will be collected.

For VMware environments, the appliance connects to vCenter Server. If you see errors such as `Error Code: 758: Request timeout while fetching Performance data` or `Error Code: 760: Unable to get Performance counters`, the issue is often connectivity or credential-related. Ensure that the vCenter Server user account has the required privileges for **Virtual Machines** > **Guest Operations** enabled. Without these privileges, the appliance cannot interact with the guest OS to pull performance data [[Common issues in Azure Migrate assessments](https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-assessment)].

For Hyper-V and physical servers, the appliance uses WinRM (port 5985) or SSH (port 22). If you encounter `Error Code: 60001: UnableToConnectToPhysicalServer`, check that the remote machines are added to the appliance's WinRM TrustedHosts list and that the correct authentication method is selected [[Common issues in Azure Migrate assessments](https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-assessment)].

## Verify the agent heartbeat and connection status

If the appliance is connected, the next step is to check the data collection agents. In the Azure Migrate portal, navigate to the **Discovered servers** view. Look for the connection status of the agents.

For VMware and Hyper-V, the appliance itself acts as the collector, but it relies on the vCenter or Hyper-V host to provide data. If the vCenter statistics level is not set correctly, performance data will not be available. Azure Migrate requires the statistics level on the vCenter Server to be set to **3** (detail) to make performance data available. If it is lower, configure it accordingly and wait for a day before running the assessment again to allow data to populate [[Common issues in Azure Migrate assessments](https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-assessment)].

For physical servers and some Hyper-V configurations, the Azure Migrate appliance connects directly using the credentials provided on the appliance. It does not deploy an agent. Check the **last heartbeat** of the connection. If the status is not **Connected**, the appliance is not receiving data. Ensure that the guest credentials provided on the appliance have the required permissions to fetch metadata and that the servers are powered on during the assessment period [[Troubleshoot assessments FAQ in Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-assessment-faq)].

## Check for Hyper-V dynamic memory issues

If you are assessing Hyper-V VMs and only memory counters are missing, check if dynamic memory is enabled on these VMs. The Azure Migrate appliance can collect memory utilization values for servers in a Hyper-V environment only when the server has dynamic memory enabled. If dynamic memory is disabled, you must enable it and recalculate the assessment to reflect the latest changes [[Troubleshoot assessments FAQ in Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-assessment-faq)].

## Validate network and port access

Performance data collection requires outbound connectivity from the appliance and the source servers. Ensure that outbound connections on port 443 (HTTPS) are allowed from the appliance and the source servers to the Azure Migrate service. If all performance counters are missing, this is a frequent cause [[Troubleshoot assessments FAQ in Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-assessment-faq)].

For VMware, ensure that port 443 is open on the ESXi host. If you encounter `Error Code: 9014`, it indicates an HTTP GET request failure to retrieve metadata from the ESXi host, often due to firewall or proxy settings blocking port 443 [[Common issues in Azure Migrate assessments](https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-assessment)].

## Recalculate and verify

Once you have addressed the connectivity, credential, or configuration issues, you need to recalculate the assessment. The performance coverage is calculated based on the percentage of available data points needed to compute the assessment. If you have resolved the issues, recalculate the assessment to see if the coverage improves.

If the performance coverage is still below 80%, Microsoft recommends waiting at least a day for the appliance to profile the environment and then recalculating the assessment. If the data still does not populate, consider switching the assessment to **As on-premises** sizing, which relies on allocated cores and memory rather than performance history. Note that this fallback may result in less accurate recommendations compared to performance-based sizing, as it does not account for actual utilisation patterns [[Overview of Azure Migrate Assessment Report](https://learn.microsoft.com/en-us/azure/migrate/assessment-report#coverage)].

To confirm the fix, export the assessment report again. The `PercentageOfCoresUtilizedMissing` and `PercentageOfMemoryUtilizedMissing` flags should no longer appear for the servers that were previously affected. If they do, review the appliance logs for any new error codes, such as `Error Code: 60004: NoPerfDataAvailableForServers`, which may indicate permission issues on the guest OS [[Common issues in Azure Migrate assessments](https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-assessment)].

If the issue persists after these steps, submit a Microsoft support case, providing the appliance machine ID, which is available in the footer of the appliance configuration manager [[Common issues in Azure Migrate assessments](https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-assessment)].
