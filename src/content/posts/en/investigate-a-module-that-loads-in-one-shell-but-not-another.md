---
title: "Investigate a module that loads in one shell but not another"
description: "Troubleshoot a PowerShell module that loads in one shell but not another by comparing PSModulePath, profiles, and session state."
pubDate: 2024-11-11
category: powershell
tags: ["powershell", "troubleshooting", "modules", "profiles", "psmodulepath"]
translationKey: investigate-a-module-that-loads-in-one-shell-but-not-another
draft: false
---

You open two PowerShell windows. In one, `Import-Module MyModule` works. In the other, it fails with "The specified module 'MyModule' was not loaded". The module files are identical on disk. The difference is not the module itself, but the shell environment.

PowerShell loads modules into the active session. If a session cannot find the module, it is usually because the search path is incomplete, a startup script has not run, or the module is already loaded in a way that conflicts with the import. We need to check the environment variables and the startup sequence.

## Check the PSModulePath

PowerShell searches for modules in the directories listed in the `$env:PSModulePath` variable. If a module is installed in a directory not included in this list, PowerShell cannot find it implicitly or explicitly without a full path.

Run this in both shells to compare:

```powershell
$env:PSModulePath -split ';' | Sort-Object
```

Look for the directory where `MyModule` resides. If it is missing from one shell, that shell has a different environment configuration. This often happens if one shell is launched from a custom shortcut, a different user context, or a host that modifies the environment.

If the path is missing, you can add it temporarily to confirm:

```powershell
$env:PSModulePath += ";C:\Path\To\MyModule"
Import-Module MyModule
```

This confirms the path is the issue. To make it permanent, you need to add the directory to the system or user environment variables, or ensure the module is installed in a standard location like `$HOME\Documents\PowerShell\Modules`.

## Check the Profile Scripts

PowerShell runs a profile script on startup. This script can load modules, set variables, or change paths. If one shell runs a profile that loads `MyModule` and the other does not, you will see the discrepancy.

Check the profile path:

```powershell
$PROFILE
```

This returns the path to the current user, current host profile. Open this file and look for `Import-Module MyModule`. If it is present in one profile but not the other, that explains the difference.

PowerShell supports four profile scopes:

- **CurrentUserCurrentHost**: The default profile for the current user and host (e.g., PowerShell ISE, Console).
- **CurrentUserAllHosts**: Applies to all hosts for the current user.
- **AllUsersCurrentHost**: Applies to all users for the host.
- **AllUsersAllHosts**: Applies to all users and all hosts.

If you are using a specific host like Visual Studio Code, the profile file name is `Microsoft.VSCode_profile.ps1`. Check if `MyModule` is loaded in that specific profile.

## Check for Existing Module Instances

A common reason for import failure is that the module is already loaded in the session, but in a way that prevents re-import or hides the expected commands. If you try to import a module that is already loaded, PowerShell may not return an error, but it also won't reload it. If the initial load failed silently or loaded a different version, subsequent imports will not fix it.

Check if the module is already loaded:

```powershell
Get-Module MyModule
```

If it returns an object, the module is loaded. You can check the path of the loaded module to see if it is the correct version:

```powershell
(Get-Module MyModule).ModuleBase
```

If the module is loaded from an unexpected path, you may need to remove it before importing the correct one:

```powershell
Remove-Module MyModule
Import-Module MyModule
```

## Check Module Manifest and Exports

If the module is found but fails to load, check the manifest file (`.psd1`). The manifest defines what is exported. If the manifest has errors, or if it restricts exports in a way that conflicts with the caller, the import may fail.

Use the `-Verbose` parameter to see what is happening:

```powershell
Import-Module MyModule -Verbose
```

This will show the files being loaded and any errors during the import process. If the module has nested modules, ensure they are also accessible.

## Verify the Session State

Finally, check if the module is actually loaded:

```powershell
Get-Module MyModule
```

If it returns nothing, it is not loaded. If it returns an object, it is loaded. You can also check the `PSModulePath` in the session:

```powershell
$env:PSModulePath
```

This variable is the same as `$env:PSModulePath` but may be cached in some contexts. Ensure they match.

By systematically checking the path, profile, and session state, you can identify why a module loads in one shell but not another. The most common cause is a missing directory in `PSModulePath` or a profile script that has not run.

End with a verification step: once you have identified the difference, apply the fix (add the path, update the profile, or remove the existing module) and restart the shell to ensure the change takes effect. Then run `Import-Module MyModule` again to confirm it works in both shells.

If the issue persists, check for any custom host configurations or environment variables that might be overriding the standard PowerShell behavior. For example, if you are using a custom host like Visual Studio Code, ensure that the integrated terminal is using the correct PowerShell version and environment.

### Review Questions

- Is the module installed in a standard location like `$HOME\Documents\PowerShell\Modules`?
- Are both shells running the same version of PowerShell?
- Is the module script-based or binary?
- Are there any custom host configurations that might affect the module load?

### Tags

powershell, modules, troubleshooting, profiles, psmodulepath

References for Investigate a module that loads in one shell but not another: [Importing a PowerShell Module](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/importing-a-powershell-module), [Modules and Snap-ins](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/modules-and-snap-ins), [Customizing your shell environment](https://learn.microsoft.com/en-us/powershell/scripting/learn/shell/creating-profiles).
