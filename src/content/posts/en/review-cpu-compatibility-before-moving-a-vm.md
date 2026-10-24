---
title: "Review CPU compatibility before moving a VM"
description: "Configure Hyper-V processor compatibility for live migration between mixed CPU generations."
pubDate: 2026-02-02
category: hyper-v
tags: ["hyper-v", "processor-compatibility", "live-migration", "windows-server-2025", "virtualization"]
translationKey: review-cpu-compatibility-before-moving-a-vm
draft: true
---

You are planning to live migrate a virtual machine between Hyper-V hosts or clusters, but you need to ensure the processor compatibility settings allow it. The first thing to check is not just the migration capability, but the specific processor feature sets available on the source and destination hardware. If the guest operating system or applications are using instructions that the target host does not support, the migration will fail or the application will crash. Processor compatibility mode exists to prevent this by limiting the features presented to the VM. There are two distinct modes available in Windows Server 2025 and later, each with different implications for performance and migration scope.

## Understand the two modes of compatibility

[![Processor Compatibility Decision Flow](/images/posts/2026/azc-273-checkpoints.svg)](/images/posts/2026/azc-273-checkpoints.svg)

Standard processor compatibility mode uses a fixed, minimal set of processor features. This ensures the widest possible compatibility but hides newer instruction sets, which can impact performance for workloads that rely on hardware optimizations like encryption or vector calculations. Dynamic processor compatibility mode was introduced in Windows Server 2025. It calculates the common denominator of CPU features supported by all nodes in a cluster. This allows VMs to use the maximum number of processor instruction sets present across the cluster, improving performance while still ensuring compatibility for live migration within that cluster. This mode is only available for VMs with configuration version 10.0 or later running on a Hyper-V host running Windows Server 2025 or Azure Local version 21H2.

It is important to note that processor compatibility mode does not allow migration between hosts with different processor manufacturers. You cannot live migrate a running VM from an Intel host to an AMD host, or vice versa. For such moves, the VM must be shut down and restarted on the new host.

## Prerequisites and configuration

Before configuring processor compatibility, ensure you meet the following prerequisites:

- Administrative access to the Hyper-V host or cluster.
- The VM must be powered off. Processor compatibility mode cannot be enabled or disabled while the VM is running.
- For dynamic processor compatibility mode, the VM must use configuration version 10.0 or later.

To configure the setting, you can use Hyper-V Manager, PowerShell, or Windows Admin Center.

### Using PowerShell

PowerShell provides precise control over the compatibility mode. To enable standard processor compatibility mode, run:

```powershell
Set-VMProcessor -VMName ExampleVMName -CompatibilityForMigrationEnabled $true
```

To enable dynamic processor compatibility mode on a supported cluster, run:

```powershell
Set-VMProcessor -VMName ExampleVMName -CompatibilityForMigrationEnabled $true -CompatibilityForMigrationMode CommonClusterFeatureSet
```

To disable processor compatibility mode, run:

```powershell
Set-VMProcessor -VMName ExampleVMName -CompatibilityForMigrationEnabled $false
```

### Using Windows Admin Center

In Windows Admin Center, connect to your cluster, select the VM, shut it down, and navigate to **Settings > Processors**. You can choose between **Compatible across the cluster (Recommended)** for dynamic mode or **Compatible across other hosts with the same CPU manufacturer** for standard mode.

![Screenshot of the checkbox to enable processor compatibility.](/images/posts/2026/azc-273-learn-2.png)

## Verify processor features

After configuring processor compatibility, you should verify that the VM has the expected set of features available. This is particularly important if you are troubleshooting migration failures or performance issues.

On a Windows VM, you can use the Sysinternals Coreinfo tool. Run the following command in PowerShell:

```powershell
./Coreinfo.exe -f
```

The output will list processor features, with an asterisk (*) indicating availability. When processor compatibility mode is enabled, you will see that some features are unavailable (indicated by a dash `-`) compared to the host output.

For Linux VMs, you can check the processor flags using:

```bash
lscpu | grep Flags
```

A reduced list of flags compared to the host indicates that processor compatibility mode is active and limiting the available features.

## Migration scenarios between clusters

When live migrating VMs between separate clusters, the processor compatibility settings determine the outcome:

- **New to same processors**: The VM capabilities are transferred. Processor compatibility mode is not required but leaving it enabled causes no issues.
- **Older to newer processors**: The VM capabilities are transferred. Upon restart, the VM receives the latest calculated capability of the destination cluster.
- **Newer to older processors**: You must set the VM to use the `MinimumFeatureSet` for migration. This ensures the VM can move to hosts with older processors. After migration, restart the VM to receive the destination cluster's capabilities.

Microsoft recommends enabling processor compatibility mode only during the migration process and disabling it afterwards to allow the VM to take full advantage of the host's processor capabilities. If you have a cluster with different processor generations, you need to leave processor compatibility mode enabled for live migration to work.

### Next steps

Before executing the live migration, confirm the processor compatibility mode and configuration version. Use dynamic mode for clusters with mixed generations to balance performance and mobility, and standard mode for broader cross-host compatibility. Verify the feature set using Coreinfo or lscpu to ensure the VM is configured as expected. If migration fails, check that the source and destination hosts share the same processor manufacturer and that the VM is not using features unavailable on the target host.

References for Review CPU compatibility before moving a VM: [Configure processor compatibility in Hyper-V virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/configure-processor-compatibility-mode), [Dynamic Processor compatibility mode](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/dynamic-processor-compatibility-mode), [Processor compatibility for Hyper-V virtual machines](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/processor-compatibility-mode).
