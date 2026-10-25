---
title: "Install PowerShell 7.4 alongside Windows PowerShell"
description: "Install PowerShell 7.4 alongside Windows PowerShell 5.1 using MSI or ZIP, managing remoting endpoints and module paths."
pubDate: 2024-02-07
category: powershell
tags: ["powershell", "side-by-side", "windows", "installation", "remoting"]
translationKey: install-powershell-7-4-alongside-windows-powershell
draft: false
---

Installing PowerShell 7.4 does not require removing Windows PowerShell 5.1. We can retain the host used by existing automation while checking which scripts and modules work in the newer runtime. A successful installation is the first step; it does not migrate scheduled tasks or validate their dependencies.

Windows PowerShell uses `powershell.exe`, whereas PowerShell 7 uses `pwsh.exe`. An MSI installation normally places the newer executable in `C:\Program Files\PowerShell\7`. These separate executables let us choose the host explicitly. They do not provide complete module isolation: PowerShell 7 can also search Windows PowerShell module locations.

## Choosing an installation method

The method you choose depends on your environment and whether you need to manage updates centrally.

### For Windows clients: Winget

On Windows 10 and 11 client machines, the recommended approach is using `winget`, the Windows Package Manager. This tool is included with modern Windows versions as the **App Installer**. It simplifies installation and future upgrades.

First, verify the available version:

```powershell
winget search Microsoft.PowerShell
```

Then install the stable release:

```powershell
winget install --id Microsoft.PowerShell --source winget
```

Note that on x86 or x64 processors, `winget` installs the MSI package. On Arm64 systems, it installs the Microsoft Store (MSIX) package. The Store package has limitations, such as running in a sandbox that prevents system-level configuration changes like enabling WSMAN remoting. If you need full administrative control on Arm64 devices, consider the ZIP or MSI method instead.

### For servers and enterprise deployment: MSI package

For Windows Server or managed deployment through Configuration Manager, the MSI package provides an explicit installer to distribute. It requires administrator permissions. Plan updates separately rather than assuming that distributing the installer establishes a servicing process.

Download the MSI from the [PowerShell GitHub releases page](https://github.com/PowerShell/PowerShell/releases). The file is typically named `PowerShell-7.4.1-win-x64.msi`.

For this illustrative x64 example, launch the downloaded 7.4.1 installer from an elevated PowerShell session and review its installation choices. The command has not been executed for this article:

```powershell
Start-Process -FilePath msiexec.exe -ArgumentList '/i "PowerShell-7.4.1-win-x64.msi"' -Wait
```

Review PATH and update integration in the wizard. Enable remoting only when it is part of the machine's approved management configuration; it changes how the system can be managed and needs appropriate access and firewall controls.

### For testing or non-administrative users: ZIP package

If you do not have Administrator rights or need to install multiple versions side-by-side (e.g., 7.2 and 7.4), the ZIP package is the most flexible option. Download `PowerShell-7.4.1-win-x64.zip` from the GitHub releases page.

Verify the download's origin before unblocking it if necessary. Extract it to a directory you can write to. This illustrative example uses the current user's local application data directory:

```powershell
$trialDirectory = Join-Path $env:LOCALAPPDATA 'PowerShellTrial\7.4.1'
Expand-Archive -LiteralPath '.\PowerShell-7.4.1-win-x64.zip' -DestinationPath $trialDirectory
& (Join-Path $trialDirectory 'pwsh.exe') -NoProfile
```

You can then run `pwsh.exe` directly from that folder. Because this method does not modify the system PATH or registry, it does not interfere with Windows PowerShell 5.1. However, you must manually manage the PATH or invoke the executable by full path.

## Understanding side-by-side isolation

PowerShell 7.4 and Windows PowerShell 5.1 maintain separate environments to prevent conflicts.

### Separate installation paths and executables

As noted, the executables differ (`pwsh.exe` vs `powershell.exe`) and the installation directories are distinct. PowerShell 7.4 installs to `$env:ProgramFiles\PowerShell\7`. If you install a preview version, it goes to `$env:ProgramFiles\PowerShell\7-preview`, allowing you to run preview and stable releases simultaneously.

### Separate module paths

Each version maintains its own `$PSModulePath`. Windows PowerShell 5.1 looks in:

*   `$HOME\Documents\WindowsPowerShell\Modules`
*   `$env:ProgramFiles\WindowsPowerShell\Modules`
*   `$env:WINDIR\System32\WindowsPowerShell\v1.0\Modules`

PowerShell 7.4 includes its own paths but also appends the Windows PowerShell paths to support backward compatibility:

*   `$HOME\Documents\PowerShell\Modules`
*   `$env:ProgramFiles\PowerShell\Modules`
*   `$env:ProgramFiles\PowerShell\7\Modules`
*   `$env:ProgramFiles\WindowsPowerShell\Modules`
*   `$env:WINDIR\System32\WindowsPowerShell\v1.0\Modules`

Discovering a module does not establish compatibility. Where appropriate, `Import-Module -UseWindowsPowerShell` provides access through a Windows PowerShell compatibility session. That introduces remoting and object-serialization behaviour; check the operations your script performs rather than treating the switch as a universal fix.

### Separate profiles and logs

Profiles are stored in different locations. Windows PowerShell 5.1 uses `$HOME\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`, while PowerShell 7.4 uses `$HOME\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`. Customizations in one version will not affect the other.

Similarly, event logs are separate. You can view logs for both versions using:

```powershell
Get-WinEvent -ListLog *PowerShell*
```

This returns distinct logs for `Microsoft-Windows-PowerShell` (Windows PowerShell 5.1) and `PowerShell` (PowerShell 7.x).

## Configuring remoting

Starting PowerShell 7 locally does not establish which runtime a remote session will use. For WSMan connections, inspect the session configurations registered on the target and select the intended endpoint explicitly. The existing `Microsoft.PowerShell` endpoint is associated with Windows PowerShell.

If you want PowerShell 7.4 to have its own dedicated remoting endpoint, you must enable it explicitly. Run the following command in an elevated PowerShell 7.4 session:

```powershell
Enable-PSRemoting -Force
```

This creates a new endpoint for PowerShell 7. To identify the exact name of the new endpoint, run `Get-PSSessionConfiguration` in PowerShell 7. You can then connect to this specific endpoint using:

```powershell
$targetComputer = 'server01.contoso.example'
$endpointName = 'PowerShell.7'
Enter-PSSession -ComputerName $targetComputer -ConfigurationName $endpointName
```

Alternatively, PowerShell 7 supports SSH-based remoting, which is useful for cross-platform scenarios. This requires setting up SSH on the target machine and configuring PowerShell as an SSH subsystem.

## Verification and cleanup

After an MSI installation has made `pwsh.exe` available on PATH, run the following **from a PowerShell session**. For a ZIP installation, use the full path to its executable. These are illustrative checks, not captured test results:

```powershell
powershell.exe -NoProfile -Command '$PSVersionTable.PSVersion'
pwsh.exe -NoProfile -Command '$PSVersionTable.PSVersion'
```

Confirm that the first process reports Windows PowerShell 5.1 and the second reports the PowerShell 7.4 release you installed. Single quotes pass the expression to the child process without expanding it in the calling PowerShell session. Check the installation path as well:

```powershell
pwsh.exe -NoProfile -Command '$PSHOME'
```

This should return `C:\Program Files\PowerShell\7` for the MSI/Winget install, or your custom path for the ZIP install.

If you need to remove PowerShell 7.4, use the same installation method you used to install it. For MSI, use **Programs and Features** in the Control Panel. For Winget, run `winget uninstall --id Microsoft.PowerShell`. For ZIP, simply delete the folder. Note that uninstalling PowerShell 7.4 does not affect Windows PowerShell 5.1.

When migrating scripts, test their modules, authentication, output handling and error behaviour in PowerShell 7.4 before changing the scheduled task or deployment job. Specify the executable explicitly and retain the original task definition while assessing the replacement.

For enterprise management, consider installing the Group Policy templates located in `$PSHOME` using the `InstallPSCorePolicyDefinitions.ps1` script. This allows you to manage execution policies, logging, and transcription for PowerShell 7.4 via Group Policy, ensuring consistency across your fleet.

Choose the package around installation and update requirements, then check each task in its intended host. The useful result is a repeatable answer to three questions: which executable runs the task, which dependencies it loads, and how its result is verified.


Further documentation: [Installing PowerShell on Windows](https://learn.microsoft.com/en-us/powershell/scripting/install/Installing-PowerShell-on-Windows), [Migrating from Windows PowerShell 5.1 to PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/Migrating-from-Windows-PowerShell-51-to-PowerShell-7).
