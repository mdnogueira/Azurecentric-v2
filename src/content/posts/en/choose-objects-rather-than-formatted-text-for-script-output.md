---
title: "Choose objects rather than formatted text for script output"
description: "Why PowerShell scripts should handle objects, not text, and how to use Get-Member to verify pipeline data."
pubDate: 2024-05-27
category: automation
tags: ["powershell", "objects", "pipeline", "get-member", "scripting"]
translationKey: choose-objects-rather-than-formatted-text-for-script-output
draft: false
---

You are writing a script to check service statuses. You see `Get-Service` returns a table, so you think you need to parse that text. That is a trap. PowerShell does not send text to the pipeline. It sends objects. Treating them as text breaks automation the moment the display format changes.

The difference between a script that works and one that fails in the next release often comes down to whether you are handling objects or strings. When you pipe output from one cmdlet to another, you are passing .NET objects, not formatted lines of text. This distinction is not just semantic; it determines whether your code is robust, readable, and maintainable.

## The pipeline carries objects, not text

Every cmdlet in PowerShell produces output that flows through the pipeline. By default, the host application (like the console or Visual Studio Code) takes those objects and formats them into text for your eyes. That text is the end of the line for human consumption, but it is not what moves between commands.

As documented in the PowerShell developer guide, cmdlets report success by returning an object via the `WriteObject` method. This object can be processed by the next command in the pipeline. If you use `Write-Host` or `Console.WriteLine` inside a cmdlet, you are bypassing the pipeline entirely and sending data directly to the host display. This is generally discouraged for reusable code because that output cannot be captured or piped by subsequent commands.

Consider the Windows Time service. When you run:

```powershell
Get-Service -Name w32time
```

The console shows:

```Output
Status   Name               DisplayName
------   ----               -----------
Running  w32time            Windows Time
```

It looks like text. But it is not. The object returned is a `System.ServiceProcess.ServiceController`. You can verify this by piping to `Get-Member`:

```powershell
Get-Service -Name w32time | Get-Member
```

The output reveals the `TypeName` is `System.ServiceProcess.ServiceController`. This object has properties like `Status`, `Name`, and `DisplayName`, as well as methods like `Start()` and `Stop()`. Because it is an object, you can interact with its properties directly without parsing strings.

## Why formatting breaks automation

PowerShell uses XML-based formatting files (`.format.ps1xml`) to determine how to display objects by default. For example, process objects are formatted using `DotNetTypes.format.ps1xml`. If a cmdlet developer decides to change the default display properties in a future update, any script that relies on parsing the text output will break.

If you need to view all properties of an object, use `Select-Object`. This cmdlet selects properties from the object itself, not from the formatted text representation. For example:

```powershell
Get-Service -Name w32time | Select-Object -Property Status, Name, DisplayName, ServiceType
```

This returns a new object containing only those specific properties. You can then pipe this to another cmdlet that expects those properties. If you had used `Format-Table` to display the data, the pipeline would receive formatting control objects, not the original service object. Subsequent commands would fail because they cannot find the expected properties on a formatting object.

## Discovering what you can do with objects

The key to effective scripting is knowing what properties and methods are available on the objects you receive. `Get-Member` is the primary tool for this. It shows you the formal name of the object type and a complete listing of its members.

You can filter the output of `Get-Member` to focus on what you need. For instance, to see only the methods available on a service object:

```powershell
Get-Service -Name w32time | Get-Member -MemberType Method
```

This lists methods like `Start`, `Stop`, `Pause`, and `Continue`. While you can call these methods directly, such as `(Get-Service -Name w32time).Stop()`, it is often better to use dedicated cmdlets like `Stop-Service`. Cmdlets often provide additional functionality, such as the `PassThru` parameter, which allows a cmdlet that normally produces no output to return an object representing the changed state. This is safer and more consistent than relying on methods.

## Practical implications for your scripts

1. **Never parse text output.** If you find yourself using `Substring`, `Split`, or regular expressions on the output of a cmdlet, you are likely doing it wrong. Use `Select-Object` to pick the properties you need.
2. **Use `Get-Member` to explore.** Before writing a pipeline, pipe the output to `Get-Member` to see the `TypeName` and available properties. This tells you exactly what data you have access to.
3. **Avoid `Write-Host` in modules.** If you are writing reusable code, use `Write-Output` (or just output the object) so the data can be captured. Use `Write-Host` only for interactive feedback that should not be captured.
4. **Understand the streams.** PowerShell has multiple output streams: success, error, verbose, debug, and warning. The pipeline only carries success output by default. If you need to capture verbose or warning messages, you must use the corresponding common parameters (`-Verbose`, `-WarningAction`, etc.).

By focusing on objects, you write scripts that are resilient to changes in display formatting and easier to maintain. The pipeline is designed to pass structured data, not text. Embrace it.


References for Choose objects rather than formatted text for script output: [Discovering objects, properties, and methods](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/03-discovering-objects), [Viewing object structure](https://learn.microsoft.com/en-us/powershell/scripting/samples/Viewing-Object-Structure--Get-Member-), [Types of Cmdlet Output](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/types-of-cmdlet-output).
