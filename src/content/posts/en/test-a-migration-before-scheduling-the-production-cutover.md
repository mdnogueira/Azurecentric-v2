---
title: "Test a migration before scheduling the production cutover"
description: "Validate migration readiness by running a test migration in Azure Migrate, verifying OS state and connectivity before production cutover."
pubDate: 2024-10-16
category: hybrid-migration
tags: ["migration", "hybrid-cloud", "azure-migrate", "azure-virtual-machines", "linux"]
translationKey: test-a-migration-before-scheduling-the-production-cutover
draft: false
---

You have the assessment data, the sizing estimates, and the budget approval. The next logical step is often the most risky: moving the first machine. If you proceed directly to a production cutover without a dry run, you risk discovering that drive letters have shifted, network interfaces are misconfigured, or remote access is blocked. A test migration validates the preparation steps and the connectivity path without impacting the live workload.

Azure Migrate supports this by allowing you to replicate a machine and then run a test migration. This process creates a temporary Azure Virtual Machine (VM) from the replicated data. You can verify the OS state, application functionality, and network configuration in Azure before you decide to cut over. This is not a backup; it is a validation of the migration pipeline itself.

## Prepare the on-premises machine for a test

Before you can replicate or test, the on-premises machine must meet specific requirements. Azure Migrate performs some changes automatically during replication, but others require manual intervention. If you skip these, the migrated VM may fail to boot or lose connectivity.

For Windows machines, the most common issue is drive letter assignment. Azure assigns the temporary storage drive as `D:` by default. If your on-premises application relies on `D:` for data, the drive letters will shift after migration. To prevent this, set the Storage Area Network (SAN) policy to `OnlineAll` on the on-premises machine. You can check the current policy using `diskpart`:

1. Open an elevated command prompt.
2. Run `diskpart`.
3. Run `SAN`.
4. If the result is not `OnlineAll`, run `SAN Policy=OnlineAll`.

This ensures that disks are brought online and that drive letters are preserved during the test migration. For Windows Server 2008 R2 and later, Azure Migrate may set this automatically, but verifying it manually is safer. You should also ensure that the Windows Azure Guest Agent is installed, as it manages VM extensions and post-deployment configuration. For older operating systems, you may need to install this manually.

For Linux machines, the requirements are similar but focus on kernel drivers and network configuration. Azure Migrate automatically updates the kernel image with Hyper-V Linux Integration Services (LIS) for most supported distributions, including RHEL 8.x/7.x, Ubuntu 16.04/18.04/20.04, SUSE 12/15, and Debian 9/10. However, you must manually update the `fstab` entries to use persistent volume identifiers and remove any `udev` rules that reserve interface names based on MAC addresses. If you do not update `fstab`, the VM may fail to mount data disks after migration. You should also ensure that SSH is enabled and that the `sshd` service is set to start automatically on reboot.

## Configure connectivity for the test

A test migration is useless if you cannot connect to the resulting Azure VM. You must prepare the on-premises machine to allow remote connections, as the same settings often apply to the Azure VM. For Windows, enable Remote Desktop Protocol (RDP) and configure the Windows Firewall to allow RDP traffic. If you plan to access the Azure VM over the internet, allow TCP port 3389 in the Public profile. If you are using a site-to-site VPN, allow RDP for the Domain and Private profiles.

For Linux, ensure that SSH is enabled and that incoming connection requests are not blocked by the OS firewall. You should also enable Azure Serial Console logging. This allows you to troubleshoot boot issues in Azure even if the network is not yet configured. The Serial Console does not require a reboot to enable, but the Azure VM will boot using the disk image, which is equivalent to a reboot for the new VM.

## Run the test migration

Once the on-premises machine is prepared and connectivity is configured, you can initiate the test migration. In the Azure Migrate portal, navigate to the migration project and select the machine you want to test. Choose the option to run a test migration. Azure Migrate will create a temporary Azure VM from the replicated data. 

During the test migration setup, you must explicitly select the target Virtual Network (VNET) and subnet. This is where you define the network isolation. Do not assume the test VM is automatically isolated; if you select a production VNET, the test VM will appear on your production network. Select a dedicated test VNET or a separate subnet to ensure the test VM does not interfere with live workloads or cause IP conflicts.

The test migration process validates several things:

1. **Replication integrity**: The data is successfully transferred and assembled into a VM.
2. **OS boot**: The VM boots correctly in Azure, using the updated kernel and drivers.
3. **Connectivity**: You can connect to the VM using RDP or SSH, confirming that firewall and network settings are correct.
4. **Application state**: You can verify that the application is running and that drive letters or mount points are as expected.

During the test, you should check the drive letters on Windows and the mount points on Linux. If you set the SAN policy to `OnlineAll`, the drive letters should match the on-premises configuration. If you updated `fstab` on Linux, the data disks should mount correctly. You should also test application functionality to ensure that it behaves as expected in the Azure environment.

## Clean up and decide

After the test migration is complete, you must clean up the temporary Azure VM to avoid unnecessary costs. The test VM is a standard Azure resource. Azure Migrate does not provide a dedicated "delete test VM" button in the migration workflow. You must manually delete the VM via the Azure Portal, Azure CLI, or PowerShell after validation.

If the test migration is successful, you have validated the preparation steps and the connectivity path. You can now schedule the production cutover with confidence. If the test fails, review the error messages and the preparation steps. Common issues include incorrect SAN policies, missing LIS drivers, or firewall blocks. Address these issues before attempting another test.

A test migration is not a guarantee that the production cutover will be seamless, but it significantly reduces the risk. It allows you to identify and resolve issues in a controlled environment. By validating the migration pipeline, you ensure that the production cutover focuses on minimizing downtime rather than troubleshooting basic connectivity or configuration errors.

Verify that the test VM has been deleted and that the on-premises machine is still running normally. If you are satisfied with the test results, proceed with scheduling the production cutover. If you encounter issues, repeat the preparation steps and run another test. The goal is to ensure that the migration process is robust and that the team is prepared for the production event.

tags: [azure-migrate, migration, testing, vmware, hyper-v]
diagram: {title: Test Migration Validation Flow, nodes: ["On-premises Preparation", "Azure Migrate Test Setup", "Temporary VM Creation", "Connectivity & OS Check", "Manual VM Deletion"]}
claims: [
  {
    "claim": "Azure Migrate allows running a test migration to create a temporary Azure VM for validation.",
    "source_id": "S2",
    "evidence_span": "Try out a migration using the Migration and modernization tool for Hyper-V or VMware VMs."
  },
  {
    "claim": "Setting SAN policy to OnlineAll prevents drive letter shifts for Windows VMs.",
    "source_id": "S1",
    "evidence_span": "This setting ensures that disks are brought online, and it ensures that you can read and write to both disks."
  },
  {
    "claim": "Azure Migrate automatically updates kernel images with Hyper-V Linux Integration Services for supported distributions.",
    "source_id": "S1",
    "evidence_span": "Azure Migrate automatically updates the kernel image with Hyper-V Linux Integration Services (LIS) for most supported distributions"
  },
  {
    "claim": "Test VMs are standard Azure resources that must be manually deleted.",
    "source_id": "S1",
    "evidence_span": "Azure VMs are created during migration to Azure."
  }
]
review_questions: [
  "Does the specific Azure Migrate version in use provide any automated cleanup workflows for test VMs, or is manual deletion always required?",
  "Are there specific network security group (NSG) defaults applied to test VMs that might block connectivity even if firewall rules are correct?"
]

References for Test a migration before scheduling the production cutover: [Prepare machines for migration with Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/prepare-for-migration), [Add migration tools in Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/how-to-migrate).
