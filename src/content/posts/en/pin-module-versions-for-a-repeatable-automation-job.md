---
title: "Pin module versions for a repeatable automation job"
description: "Pin PowerShell module versions in automation to ensure predictable execution and avoid breaking changes from silent updates."
pubDate: 2026-03-22
category: powershell
tags: ["powershell", "automation"]
translationKey: pin-module-versions-for-a-repeatable-automation-job
draft: false
---

Automation breaks when a module updates silently. You run a script that worked yesterday, and today it fails because a cmdlet changed, a parameter was removed, or the output format shifted. The fix is not to stop updating modules; it is to pin the version your automation relies on.

PowerShell modules are designed to be discoverable and updatable, which is excellent for interactive use but risky for unattended jobs. When you call a cmdlet without specifying a version, PowerShell loads the highest installed version of that module. If your CI/CD pipeline, scheduled task, or deployment script does not explicitly request a version, it inherits whatever update landed on the system last.

## Why implicit loading is a risk

In PowerShell 3.0 and later, modules are imported automatically when you use a cmdlet or function from them. This is known as module auto-loading [Importing a PowerShell Module](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/importing-a-powershell-module). The system searches the directories listed in the `PSModulePath` environment variable to find the module [Installing a PowerShell Module](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/installing-a-powershell-module). If multiple versions of the same module are installed, the auto-loader picks the one that appears first in the path. While newer versions are often placed first, this is not guaranteed by the mechanism itself, making the claim technically inaccurate.

Consider a scenario where you have `Az.Compute` version 5.0 and version 6.0 installed. Version 6.0 might rename a cmdlet or change a default parameter value. If your script was written for 5.0, it will fail when 6.0 is loaded implicitly. The error might be subtle, such as a parameter not being recognised, or it might cause a complete pipeline failure. In an automation context, this failure can be silent if not monitored closely, leading to partial deployments or incorrect configurations.

## Pinning versions in your scripts

The most reliable way to prevent this is to use the `RequiredVersion` parameter when importing a module. This tells PowerShell to load exactly that version and fail if it is not available. This is a deliberate constraint that ensures consistency.

```powershell
# Illustrative example: Pinning a specific module version
Import-Module -Name "Az.Compute" -RequiredVersion "5.0.0"
```

If version 5.0.0 is not installed, the command fails immediately. This is preferable to a silent failure later in the script. You can also use `MinimumVersion` if you want to allow updates but only to newer versions that are backward compatible, though `RequiredVersion` is safer for strict automation.

## Managing multiple versions

You can install multiple versions of the same module on a single system. To do this, each version must be stored in a directory that includes the version number in its name [Installing a PowerShell Module](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/installing-a-powershell-module). For example:

```
C:\Program Files\WindowsPowerShell\Modules\
  Az.Compute\
    5.0.0\
      Az.Compute.psd1
      Az.Compute.psm1
    6.0.0\
      Az.Compute.psd1
      Az.Compute.psm1
```

The module manifest (`.psd1`) for each version must declare its own `ModuleVersion` key [Installing a PowerShell Module](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/installing-a-powershell-module). The installer or deployment process must add these directories to the `PSModulePath` environment variable [Installing a PowerShell Module](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/installing-a-powershell-module). When you run `Get-Module -ListAvailable`, you will see both versions listed.

If you import both versions into the same session, the commands from the last imported module take precedence [Installing a PowerShell Module](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/installing-a-powershell-module). This can lead to confusion if you are debugging, so it is best practice to import only the version you need for a specific task.

## Verification and cleanup

Before deploying your automation, verify that the required version is installed on the target system. You can do this by running:

```powershell
Get-Module -Name "Az.Compute" -ListAvailable | Where-Object { $_.Version -eq "5.0.0" }
```

If the result is empty, the script will fail at import time, which is the desired outcome. You can then update the script to use a different pinned version or install the missing version.

When you update your automation to use a new module version, update the `RequiredVersion` in your script and test thoroughly. Do not assume that a newer version is always better; it might introduce breaking changes. Pinning ensures that your automation runs the same code every time, regardless of what updates are available in the repository.

This approach shifts the responsibility for version management from the system's auto-loader to your script's explicit requirements. It is a small change in syntax but a significant improvement in reliability for any automated workflow.
