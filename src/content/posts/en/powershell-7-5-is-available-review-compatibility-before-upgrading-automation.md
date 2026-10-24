---
title: "PowerShell 7.5 is available: review compatibility before upgrading automation"
description: "Review PowerShell 7.5 compatibility before upgrading automation, focusing on .NET 9 changes and module support."
pubDate: 2025-02-15
category: automation
tags: ["powershell", "azure-automation", "net-9", "compatibility", "upgrade"]
translationKey: powershell-7-5-is-available-review-compatibility-before-upgrading-automation
draft: true
---

PowerShell 7.5 is generally available. It is built on .NET 9 and is supported for 18 months as a standard support release. If you are running automation workloads on PowerShell 7.4, the immediate question is whether to upgrade the managed runtime now or wait. The answer depends on your dependency chain: the modules you use, the .NET APIs they call, and the platform where the automation runs.

## Check module compatibility first

[![PowerShell 7.5 Upgrade Flow](/images/posts/2025/azc-147-checkpoints.svg)](/images/posts/2025/azc-147-checkpoints.svg)

PowerShell 7 is designed to run side-by-side with Windows PowerShell 5.1, but it is built on .NET (version 9 in 7.5), whereas Windows PowerShell 5.1 runs on the .NET Framework 4.x. This architectural difference means that scripts calling .NET methods directly may behave differently. The PowerShell team has improved compatibility with existing Windows PowerShell modules, and many Microsoft modules, including Azure PowerShell and Active Directory, already work with PowerShell 7. However, compatibility is not guaranteed for every module.

Before upgrading, verify the modules your automation uses. The [PowerShell 7 module compatibility](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/module-compatibility) page lists known compatible modules. For example, the Az PowerShell module recommends PowerShell 7.0.6 LTS or higher, and the Microsoft Graph SDK recommends PowerShell 7 and later. If your automation uses these, 7.5 is likely compatible. If it uses older or custom modules, test them in an isolated environment first.

## Review .NET 9 breaking changes

PowerShell 7.5 is built on .NET 9.0. Each new PowerShell release is built on a newer .NET version, and breaking changes in .NET can affect PowerShell scripts, especially those that call .NET methods directly. For instance, .NET 9 may introduce new overloads for constructors or modify existing methods. If your scripts use `New-Object` or the `[type]::new()` method, review the .NET 9 breaking changes documentation to ensure your code binds to the correct overload.

Additionally, some cmdlets were removed or changed between Windows PowerShell and PowerShell 7. For example, `Get-WmiObject` is replaced by `Get-CimInstance`, and `*-EventLog` cmdlets are replaced by `Get-WinEvent`. If your automation uses these, ensure they are updated. The [Differences between Windows PowerShell 5.1 and PowerShell 7.x](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/differences-from-windows-powershell) article provides a detailed list of changes.

## Upgrade steps for local and managed environments

PowerShell 7 is designed to coexist with Windows PowerShell 5.1. It installs to a new directory, enabling side-by-side execution with Windows PowerShell 5.1. The new location is added to your PATH allowing you to run both Windows PowerShell 5.1 and PowerShell 7. If you're migrating from PowerShell 6.x to PowerShell 7, PowerShell 6 is removed and the PATH replaced.

In Windows PowerShell, the PowerShell executable is named `powershell.exe`. In version 6 and above, the executable is named `pwsh.exe`. The new name makes it easy to support side-by-side execution of both versions.

### Windows installation

For flexibility and to support the needs of IT, DevOps engineers, and developers, there are several options available to install PowerShell 7. In most cases, the installation options can be reduced to the following methods:

- Deploy PowerShell using the MSI package
- Deploy PowerShell using the ZIP package

> [!NOTE]
> The MSI package can be deployed and updated with management products such as Microsoft Configuration Manager. Download the packages from GitHub Release page.

Deploying the MSI package requires Administrator permission. The ZIP package can be deployed by any user. The ZIP package is the easiest way to install PowerShell 7 for testing, before committing to a full installation.

You may also install PowerShell 7 via the Windows Store or `winget`. For more information about both of these methods, see the detailed instructions in Installing PowerShell on Windows.

### Linux and macOS installation

PowerShell 7 is supported on Windows, Linux, and macOS. Consult the documentation for installation instructions and supported platforms.

### Azure Automation

Azure Automation runbooks execute in a managed container environment. You cannot install PowerShell 7.5 locally on the worker using an MSI or ZIP package. Instead, you must update the environment configuration to use the new runtime version. This process is reversible and does not require uninstalling the previous version.

1. **Update the environment**: In the Azure portal, navigate to your Automation Account and select **Runtime versions**. Change the PowerShell 7 version to 7.5. Alternatively, use the Azure Automation API or ARM templates to update the version programmatically.
2. **Test your automation**: Run your automation scripts in PowerShell 7.5 in a non-production environment. Check for errors related to module compatibility, .NET method calls, or removed cmdlets.
3. **Update profiles and paths**: PowerShell 7 uses separate profiles and module paths. Ensure your automation scripts reference the correct paths. The default module path for PowerShell 7 includes both PowerShell 7 and Windows PowerShell paths, allowing autoloading of modules.
4. **Verify remoting**: If your automation uses PowerShell remoting, ensure the remote endpoints are configured for PowerShell 7. PowerShell 7 can use the existing Windows PowerShell 5.1 endpoint or its own endpoint. Run `Enable-PSRemoting` to configure the PowerShell 7 endpoint if needed.
5. **Monitor and rollback**: After upgrading, monitor your automation for errors. If issues arise, you can quickly roll back to PowerShell 7.4 by reverting the Azure Automation environment to the previous PowerShell version via the Azure Portal or Azure PowerShell cmdlets.

## Consider the support lifecycle

## Final verification

After upgrading, verify your automation by running a full test suite in PowerShell 7.5. Check for any errors or warnings related to module compatibility, .NET method calls, or removed cmdlets. If everything works, you can confidently move your automation to PowerShell 7.5. If issues arise, use the `UseWindowsPowerShell` switch or roll back to 7.4.

The key is to test thoroughly before upgrading. PowerShell 7.5 offers significant improvements, but compatibility is not guaranteed for every module. By checking your dependencies and testing in an isolated environment, you can ensure a smooth transition.

For more information, refer to the [PowerShell 7.5 announcement](https://devblogs.microsoft.com/powershell/announcing-powershell-7-5-ga/) and the [Migrating from Windows PowerShell 5.1 to PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/Migrating-from-Windows-PowerShell-51-to-PowerShell-7) guide.
