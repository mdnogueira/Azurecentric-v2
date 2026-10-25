---
title: "PowerShell 7.6 LTS: prepare an automation compatibility check"
description: "Audit PowerShell 7.6 LTS compatibility: check ThreadJob rename, Join-Path changes, and .NET 10 dependencies before production deployment."
pubDate: 2026-03-19
category: automation
tags: ["automation", "compatibility", "lts", "breaking-changes"]
translationKey: powershell-7-6-lts-prepare-an-automation-compatibility-check
draft: false
---

PowerShell 7.6 is now generally available as a Long Term Support (LTS) release, built on .NET 10. The announcement explicitly positions it as the recommended version for production automation environments [PowerShell 7.6 LTS: prepare an automation compatibility check](https://devblogs.microsoft.com/powershell/announcing-powershell-7-6/). However, moving from a previous LTS version or Windows PowerShell 5.1 requires a structured compatibility check. You cannot assume that because PowerShell 7 runs side-by-side with Windows PowerShell, every script or module will behave identically [Migrating from Windows PowerShell 5.1 to PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/Migrating-from-Windows-PowerShell-51-to-PowerShell-7).

The first step is to identify which modules in your automation estate are affected by the breaking changes introduced in 7.6. The release notes highlight a small number of changes intended to improve long-term consistency, but they are significant enough to break existing workflows if untested [PowerShell 7.6 LTS: prepare an automation compatibility check](https://devblogs.microsoft.com/powershell/announcing-powershell-7-6/).

[![PowerShell 7.6 Compatibility Check Flow](/images/posts/2026/azc-289-checkpoints.svg)](/images/posts/2026/azc-289-checkpoints.svg)

## Check the ThreadJob module rename

One of the most common points of failure is the renaming of the `ThreadJob` module. In PowerShell 7.6, the `Microsoft.PowerShell.ThreadJob` module replaces the standalone `ThreadJob` module [What's New in PowerShell 7.6](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/What-s-New-in-PowerShell-76). The `Start-ThreadJob` cmdlet itself has not changed, so scripts using the cmdlet directly will continue to work. However, any script that explicitly references the module-qualified name, such as `ThreadJob\Start-ThreadJob`, will fail [What's New in PowerShell 7.6](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/What-s-New-in-PowerShell-76).

You can audit your scripts for this pattern using a simple search. If you are using a version control system, a repository-wide search for `ThreadJob\` will quickly identify affected files. If you are maintaining scripts locally, you can run a command like this to find references:

```powershell
# Illustrative example: search for module-qualified ThreadJob references
Select-String -Path .\Scripts\*.ps1 -Pattern 'ThreadJob\\'
```

If you find matches, update the references to `Microsoft.PowerShell.ThreadJob\Start-ThreadJob` or, preferably, remove the module qualifier entirely and rely on the cmdlet name, which is now part of the `Microsoft.PowerShell.ThreadJob` module [What's New in PowerShell 7.6](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/What-s-New-in-PowerShell-76).

## Verify Join-Path parameter changes

The `Join-Path` cmdlet has undergone a parameter type change. The `-ChildPath` parameter is now a `string[]` array, allowing you to pass multiple child paths directly and avoiding the need for `-AdditionalChildPath` [PowerShell 7.6 LTS: prepare an automation compatibility check](https://devblogs.microsoft.com/powershell/announcing-powershell-7-6/). While this is a flexibility improvement, it is technically a breaking change if your scripts rely on the previous string-only behaviour or if they pass arrays in a way that was previously rejected or handled differently [What's New in PowerShell 7.6](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/What-s-New-in-PowerShell-76).

Test your critical path-building logic. If you are constructing paths dynamically from arrays, verify that the output matches your expectations. The change allows for more intuitive usage, but existing code that might have been relying on implicit string conversion or specific error handling for non-string inputs could behave differently.

## Assess module compatibility with .NET 10

PowerShell 7.6 is built on .NET 10.0 [What's New in PowerShell 7.6](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/What-s-New-in-PowerShell-76). This is a significant shift from previous versions built on .NET 8.0 or earlier. Differences between .NET versions can affect script behaviour, particularly if you are calling .NET methods directly or using modules that have deep dependencies on the underlying runtime [Migrating from Windows PowerShell 5.1 to PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/Migrating-from-Windows-PowerShell-51-to-PowerShell-7).

Check the compatibility status of your key modules. The Azure Az PowerShell module recommends PowerShell 7.0.6 LTS or higher, so it should be compatible [PowerShell 7 module compatibility](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/module-compatibility). The Microsoft Graph PowerShell SDK also recommends PowerShell 7 and later [PowerShell 7 module compatibility](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/module-compatibility). However, for other modules, you need to verify their specific requirements. The PowerShell 7 module compatibility list provides a partial view of supported modules, but you should consult the documentation for each module you depend on [PowerShell 7 module compatibility](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/module-compatibility).

Use the `Get-Module` cmdlet to list the modules currently loaded in your target environment and check their versions and dependencies. Pay attention to any modules that are not part of the PowerShell core or Microsoft ecosystem, as their compatibility with .NET 10 is not guaranteed by the PowerShell team.

## Review experimental features and new capabilities

PowerShell 7.6 converts several experimental features to mainstream, including `PSFeedbackProvider`, `PSNativeWindowsTildeExpansion`, `PSRedirectToVariable`, and `PSSubsystemPluginModel` [What's New in PowerShell 7.6](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/What-s-New-in-PowerShell-76). If your scripts were relying on these features being experimental or disabled, they are now always available. This is generally positive, but it means you no longer need to manage their experimental status.

Conversely, new experimental features have been added, such as `PSSerializeJSONLongEnumAsNumber`, which changes how `ConvertTo-Json` handles large enums [What's New in PowerShell 7.6](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/What-s-New-in-PowerShell-76). If your automation relies on specific JSON serialization behaviour for large enum values, this could be a breaking change. Review the experimental features list to see if any new capabilities affect your output formats.

## Plan the deployment and verification

Once you have audited your scripts and modules, you can plan the deployment. PowerShell 7 installs side-by-side with Windows PowerShell 5.1, using a separate installation path (`$Env:ProgramFiles\PowerShell\7`) and executable name (`pwsh.exe`) [Migrating from Windows PowerShell 5.1 to PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/Migrating-from-Windows-PowerShell-51-to-PowerShell-7). This allows you to test the new version in isolation before switching your automation hosts.

Use the `winget` package manager or the MSI package for deployment. The MSI package is suitable for enterprise deployment via tools like Microsoft Configuration Manager, while `winget` is easier for individual testing [Migrating from Windows PowerShell 5.1 to PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/Migrating-from-Windows-PowerShell-51-to-PowerShell-7). Remember that the MSI package requires Administrator permission, whereas the ZIP package can be deployed by any user [Migrating from Windows PowerShell 5.1 to PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/Migrating-from-Windows-PowerShell-51-to-PowerShell-7).

After installation, verify the version using `pwsh -Version`. Then, run your compatibility audit scripts and test your critical automation workflows. Check the event logs, as PowerShell 7 logs to separate event logs from Windows PowerShell, which helps in diagnosing issues [Migrating from Windows PowerShell 5.1 to PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/Migrating-from-Windows-PowerShell-51-to-PowerShell-7).

The goal is not just to install PowerShell 7.6, but to ensure your automation is resilient to the breaking changes and benefits from the reliability improvements in the new LTS release. Start with a non-production environment, validate the changes, and then expand to production. The PowerShell team has focused on consistency and fixing long-standing issues, so the transition should be smoother than previous major version jumps, provided you check your specific dependencies [PowerShell 7.6 LTS: prepare an automation compatibility check](https://devblogs.microsoft.com/powershell/announcing-powershell-7-6/).
