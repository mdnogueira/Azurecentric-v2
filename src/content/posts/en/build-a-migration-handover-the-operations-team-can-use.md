---
title: "Build a migration handover the operations team can use"
description: "Structure a migration handover using Azure Migrate data to ensure operational readiness."
pubDate: 2026-10-04
category: cloud
tags: ["azure-migrate", "migration-handover", "operations-readiness", "dependency-mapping", "assessment"]
translationKey: build-a-migration-handover-the-operations-team-can-use
draft: false
---

A migration is not complete when the virtual machine boots in Azure. It is complete when the operations team can manage it. If the handover relies on tribal knowledge or scattered spreadsheets, the first patch Tuesday or network change will expose the gap. The most reliable handover documents are built from the data Azure Migrate already collects during discovery and assessment.

The goal is to produce a single, verifiable record for each workload that answers three questions: what is it, where does it live, and what must we do to keep it running? Azure Migrate provides the inventory, the dependency map, and the readiness assessment. You need to structure that data into a format the operations team can use immediately after cutover.

[![Migration Handover Data Flow](/images/posts/2026/azc-360-checkpoints.svg)](/images/posts/2026/azc-360-checkpoints.svg)

## Start with the assessment readiness state

The first thing to verify is whether the workload is actually ready for Azure. The [Azure Migrate assessment report](https://learn.microsoft.com/en-us/azure/migrate/concepts-migration-planning) classifies servers into four states: **Ready for Azure**, **Conditionally ready for Azure**, **Not ready for Azure**, and **Readiness unknown**.

Do not hand over a server marked as **Not ready** without a documented remediation plan. The assessment report includes specific remediation guidance for each blocker. For example, if a server is running an operating system that has reached end of support, the assessment will flag it. The Cloud Adoption Framework notes that migrating such servers to Azure can provide security updates, but the operations team needs to know the specific support status and any limitations. This is not a permanent fix; it is a transitional measure.

For **Conditionally ready** servers, the handover document must list the exact changes required. Azure Migrate identifies these during the assessment phase. If the assessment suggests a SKU change, record the recommended Azure VM size and the on-premises performance data that justified it. This prevents the operations team from guessing why a server was resized.

## Map dependencies to avoid silent outages

A server does not exist in isolation. If you migrate a database server but forget the application server that connects to it, the migration is incomplete. Azure Migrate’s [dependency visualization](https://learn.microsoft.com/en-us/azure/migrate/concepts-dependency-visualization) tool maps these relationships. It shows which servers communicate with each other and on which ports.

Use this map to define the migration order and the post-migration connectivity requirements. The handover document should include a dependency diagram for each application group. This is not just for the migration team; it is critical for the operations team to understand which resources to monitor together.

If the dependency map shows that Server A talks to Server B on port 1433, the operations team needs to know that this traffic must be allowed in the Azure virtual network. Document the required network security group (NSG) rules and the IP addresses involved. This prevents the common mistake of migrating a workload only to find it cannot reach its dependencies. The dependency map identifies the communication paths; the operations team must then manually configure the NSG rules to allow that traffic.

## Document preparation steps for post-migration access

Azure Migrate performs several automatic changes during migration, but some steps require manual preparation. The [Prepare machines for migration](https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration) article details these requirements. For Windows servers, this includes configuring the SAN policy to **OnlineAll** to preserve drive letters, and enabling the Azure Serial Console for troubleshooting. For Linux servers, it involves updating `fstab` entries to use persistent device identifiers and ensuring the Azure Linux Agent is installed.

The handover document must confirm that these steps were completed. For example, if you migrated a Linux server, verify that the `fstab` file uses UUIDs rather than device names like `/dev/sda1`. This ensures the server boots correctly even if the underlying disk device changes. Include a checklist of these preparation steps in the handover document, with a sign-off from the migration engineer.

Also, document the connectivity settings. For Windows servers, ensure Remote Desktop Protocol (RDP) is enabled and configured. For Linux servers, verify that SSH is enabled and the firewall allows incoming connections. The operations team needs to know how to access the server immediately after migration. If you rely on a jump box or a specific VPN, document that configuration as well.

## Structure the handover record

Combine the data from the assessment, dependency map, and preparation checklist into a single record for each workload. This record should include:

1. **Workload Identity**: Application name, server name, and Azure VM name.
2. **Readiness Status**: The assessment state and any known blockers.
3. **Dependency Map**: A list of dependent servers and required network rules.
4. **Preparation Checklist**: Confirmation of SAN policy, `fstab` updates, agent installation, and connectivity settings.
5. **Post-Migration Verification**: A list of tests to run after cutover, such as checking drive letters, service status, and connectivity to dependencies.

This structure ensures that the operations team has all the information they need to manage the workload. It also provides a baseline for troubleshooting if issues arise after migration.

## Verify the handover before cutover

Before you declare the migration complete, review the handover document with the operations team. Ask them to identify any gaps in their understanding. If they cannot answer the three questions (what, where, how to manage), the handover is not ready.

Run a test migration if possible. This allows you to verify the handover document against a real-world scenario. Check if the operations team can access the server, if the dependencies are working, and if the performance meets expectations. Use this feedback to refine the handover process for subsequent migrations.

A well-structured handover document reduces the risk of post-migration issues and empowers the operations team to manage the workload confidently. It turns the data collected by Azure Migrate into actionable operational knowledge.
