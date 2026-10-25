---
title: "Check native command exit codes in an automation script"
description: "Native commands in PowerShell only set $LASTEXITCODE. Use a wrapper to trigger try/catch."
pubDate: 2025-08-18
category: automation
tags: ["powershell", "error-handling", "native-commands", "exit-codes", "troubleshooting"]
translationKey: check-native-command-exit-codes-in-an-automation-script
draft: false
---

You are writing an automation script in PowerShell. It calls a native command such as `git`, `curl`, or a custom executable. The command fails, but the script continues as if nothing happened. Or perhaps it stops with a generic error that hides the real cause. The root issue is usually a mismatch between how the native command reports failure and how PowerShell interprets that report.

PowerShell treats native command exit codes differently from cmdlet errors. By default, PowerShell does not treat a non-zero exit code as an error that stops execution or triggers a `catch` block. It simply records the exit code in the automatic variable `$LASTEXITCODE`. If you expect PowerShell to stop on failure, you need to configure it to do so.

## Understand the difference between cmdlet and native errors

Cmdlets written in .NET use PowerShell's error reporting mechanisms, which distinguish between terminating and non-terminating errors. A terminating error stops execution and can be caught with `try/catch`. A non-terminating error is recorded but allows execution to continue, unless `-ErrorAction Stop` is used.

Native commands, however, do not use these mechanisms. They return an integer exit code. PowerShell captures this in `$LASTEXITCODE`. If the command fails, `$LASTEXITCODE` will be non-zero, but PowerShell will not throw an exception unless explicitly told to.

This distinction is critical. If you wrap a native command in a `try/catch` block without ensuring it throws a terminating error, the `catch` block will never run, even if the command failed.

## Configure PowerShell to treat native failures as errors

To make PowerShell stop execution when a native command fails, you have two main options: use a wrapper function or use the `$ErrorActionPreference` variable in combination with a check.

### Using a wrapper function

The most reliable way to handle native command failures in a `try/catch` block is to wrap the command in a function that checks `$LASTEXITCODE` and throws if it is non-zero.

```powershell
function Invoke-NativeCommand {
    param(
        [string]$Command,
        [string]$Arguments
    )
    & $Command $Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Native command '$Command' failed with exit code $LASTEXITCODE"
    }
}

try {
    Invoke-NativeCommand -Command 'git' -Arguments 'status'
} catch {
    Write-Output "Caught exception: $_"
}
```

This approach gives you full control over the error handling and allows you to include the exit code in the exception message.

### Using $ErrorActionPreference

Setting `$ErrorActionPreference = 'Stop'` at the beginning of your script or function tells PowerShell to treat all errors, including non-terminating errors from cmdlets, as terminating errors. However, this does not affect native command exit codes directly. You still need to check `$LASTEXITCODE` manually.

```powershell
$ErrorActionPreference = 'Stop'

# This will not throw an exception if 'somecommand' returns a non-zero exit code
somecommand

# You must check the exit code manually
if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code $LASTEXITCODE"
}
```

## Handle the exception correctly

Once you have configured PowerShell to throw an exception on native command failure, you can use `try/catch` to handle it. The exception thrown is a `System.Management.Automation.RuntimeException`.

```powershell
try {
    Invoke-NativeCommand -Command 'git' -Arguments 'status'
} catch {
    Write-Error "Native command failed with exit code: $LASTEXITCODE"
    Write-Error "Exception message: $($_.Exception.Message)"
}
```

In the `catch` block, you can access `$LASTEXITCODE` to get the specific exit code returned by the native command. You can also access the exception details via `$_` or `$PSItem`.

## Verify the behavior

To verify that your configuration is working, you can test with a command that is known to fail. For example, on Windows, `cmd /c exit 1` returns an exit code of 1.

```powershell
try {
    Invoke-NativeCommand -Command 'cmd' -Arguments '/c exit 1'
} catch {
    Write-Output "Caught exception. Exit code: $LASTEXITCODE"
}
```

Without the wrapper function, this command would not throw an exception, and the `catch` block would not execute. With the wrapper function, it will throw an exception, and the `catch` block will run, allowing you to handle the failure.

## Common pitfalls

### Assuming $LASTEXITCODE is always set

If a native command is not found, PowerShell throws a `CommandNotFoundException` before the command even runs. In this case, `$LASTEXITCODE` is not set. You should check for this specific exception type if you need to distinguish between "command not found" and "command failed."

### Mixing native and cmdlet errors

If you mix native commands and cmdlets in the same `try/catch` block, be aware that they behave differently. A cmdlet might throw a non-terminating error, which might be caught by a `catch` block if `-ErrorAction Stop` is in effect, or it might not. Always be explicit about how you want errors to be handled.

### Ignoring the exit code

Even if you are not using `-ErrorAction Stop`, you can still check `$LASTEXITCODE` after the command runs. This is useful if you want to handle the failure manually without stopping execution.

```powershell
somecommand
if ($LASTEXITCODE -ne 0) {
    Write-Error "Command failed with exit code $LASTEXITCODE"
}
```

This approach gives you more control but requires you to remember to check the exit code every time.


Reference: [Everything you wanted to know about exceptions](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-exceptions).
