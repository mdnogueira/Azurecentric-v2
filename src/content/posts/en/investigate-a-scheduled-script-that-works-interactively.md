---
title: "Investigate a scheduled script that works interactively"
description: "Troubleshoot a PowerShell 7.6 scheduled script that fails silently by checking profile isolation and error handling."
pubDate: 2026-05-14
category: powershell
tags: ["troubleshooting", "powershell", "error-handling"]
translationKey: investigate-a-scheduled-script-that-works-interactively
draft: false
---

You have a PowerShell 7.6 script that works perfectly when you run it in your interactive session, but it fails or produces no output when triggered by a scheduled task. The task scheduler reports success, and the script does not throw visible errors. This is a common scenario when moving from an interactive shell to a non-interactive execution context.

The core issue is usually one of two things: the script relies on environment customisations that only exist in your interactive profile, or it generates non-terminating errors that are swallowed because there is no console to display them.

## Check for profile dependencies

When you run PowerShell 7.6 interactively, it loads your user profile. This profile typically contains module imports, alias definitions, and custom functions that your script might depend on. A scheduled task running PowerShell does not load these customisations by default if the task is configured to use the `-NoProfile` flag, or if the profile path differs between the interactive and non-interactive contexts.

To verify this, check your profile paths using the `$PROFILE` variable in an interactive session. The documentation explains that there are four possible profiles: `AllUsersAllHosts`, `AllUsersCurrentHost`, `CurrentUserAllHosts`, and `CurrentUserCurrentHost` [Customizing your shell environment](https://learn.microsoft.com/en-us/powershell/scripting/learn/shell/creating-profiles). A scheduled task typically runs under a specific user context, but the profile loaded depends on the arguments passed to the executable. If your script relies on these customisations, you have two options. You can modify the scheduled task to launch PowerShell without the `-NoProfile` flag, or you can refactor the script to be self-contained. The self-contained approach is generally more robust. Move any required module imports or function definitions into the script itself.

## Handle non-terminating errors explicitly

In an interactive session, non-terminating errors are written to the error stream and displayed on the console. In a non-interactive scheduled task, these errors are still written to the stream, but they are not displayed. If your script does not capture or log these errors, it will appear to succeed even if individual commands fail.

PowerShell distinguishes between non-terminating errors, which do not stop execution, and terminating errors, which do [Everything you wanted to know about exceptions](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-exceptions). By default, cmdlets generate non-terminating errors. To ensure that errors are caught and handled, you should use the `-ErrorAction Stop` parameter on cmdlets that might fail, or wrap your script logic in a `try/catch` block.

For example, if your script reads a file, it might fail with a non-terminating error if the file does not exist. In an interactive session, you see the error message. In a scheduled task, you see nothing. To fix this, you can catch the error and log it:

```powershell
# Illustrative example of error handling in a scheduled script
try {
    $content = Get-Content -Path "C:\data\input.txt" -ErrorAction Stop
    # Process content
} catch {
    # Log the error to a file or event log
    $errorMessage = $PSItem.ToString()
    Add-Content -Path "C:\logs\script.log" -Value "$(Get-Date) - Error: $errorMessage"
}
```

The `$PSItem` variable (or `$_`) contains the `ErrorRecord` object, which includes the `Exception` and `ScriptStackTrace` properties [Everything you wanted to know about exceptions](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-exceptions). Using `$PSItem.ToString()` provides a clean message for logging. If you need more detail, you can access `$PSItem.Exception.Message` or `$PSItem.ScriptStackTrace`.

## Verify the execution context

Scheduled tasks run under a specific user account and security context. Ensure that the account has the necessary permissions to access resources, such as files, registry keys, or network shares. Also, check the working directory. Interactive sessions often start in the user's home directory, while scheduled tasks might start in `C:\Windows\System32`. Use absolute paths in your script to avoid ambiguity.

## Test the script in a non-interactive context

To confirm your fixes, test the script in a non-interactive context without using the task scheduler. You can do this by launching PowerShell 7.6 with the `-NonInteractive` and `-NoProfile` flags:

```powershell
pwsh.exe -NonInteractive -NoProfile -File "C:\path\to\script.ps1"
```

This simulates the environment of a scheduled task. If the script fails here, you will see the errors in the console output (if redirected to a file) or you can check the exit code. If it succeeds, you can be confident that the issue was related to profile dependencies or error handling.

By ensuring your script is self-contained and handles errors explicitly, you can move it from an interactive session to a scheduled task with confidence. Always test in a non-interactive context before deploying to production.
