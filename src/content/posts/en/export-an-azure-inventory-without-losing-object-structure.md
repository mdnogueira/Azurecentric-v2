---
title: "Export an Azure inventory without losing object structure"
description: "Export Azure VM inventory with nested network data using PowerShell and typed objects."
pubDate: 2024-09-13
category: automation
tags: ["azure-powershell", "inventory", "select-object", "get-member", "data-structures"]
translationKey: export-an-azure-inventory-without-losing-object-structure
draft: true
---

An Azure inventory should remain a collection of objects until you deliberately choose an export format. Formatting a list for the console and then exporting that formatted output can lose the properties you wanted to report.

Start with a clear inventory scope. For the illustrative example here, we want the names, locations and network-interface references of VMs in one resource group. The examples require an authenticated Az PowerShell session with permission to read the selected resources. Replace the example resource-group name before running them; no live Azure inventory was queried while preparing this article.

[![Azure VM Inventory Export Flow](/images/posts/2024/azc-092-checkpoints.svg)](/images/posts/2024/azc-092-checkpoints.svg)

## Inspect the objects first

Microsoft's guidance on [viewing object structure](https://learn.microsoft.com/en-us/powershell/scripting/samples/Viewing-Object-Structure--Get-Member-) explains how Get-Member exposes properties and methods. Use that inspection before writing a property path from memory.

```powershell
$resourceGroupName = 'ExampleResourceGroup'
$vms = @(Get-AzVM -ResourceGroupName $resourceGroupName)
$vms | Get-Member -MemberType Properties
```

Inspect a representative VM as well as the collection. A collection can contain resources with different configurations. Selecting the first item is a useful way to explore the shape, but it does not establish that every resource has the same optional properties.

```powershell
$vms | Select-Object -First 1 -ExpandProperty NetworkProfile |
    Format-List *
```

Format-List is used here only for interactive inspection. It is not part of the pipeline that produces the inventory file.

A VM's network profile contains references to network interfaces. Those references are not the complete network-interface resources and do not directly supply their IP configurations. If you need private IP addresses, retrieve the referenced network-interface resources separately and decide how to represent multiple interfaces and IP configurations. Do not report a missing property on a reference object as evidence that a VM has no IP address.

## Choose a useful row shape

Before flattening anything, decide what one row represents. A VM summary can have one row per VM. A detailed network report may need one row per interface or per IP configuration, with the VM resource ID included as a join key.

For this VM-level example, keep the resource ID, name, resource group, location and a readable list of interface resource IDs. A calculated property makes the flattening explicit:

```powershell
$rows = @(
    $vms | Select-Object -Property Id, Name, ResourceGroupName, Location,
        @{
            Name = 'NetworkInterfaceIds'
            Expression = {
                @($_.NetworkProfile.NetworkInterfaces |
                    ForEach-Object { $_.Id }) -join ';'
            }
        }
)
```

Microsoft's [Select-Object examples](https://learn.microsoft.com/en-us/powershell/scripting/samples/Selecting-Parts-of-Objects--Select-Object-) describe selecting properties and creating calculated values. The expression above gathers interface IDs rather than assuming that the first interface is sufficient.

The separator is an export decision. It makes a summary cell readable, but it no longer represents a nested array. A downstream consumer which needs to distinguish interfaces should receive a separate interface table or a structured format instead.

## Export objects, then inspect the file

Export the selected objects directly. Avoid placing Format-Table or Format-List before Export-Csv: their purpose is presentation rather than producing the resource records you selected.

```powershell
$exportPath = Join-Path $PWD 'vm-inventory.csv'
$rows | Export-Csv -LiteralPath $exportPath -NoTypeInformation -Encoding utf8
$roundTrip = @(Import-Csv -LiteralPath $exportPath)
$roundTrip | Select-Object -First 5
```

CSV stores a tabular representation. Imported values are strings, so a successful round trip does not preserve every original .NET type. Keep the in-memory objects if later processing needs typed values or nested resource structures.

## Check completeness as well as appearance

Compare the exported row count with the number of VMs collected for the intended scope. Check several resource IDs against the source collection and inspect resources with more than one interface. Confirm that an empty interface list has been investigated rather than silently treated as a healthy configuration.

Record the subscription context, resource-group scope and collection time alongside the report. Those details distinguish a current observation from an old file and help another operator repeat the inventory. When the report is no longer needed, remove the generated file according to the team's handling rules; resource names and topology can themselves be sensitive information.

If a required field is absent, return to the resource model and inspect the actual object. Add the missing lookup or change the report's scope before distributing a column of plausible-looking empty values.
