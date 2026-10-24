---
title: "Write a reusable function with clear parameters"
description: "Write reusable PowerShell functions with clear parameters, validation, and help."
pubDate: 2024-04-01
category: automation
tags: ["powershell", "functions", "parameters", "validation", "help"]
translationKey: write-a-reusable-function-with-clear-parameters
draft: true
---

You have a script that works for one server, but now you need it for ten. The temptation is to copy the script ten times and change the server name in each. That is not reuse; that is repetition. The correct step is to turn the logic into a function that accepts the server name as a parameter.

A well-written function is a tool you can drop into any script. It should be predictable, documented, and safe to run. The difference between a script fragment and a reusable function usually comes down to three things: naming, parameters, and help.

[![PowerShell Function Development Flow](/images/posts/2024/azc-033-checkpoints.svg)](/images/posts/2024/azc-033-checkpoints.svg)

## Name the function so it is discoverable

PowerShell has a list of approved verbs. If you use an unapproved verb in a function that ends up in a module, PowerShell generates a warning at load time. That warning makes the module look unprofessional and limits the discoverability of your command [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

Use a Pascal case name with an approved verb and a singular noun. The standard format is `<ApprovedVerb>-<Prefix><SingularNoun>`. You can see the approved verbs by running `Get-Verb` [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

```powershell
Get-Verb | Sort-Object -Property Verb
```

Prefixing the noun is not just a style choice; it prevents naming conflicts. A function named `Get-ServiceStatus` is likely to collide with other commands. A function named `Get-MrServiceStatus` is much safer [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

## Turn the script into an advanced function

A basic function in PowerShell is declared with the `function` keyword, but it lacks the behaviour of native cmdlets. To get common parameters like `Verbose`, `Debug`, `ErrorAction`, and `WarningAction`, you need an advanced function. You create one by adding the `[CmdletBinding()]` attribute to the function definition [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

```powershell
function Get-MrServiceStatus {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string[]]$ComputerName
    )

    foreach ($Computer in $ComputerName) {
        Write-Verbose -Message "Attempting to query service status on $Computer"
        Invoke-Command -ComputerName $Computer -ScriptBlock { Get-Service } -ErrorAction Stop
    }
}
```

Remote examples require authorised PowerShell remoting, endpoint access and suitable service permissions. They have not been executed against remote hosts. This example demonstrates how to accept an array of computer names and use `Write-Verbose` for progress reporting instead of inline comments [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

If your function makes changes to the system, you should also add `SupportsShouldProcess` to the `[CmdletBinding()]` attribute. This enables the `WhatIf` and `Confirm` parameters, which are essential for safe execution [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

```powershell
function Set-MrServiceState {
    [CmdletBinding(SupportsShouldProcess)]
    param (
        [Parameter(Mandatory)]
        [string[]]$ComputerName,

        [Parameter(Mandatory)]
        [string]$ServiceName
    )

    foreach ($Computer in $ComputerName) {
        if ($PSCmdlet.ShouldProcess("$Computer\$ServiceName", "Start service")) {
            Invoke-Command -ComputerName $Computer -ScriptBlock { param($Name) Start-Service -Name $Name } -ArgumentList $ServiceName -ErrorAction Stop
        }
    }
}
```

This is an illustrative example. It shows how to use `SupportsShouldProcess` to enable safe execution. Note that the `ShouldProcess` check is inside the loop. This ensures that `WhatIf` works correctly for each computer in the array, rather than failing to bind or behaving unexpectedly when passed multiple names [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

## Validate input early

Do not statically assign values inside your function. Use parameters and variables instead [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions). When naming your parameters, use the same name as the default cmdlets for your parameter names whenever possible. For example, use `ComputerName` rather than `Computer` or `ServerName` [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

Always type the variables that are being used for your parameters. This causes PowerShell to perform type checking and allows you to use parameter validation attributes [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

Validate input early on. Why allow your code to continue on a path when it is not possible to run without valid input? Use parameter validation attributes such as `ValidateNotNullOrEmpty`, `ValidateRange`, or `ValidatePattern` [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

If you want to allow for more than one value for a parameter, use the array syntax, such as `[string[]]$ComputerName` [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

If you want to specify a default value for a parameter, you cannot use `Mandatory` at the same time. Instead, use `ValidateNotNullOrEmpty` with a default value [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

```powershell
function Get-MrDefaultComputer {
    [CmdletBinding()]
    param (
        [ValidateNotNullOrEmpty()]
        [string[]]$ComputerName = 'localhost'
    )

    Write-Output $ComputerName
}
```

This is an illustrative example. It shows how to use a default value. Using `'localhost'` is a generic default that works in most contexts. Using `$env:COMPUTERNAME` ties the function to the local machine context, which may confuse users expecting a generic default [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

## Document your function

PowerShell scripts and functions should be fully documented whenever they are shared with others. The `Get-Help` cmdlet displays the script and function help topics in the same format as it displays help for cmdlets [Writing Help for PowerShell Scripts and Functions](https://learn.microsoft.com/en-us/powershell/scripting/developer/help/writing-help-for-windows-powershell-scripts-and-functions).

Use comment-based help to document your function. Place the help topic at the beginning of the function, before the `function` keyword [Writing Help for PowerShell Scripts and Functions](https://learn.microsoft.com/en-us/powershell/scripting/developer/help/writing-help-for-windows-powershell-scripts-and-functions).

```powershell
<#
.SYNOPSIS
    Gets the status of services on one or more computers.

.DESCRIPTION
    The Get-MrServiceStatus function queries the status of services on remote computers.
    It accepts an array of computer names and returns the service objects.

.PARAMETER ComputerName
    Specifies the computer names. This parameter is mandatory.

.EXAMPLE
    Get-MrServiceStatus -ComputerName Server01, Server02
    Gets the status of services on Server01 and Server02.

.EXAMPLE
    Get-MrServiceStatus -ComputerName Server01 -Verbose
    Gets the status of services on Server01 and displays verbose output.
#>
function Get-MrServiceStatus {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string[]]$ComputerName
    )

    foreach ($Computer in $ComputerName) {
        Write-Verbose -Message "Attempting to query service status on $Computer"
        Invoke-Command -ComputerName $Computer -ScriptBlock { Get-Service } -ErrorAction Stop
    }
}
```

This is an illustrative example. It demonstrates how to use comment-based help to document the function [Writing Help for PowerShell Scripts and Functions](https://learn.microsoft.com/en-us/powershell/scripting/developer/help/writing-help-for-windows-powershell-scripts-and-functions).

## Verify your function

Once you have written your function, verify that it works as expected. Use `Get-Command` to check the syntax and parameters [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

```powershell
Get-Command -Name Get-MrServiceStatus -Syntax
Get-Command -Name Get-MrServiceStatus | Select-Object -ExpandProperty Parameters
```

This is an illustrative example. It shows how to check the function's syntax and parameters [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

Use `Get-Help` to check the help topic [Writing Help for PowerShell Scripts and Functions](https://learn.microsoft.com/en-us/powershell/scripting/developer/help/writing-help-for-windows-powershell-scripts-and-functions).

```powershell
Get-Help Get-MrServiceStatus -Examples
```

This is an illustrative example. It shows how to check the help topic examples [Writing Help for PowerShell Scripts and Functions](https://learn.microsoft.com/en-us/powershell/scripting/developer/help/writing-help-for-windows-powershell-scripts-and-functions).

Test the function with different inputs to ensure it handles edge cases correctly [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

```powershell
Get-MrServiceStatus -ComputerName Server01, Server02 -Verbose
```

This is an illustrative example. It shows how to test the function with verbose output [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

If you need to remove the function from the current session, remove it from the Function PSDrive [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

```powershell
Remove-Item Function:\Get-MrServiceStatus
```

This is an illustrative example. It shows how to remove the function from the current session [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).

Check the `Get-Command` output again to confirm the function is gone. If it is still listed, it may be loaded from a module in your `$env:PSModulePath`. In that case, use `Remove-Module` to unload it [Functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/09-functions).
