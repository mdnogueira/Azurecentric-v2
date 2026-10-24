---
title: "Handle script failures using try, catch and ErrorAction"
description: "Use try/catch and ErrorAction Stop to handle script failures predictably in PowerShell 7.4."
pubDate: 2024-07-19
category: automation
tags: ["powershell", "error-handling", "try-catch", "scripting", "best-practices"]
translationKey: handle-script-failures-using-try-catch-and-erroraction
draft: false
---

A script that continues after a failure is often harder to debug than one that stops. When a command fails, you need to know whether the script should proceed, retry, or abort. The difference usually comes down to how you handle terminating and non-terminating errors. If you want to catch a failure and decide what happens next, you must ensure the error is terminating and use a `try/catch` block.

The core issue is that many cmdlets generate non-terminating errors by default. These errors are recorded in the error stream but do not trigger a `catch` block. To handle them, you must explicitly convert them to terminating errors using `-ErrorAction Stop`.

[![PowerShell Error Handling Flow](/images/posts/2024/azc-072-checkpoints.svg)](/images/posts/2024/azc-072-checkpoints.svg)

## Distinguish error types

PowerShell reports errors in two ways. A terminating error stops the current pipeline execution and can be caught. A non-terminating error is recorded in the error stream but allows execution to continue. `Write-Error` generates a non-terminating error by default. Throwing an exception generates a terminating error.

```powershell
# Non-terminating: execution continues, catch is skipped
Write-Error "Something went wrong"

# Terminating: execution stops, catch is triggered
throw "Something went wrong"
```

If you are calling external cmdlets, they typically generate non-terminating errors. You must use `-ErrorAction Stop` to make them terminating.

## Use try/catch for control flow

A `try/catch` block allows you to intercept terminating errors. The `catch` block only runs if a terminating error occurs in the `try` block. If the `try` block completes successfully, the `catch` block is skipped.

```powershell
try {
    # This cmdlet generates a non-terminating error by default
    Get-ChildItem -Path "NonExistentPath" -ErrorAction Stop
} catch {
    Write-Output "Caught an error: $($_.Exception.Message)"
}
```

Inside the `catch` block, the automatic variable `$_` (or `$PSItem`) contains an `ErrorRecord` object. This object provides details about the exception, including the message, the script stack trace, and the exception type.

## Handle specific exception types

You can catch specific exception types to handle different failures differently. This is useful when a script might fail for multiple reasons, such as a file not being found versus a permission denied error.

```powershell
try {
    Get-Content -Path $filePath -ErrorAction Stop
} catch [System.IO.FileNotFoundException] {
    Write-Output "File not found: $filePath"
} catch [System.UnauthorizedAccessException] {
    Write-Output "Access denied: $filePath"
} catch {
    Write-Output "An unexpected error occurred: $($_.Exception.Message)"
}
```

The `catch` blocks are evaluated in order. The first matching exception type is executed. If no specific type matches, the generic `catch` block handles it. This allows you to provide specific remediation for known errors while logging unexpected ones.

## Use finally for cleanup

Sometimes you need to perform cleanup actions regardless of whether an error occurred. A `finally` block runs after the `try` and `catch` blocks, even if an exception was thrown and caught.

```powershell
$connection = Open-DatabaseConnection
try {
    ExecuteQuery -Connection $connection -Query $query
} catch {
    Write-Output "Query failed: $($_.Exception.Message)"
} finally {
    Close-DatabaseConnection -Connection $connection
}
```

The `finally` block ensures that resources are released, even if the script fails. This is critical for database connections, file handles, and network sockets.

## Avoid swallowing errors

Catching an error without taking action is known as swallowing an exception. This makes troubleshooting difficult because the error is hidden. If you catch an error, you should either handle it, log it, or re-throw it.

```powershell
try {
    Do-Something -ErrorAction Stop
} catch {
    # Bad: Swallowing the error
    Write-Output "Error occurred"
}
```

If you need to log the error but let it propagate, you can re-throw it. This preserves the original stack trace.

```powershell
try {
    Do-Something -ErrorAction Stop
} catch {
    Write-Log "Error occurred: $($_.Exception.Message)"
    throw # Re-throws the original exception
}
```

Re-throwing with `throw` preserves the original error context. Using `throw $_` also works but is less common. Avoid creating a new exception unless you need to wrap the original error with additional context.

## Verify your error handling

To verify that your error handling works, test it with a known failure. Ensure that the `catch` block is triggered and that the error message is correct. Check that the `finally` block runs and that resources are cleaned up.

```powershell
# Test script
try {
    Get-ChildItem -Path "InvalidPath" -ErrorAction Stop
} catch {
    Write-Output "Caught: $($_.Exception.Message)"
} finally {
    Write-Output "Cleanup ran"
}
```

This test should output the caught error message and the cleanup message. If the `catch` block is not triggered, check that `-ErrorAction Stop` is used. If the `finally` block does not run, check for syntax errors in the `try/catch` structure.

Error handling is a critical part of script reliability. By using `try/catch` and `-ErrorAction Stop`, you can control how your scripts respond to failures. This makes your scripts more robust and easier to troubleshoot.



References for Handle script failures using try, catch and ErrorAction: [Everything you wanted to know about exceptions](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-exceptions), [Error Reporting Concepts](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/error-reporting-concepts), [Terminating Errors](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/terminating-errors).
