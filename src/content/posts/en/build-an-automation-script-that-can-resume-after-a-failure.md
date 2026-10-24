---
title: "Build an automation script that can resume after a failure"
description: "Resume PowerShell automation using typed exception handling, efficient state tracking, and resource cleanup."
pubDate: 2026-07-09
category: automation
tags: ["powershell", "error-handling", "automation", "resilience", "state-management"]
translationKey: build-an-automation-script-that-can-resume-after-a-failure
draft: true
---

You have a long-running automation script that processes a batch of items. The network drops, the machine reboots, or the process is interrupted. When you restart the script, it starts from the beginning, reprocessing everything. This wastes time, risks duplicate actions, and fills logs with noise.

The solution is to make the script stateful. You record what has been completed before the script stops, and you skip those items when it runs again. This requires two things: a reliable way to persist state, and a robust exception handling structure that cleans up after itself.

[![Resume-able Script Flow](/images/posts/2026/azc-329-checkpoints.svg)](/images/posts/2026/azc-329-checkpoints.svg)

## Record state efficiently

The most common mistake is to update the state file after the work is done. If the script crashes during the work, the state file is not updated, and the script will retry the failed item. This is correct. However, if the script crashes *after* updating the state but *before* finishing the cleanup, you might have a partial state. 

A safer approach for idempotent operations is to update the state *before* the main work, or to use a transactional pattern. For this example, we will assume the operation is idempotent (running it twice has the same effect as running it once) and update the state file after successful completion. We will use a simple JSON file to track processed items.

```powershell
# Illustrative example: State management
$StateFile = "C:\Temp\AutomationState.json"
$ProcessedItems = [System.Collections.Generic.List[Object]]::new()

if (Test-Path $StateFile) {
    $ProcessedItems.AddRange((Get-Content -Raw $StateFile | ConvertFrom-Json))
}

# Add new items to process
$ItemsToProcess = @("Item1", "Item2", "Item3")
$NewItems = $ItemsToProcess | Where-Object { $_ -notin $ProcessedItems }

foreach ($Item in $NewItems) {
    try {
        # Perform work
        Write-Host "Processing $Item"
        # Simulate work
        Start-Sleep -Seconds 1
        
        # Update state
        $ProcessedItems.Add($Item)
        $ProcessedItems | ConvertTo-Json | Set-Content $StateFile
    }
    catch {
        Write-Error "Failed to process ${Item}: $_"
        # Do not add to processed list
    }
}
```

This code is illustrative. In a real scenario, you would need to handle file locking if multiple instances might run, and you would want to ensure the state file is written atomically to avoid corruption.

## Handle exceptions properly

PowerShell distinguishes between non-terminating and terminating errors. Non-terminating errors (like `Write-Error` without `-ErrorAction Stop`) do not stop execution and are not caught by `try/catch`. Terminating errors stop execution and can be caught.

To resume after a failure, you need to catch the error, log it, and then decide whether to continue or abort. If you want to resume, you must ensure that the error is handled and the script continues to the next item.

```powershell
# Illustrative example: Exception handling
foreach ($Item in $ItemsToProcess) {
    try {
        # Force terminating error for demonstration
        $null = Get-Item "C:\NonExistent\$Item" -ErrorAction Stop
        
        # Update state
        $ProcessedItems.Add($Item)
        $ProcessedItems | ConvertTo-Json | Set-Content $StateFile
    }
    catch [System.Management.Automation.ItemNotFoundException] {
        Write-Warning "Item $Item not found. Skipping."
        # Optionally add to processed list if you consider this a 'success'
        # $ProcessedItems.Add($Item)
        # $ProcessedItems | ConvertTo-Json | Set-Content $StateFile
    }
    catch {
        Write-Error "Unexpected error processing ${Item}: $_"
        # Do not add to processed list
    }
}
```

The `catch` block allows you to inspect the exception. You can use `$PSItem` to get details about the error. The `ScriptStackTrace` property can help you understand where the error occurred, which is useful for debugging.

## Clean up resources

If your script opens files, network connections, or database sessions, you must ensure they are closed even if an error occurs. Use a `finally` block to clean up resources.

```powershell
# Illustrative example: Cleanup
$Connection = $null
try {
    $Connection = New-Object System.Data.SqlClient.SqlConnection("Server=...;Database=...")
    $Connection.Open()
    # Perform work
} catch {
    Write-Error "Database error: $_"
} finally {
    if ($Connection -and $Connection.State -eq 'Open') {
        $Connection.Close()
    }
}
```

The `finally` block runs regardless of whether an exception was thrown. This ensures that resources are released, preventing leaks.

## Verify the state

After the script runs, check the state file to see what was processed. This helps you verify that the script resumed correctly and did not skip any items.

```powershell
# Verify state
$ProcessedItems = Get-Content -Raw $StateFile | ConvertFrom-Json
Write-Host "Processed items: $($ProcessedItems -join ', ')"
```

This approach allows you to build resilient automation scripts that can recover from failures without manual intervention. The key is to track state, handle exceptions, and clean up resources.

## Decision criteria

When designing a resume-able script, consider:

1. **Idempotency**: Can the operation be safely repeated? If not, you need a more complex state management system.
2. **State Persistence**: Where is the state stored? A file is simple but not distributed. A database is more robust but adds complexity.
3. **Error Granularity**: Do you want to skip failed items and continue, or abort the entire script? This depends on the criticality of the items.
4. **Resource Cleanup**: Are there resources that must be released even if the script fails? Use `finally` blocks.

By addressing these points, you can create scripts that are more reliable and easier to maintain.



References for Build an automation script that can resume after a failure: [Everything you wanted to know about exceptions](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-exceptions), [Scheduling Jobs with the Windows PowerShell API](https://learn.microsoft.com/en-us/powershell/scripting/developer/scheduling-jobs-with-the-windows-powershell-api), [PowerShell scripting performance considerations](https://learn.microsoft.com/en-us/powershell/scripting/dev-cross-plat/performance/script-authoring-considerations).
