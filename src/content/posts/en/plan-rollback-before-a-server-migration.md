---
title: "Plan rollback before a server migration"
description: "Use Azure Migrate test migrations to validate readiness and refine the plan before committing to a full cutover."
pubDate: 2025-06-04
category: cloud
tags: ["azure-migrate", "migration", "test-migration", "vmware", "hyper-v", "cloud-adoption"]
translationKey: plan-rollback-before-a-server-migration
draft: false
---

You have discovered your estate, assessed the workloads, and built a migration plan. The next step is not to lift the first production server, but to run a test migration. A test migration allows you to estimate the time involved, tweak your migration plan, and discover potential issues before the full migration [Build a migration plan with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/concepts-migration-planning). It is a controlled exercise that validates your technical assumptions without risking business continuity.

## Why test migrations matter

[![Test Migration Workflow](/images/posts/2025/azc-186-checkpoints.svg)](/images/posts/2025/azc-186-checkpoints.svg)

A test migration serves two primary purposes: validation and refinement. First, it provides an opportunity to discover any potential issues and fix them before the full migration [Build a migration plan with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/concepts-migration-planning). This includes verifying that the Azure VMs boot correctly, that connectivity is established, and that applications function as expected. Second, it helps you estimate the time involved in the migration process, allowing you to refine your migration plan [Build a migration plan with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/concepts-migration-planning).

Without a test migration, you risk encountering unexpected blockers during the actual cutover, such as compatibility issues, unsupported features, or network latency constraints [Build a migration plan with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/concepts-migration-planning). These issues can lead to extended downtime, data loss, or operational disruptions. By running a test migration, you can identify and mitigate these risks in a controlled environment.

## How to run a test migration

Azure Migrate supports test migrations for both VMware vSphere and Hyper-V VMs. The process involves replicating the VM to Azure, starting the VM in Azure, and then verifying its functionality. Here is a step-by-step guide:

### 1. Prepare the VMs

Before you start the test migration, ensure that the VMs are prepared for migration. This includes verifying hypervisor and operating system requirements, reviewing URL and port access, and making any necessary changes to the VMs [Prepare machines for migration with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration). For example, you may need to configure the SAN policy, install Hyper-V Guest Integration, or enable Azure Serial Console [Prepare machines for migration with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration).

### 2. Start the replication

In the Azure Migrate project, select the VMs you want to migrate and start the replication. You can select up to 10 machines at once for replication. To replicate more machines, add in batches of 10 [Prepare machines for migration with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration).

### 3. Initiate the test migration

Once the replication is complete, initiate the test migration. This will create a new Azure VM from the replicated data. The VM will be created in a test resource group, which you can specify during the migration process.

### 4. Verify the VM

After the test migration is complete, start the Azure VM and verify its functionality. Check that the VM boots correctly, that connectivity is established, and that applications function as expected. You can use the Azure Serial Console to troubleshoot any issues [Prepare machines for migration with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration).

### 5. Clean up

Once you have verified the VM, delete the test VM and the associated resources. This will free up Azure resources and prevent unnecessary costs. You can also delete the replication configuration for the VM if you no longer need it.

## What to look for

During the test migration, pay attention to the following:

- **Boot time**: How long does it take for the VM to boot? This can help you estimate the downtime for the actual migration.
- **Connectivity**: Can you connect to the VM using RDP or SSH? Are there any network issues?
- **Application functionality**: Do the applications function as expected? Are there any errors or warnings?
- **Performance**: How does the VM perform in Azure? Are there any performance issues?

## Refining the migration plan

Based on the results of the test migration, refine your migration plan. This may include adjusting the migration timeline, updating the network configuration, or modifying the VM sizing recommendations. You can also use the test migration to train your team and build confidence in the migration process.

Remember, the test migration is not a substitute for a full migration. It is a tool to help you prepare for the actual migration. By running a test migration, you can reduce the risk of failure and ensure a smooth transition to Azure.

## Final verification

Before you proceed with the full migration, ensure that you have addressed all the issues identified during the test migration. Verify that the migration plan is up to date and that all stakeholders are aware of the migration timeline and responsibilities. You should also have a rollback plan in place in case the migration fails.

By following these steps, you can run a successful test migration and prepare for a smooth transition to Azure. Remember, the key to a successful migration is planning, testing, and refinement.

[1] Prepare on-premises machines for migration to Azure. https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration
[2] Build migration plan with Azure Migrate. https://learn.microsoft.com/en-us/azure/migrate/concepts-migration-planning
[3] Add migration tools in Azure Migrate. https://learn.microsoft.com/en-us/azure/migrate/how-to-migrate
