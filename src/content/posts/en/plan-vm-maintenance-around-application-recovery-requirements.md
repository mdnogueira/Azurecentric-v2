---
title: "Plan VM maintenance around application recovery requirements"
description: "Align VMSS maintenance with recovery needs by distinguishing self-service host reboots from OS upgrade windows."
pubDate: 2026-09-28
category: compute
tags: ["virtual-machine-scale-sets", "maintenance", "self-service-maintenance", "maintenance-control", "high-availability"]
translationKey: plan-vm-maintenance-around-application-recovery-requirements
draft: false
---

You are planning maintenance for a Virtual Machine Scale Set (VMSS) because your application recovery requirements demand control over the reboot sequence. This usually means you need to ensure front-end instances are drained before back-end instances restart, or that you have more than 30 minutes to verify stability between update domains. To achieve this, you must distinguish between two different maintenance events: host infrastructure updates and automatic OS image upgrades. Only one of these gives you the immediate control you need to sequence reboots safely.

## Distinguish host maintenance from OS upgrades

Azure performs host infrastructure updates periodically to improve reliability, performance, and security. Most of these updates do not affect the hosted VMs. However, if the maintenance requires a reboot, Azure sends a notification and opens a self-service window. This window typically lasts 35 days. During this period, you can choose when to start the maintenance for your VMs. After the self-service window closes, Azure schedules the maintenance in waves, applying it update domain by update domain, with at least a 30-minute pause between domains.

Separately, if you have enabled automatic OS image upgrades on your VMSS, Azure will periodically upgrade the guest OS. This is a different process. You can control when these upgrades happen by creating a maintenance configuration. This configuration defines a recurring maintenance window, which must be at least 5 hours long and recur at least daily.

The key distinction is this: self-service maintenance lets you trigger a reboot for a specific host maintenance event at a time you choose, within a 35-day window. Maintenance control lets you define a recurring schedule for automatic OS upgrades. You cannot use maintenance control to delay or sequence host maintenance reboots; you must use the self-service window for that.

## Plan for application recovery with self-service maintenance

Self-service maintenance is the tool you use when your application recovery requirements demand control over the reboot sequence. This is particularly important for multi-tier applications where you need to ensure that front-end instances are drained and replaced before back-end instances are rebooted, or where you need to guarantee that a certain number of instances are available during the transition.

The documentation explicitly states that self-service maintenance is recommended if you need to control the sequence of maintenance to guarantee safe recovery. It is also recommended if you need more than 30 minutes of VM recovery time between two update domains. The 30-minute pause is Azure's default behaviour during scheduled maintenance, but if your application needs more time to stabilize, you must trigger maintenance manually, one update domain at a time.

However, self-service maintenance is not a universal solution. It is not recommended for deployments that use availability sets, as Azure handles update domain sequencing automatically for those. It is also not recommended if you frequently shut down VMs, use short-lived VMs, or have large state stored on ephemeral disks that you want to preserve after the update. In these cases, letting Azure trigger the maintenance is safer.

To use self-service maintenance, you need to identify which VMs are in the self-service window. You can do this in the Azure portal by adding the "Self-service maintenance" column to your VMSS list view. If the value is "Yes", you can start maintenance at any time. You can also use PowerShell or the CLI to check the maintenance status. For example, in PowerShell:

```powershell
# Illustrative example: check maintenance status for a specific VM instance
Get-AzVmssVm -ResourceGroupName rgName -VMScaleSetName vmssName -InstanceId 0 -InstanceView
```

This command returns the `MaintenanceRedeployStatus` object, which includes `IsCustomerInitiatedMaintenanceAllowed`, `PreMaintenanceWindowStartTime`, and `PreMaintenanceWindowEndTime`. If `IsCustomerInitiatedMaintenanceAllowed` is true, you can start the maintenance using:

```powershell
# Illustrative example: start maintenance for a specific VM instance
Set-AzVmssVM -ResourceGroupName rgName -VMScaleSetName vmssName -InstanceId 0 -PerformMaintenance
```

Once you start maintenance, the affected VMs are temporarily unavailable. If you have a multi-tier application, you should start maintenance on one update domain, wait for the application to recover and verify stability, and then proceed to the next domain. This gives you the control you need to meet your recovery time objectives.

## Control OS image upgrades with maintenance configurations

For automatic OS image upgrades, you use maintenance configurations. This is a separate feature that lets you define a recurring window when Azure will apply the upgrades. This is useful if you want to ensure that OS upgrades happen during a specific time of day or week, rather than at random intervals.

To create a maintenance configuration, you need to provide a name, choose a region, and set the scope to "OS image upgrade". You then define a schedule with a start date, a maintenance window duration (at least 5 hours), and a recurrence (at least daily). Finally, you assign the configuration to your VMSS.

```powershell
# Illustrative example: create a maintenance configuration for OS upgrades
# Note: This is an illustrative example. Prerequisites include Resource Contributor access.
New-AzMaintenanceConfiguration -ResourceGroupName rgName -Name "MyOSUpgradeConfig" -Location "East US" -Scope "OSImageUpgrade"
```

Once the configuration is created, you assign it to your VMSS. Azure will then apply OS upgrades during the defined window. This is a proactive measure to keep your VMs patched, but it does not give you the same level of control over the reboot sequence as self-service maintenance. If your application recovery requirements depend on controlling the reboot order, you still need to rely on self-service maintenance for host maintenance events.

## Verify your plan

The first thing to check is whether your VMSS is affected by a host maintenance wave. If it is, check the self-service window status. If you need to control the reboot sequence, use the self-service window to trigger maintenance one update domain at a time. If you do not need to control the sequence, you can let Azure handle it during the scheduled maintenance window.

For OS upgrades, check if a maintenance configuration is assigned to your VMSS. If not, create one to ensure upgrades happen during your preferred window. Remember that maintenance configurations do not affect host maintenance reboots. They are for OS image upgrades only.

Finally, verify that your application recovers correctly after each maintenance event. Monitor the health signals and ensure that the recovery time meets your objectives. If it does not, adjust your self-service maintenance strategy or your application architecture accordingly.

The goal is not to avoid maintenance, but to plan for it in a way that aligns with your application's recovery requirements. By distinguishing between host maintenance and OS upgrades, and by using the right tools for each, you can ensure that your VMSS remains available and stable during updates.


References for Plan VM maintenance around application recovery requirements: [Maintenance notifications for Virtual Machine Scale Sets in Azure](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-maintenance-notifications), [Maintenance control for OS image upgrades on Azure Virtual Machine Scale Sets using Azure portal](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machine-scale-sets-maintenance-control-portal), [Overview of Maintenance control for OS image upgrades on Azure Virtual Machine Scale Sets](https://learn.microsoft.com/en-us/azure/virtual-machines/virtual-machine-scale-sets-maintenance-control).
