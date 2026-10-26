---
title: "Auto shutdown an Azure VM with PowerShell"
description: "At one of my costumers, after starting the process of Azure Governance, it come to my attention the following scenario, the majority of the Virtual Machines on the DevTest Labs…"
pubDate: 2019-01-29
category: powershell
tags: ["powershell", "azure-virtual-machines", "devtest-labs"]
translationKey: auto-shutdown-an-azure-vm-with-powershell
legacy: true
legacyUrl: /2019/01/auto-shutdown-an-azure-vm-with-powershell.html
---

At one of my costumers, after starting the process of Azure Governance, it come to my attention the following scenario, the majority of the Virtual Machines on the DevTest Labs were with no auto shutdown configuration.

That can be setup easily, although we want to make sure that we wanted to introduce a mechanism that will enforce the shutdown of those virtual machine, even if that configuration is not setup. One of the ways to make sure, is to correct the deployment of those workloads from the Azure DevOps side, by enforcing the auto shutdown field to be mandatory.

On the other hand, we wanted to make sure, if anyone used an old template or using the portal, we could reduce the cost of running those workloads, by implementing an enforce mechanism to shutdown the workloads without any auto shutdown configuration.

The solution that we create was based on an Azure automation. We create a runbook that validate if the workload has the auto shutdown configuration, if not, Azure Automation will shutdown that workload. A very simple runbook, although very effective to reduce the cost and implement an overall auto shutdown policy to those kinds of workloads.

This is the script that we used:

    ```powershell

$RunningVMs = Get-AzureRmVM -Status | Where-Object {$_.PowerState -eq "VM running" -and $_.Tags["ShutdownPolicy"] -ne "Excluded"}
$DevTestLabs = Get-AzureRmResource | Where-Object {$_.ResourceType -eq "Microsoft.DevTestLab/schedules"}

$RunningVMs | ForEach-Object -Process {
    $ShutDownName = "shutdown-computevm-{0}" -f $_.Name
    if ($DevTestLabs.Name -notcontains $ShutdownName) {
        Write-Output "Will shutdown VM $($_.Name)"
        $_ | Stop-AzureRmVM -Force -Confirm:$false
    }
}
    ```

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
