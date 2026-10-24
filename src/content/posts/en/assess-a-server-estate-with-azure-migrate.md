---
title: "Assess a server estate with Azure Migrate"
description: "Add assessment tools in Azure Migrate and verify data collection to ensure accurate server sizing and confidence ratings."
pubDate: 2024-06-29
category: cloud
tags: ["azure-migrate", "server-assessment", "vm-sizing", "migration-planning"]
translationKey: assess-a-server-estate-with-azure-migrate
draft: true
---

You have an on-premises server estate to move to Azure, but you are unsure which VM sizes will fit. The first step is not to guess, but to let Azure Migrate measure the actual workload. This requires adding the correct assessment tool to your project and ensuring the appliance can collect the necessary performance data.

## Select the right assessment scenario

[![Azure Migrate Assessment Data Flow](/images/posts/2024/azc-065-checkpoints.svg)](/images/posts/2024/azc-065-checkpoints.svg)

Azure Migrate separates server assessment from database and web app assessment. You must choose the scenario that matches your primary migration goal before adding tools.

1. Open your Azure Migrate project in the Azure portal.
2. Go to **Overview**.
3. Select **Discover, assess and migrate** if you are moving physical or virtual servers. This option also supports discovering and assessing SQL Server from a VMware environment.
4. If you are assessing on-premises SQL Server databases specifically, select **Assess and migrate databases**.
5. For web apps or virtual desktop infrastructure, use the **Explore more** options.

Choosing the wrong scenario means the relevant assessment tools will not be available or configured correctly for your workload.

## Add the assessment tool

Once the scenario is set, you need to add the tool that will collect the data.

If you created your project using the **Assess and migrate servers** option, the **Azure Migrate Discovery and assessment tool** is added automatically. To add additional tools, go to **Windows, Linux and SQL Server** > **Assessment tools** and select **Add more tools**.

If you used a different project creation path, or if no tools are listed, select **Click here** under **Assessment tools**. In the **Add tools** blade, select the tool you need and click **Add tool**.

For database assessments, follow the same pattern in the **Databases** section. If you created the project with **Assess and migrate database**, the Database Assessment tool is pre-added. Otherwise, select **Click here** under **Assessment tools** in the Databases section to add it.

## Verify data collection before assessing

An assessment is only as good as the data it uses. If performance data is missing, Azure Migrate falls back to static configuration (allocated cores/memory), which often leads to oversized or undersized recommendations.

Check the following to ensure data is flowing:

1. **Power state**: Ensure the source VMs or servers are powered on during the assessment period.
2. **Agent connectivity**: For SQL assessments, check that the SQL agent status is **Connected** and verify the last heartbeat. For server assessments, ensure the appliance can reach the source hosts.
3. **Network access**: Outbound connections on port 443 (HTTPS) must be allowed from the appliance to Azure. Blocked ports are a common cause of missing performance counters.
4. **Hyper-V dynamic memory**: If assessing Hyper-V VMs, memory utilization data is only collected if dynamic memory is enabled. If it is disabled, you will see **PercentageOfMemoryUtilizedMissing** in the report.
5. **Assessment duration**: Performance-based assessments require a minimum profiling period. If you create an assessment before the required duration (e.g., one week) has passed, the confidence rating will be low because data points are incomplete.

If performance counters are missing, the assessment report will explicitly state which data is unavailable. In such cases, Azure Migrate uses the allocated resources on-premises as a fallback, which may not reflect actual usage patterns.

## Understand sizing criteria and disk recommendations

When creating the assessment, you choose between **Performance-based** and **As on-premises** sizing criteria.

- **Performance-based**: Uses collected IOPS and throughput data to recommend Azure disk SKUs. If you select **Automatic** storage type, Azure Migrate picks the best match (Standard HDD, Standard SSD, or Premium) based on performance needs. If you select a specific type like **Premium**, it recommends the smallest Premium disk that meets the IOPS and throughput requirements.
- **As on-premises**: Matches the Azure disk size and type to the on-premises disk configuration. Note that even with this setting, the specific SKU is still selected based on IOPS and throughput requirements within that tier.

Note that Azure Migrate does not currently support migration to Ultra disks. If your on-premises storage has very high IOPS, the assessment might recommend a Premium disk that is larger than your on-premises disk to meet the performance requirements. For example, an on-premises 32 GB disk with 800 IOPS might be recommended as a P15 (256 GB, 1100 IOPS) Premium disk to satisfy the IOPS demand.

## Next steps

After adding the tools and verifying connectivity, proceed to discover your servers. Use the **Azure Migrate Discovery and assessment tool** to scan your VMware, Hyper-V, or physical server environments. Once discovery is complete, create the assessment using the performance data collected.

Export the assessment report to review the recommended VM sizes and costs. If the confidence rating is low or performance data is missing, revisit the prerequisites above before proceeding with migration planning.

References for Assess a server estate with Azure Migrate: [Add assessment tools in Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/how-to-assess), [Troubleshoot assessments FAQ in Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/troubleshoot-assessment-faq).
