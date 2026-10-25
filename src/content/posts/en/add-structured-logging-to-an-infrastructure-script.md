---
title: "Add structured logging to an infrastructure script"
description: "Replace unreliable PowerShell transcripts with structured logging to ensure consistent, parseable infrastructure logs."
pubDate: 2025-01-06
category: automation
tags: ["powershell", "structured-logging", "infrastructure-as-code", "error-handling", "transcripts"]
translationKey: add-structured-logging-to-an-infrastructure-script
draft: false
---

Infrastructure scripts often rely on PowerShell transcripts to capture what happened. It is a convenient default, but it is not reliable for structured logging. Transcripts mix host output with pipeline output in ways that can drop data, reorder events, or make the log file difficult to parse programmatically. If you need a log that is consistent, searchable, and machine-readable, you should build a structured logging function instead.

The core problem with transcripts is how PowerShell handles output streams. `Write-Host` writes directly to the host process, bypassing the output stream entirely. `Write-Output` sends objects to the pipeline, where they are formatted by `Out-Default`. Transcription captures the output stream, but the timing of formatting can cause output to appear after the transcript has stopped, or to be lost if the pipeline state changes. This makes transcripts unsuitable for any scenario where the order or completeness of log entries matters.

## Why transcripts fail for structured logs

Transcripts are designed to record a session, not to structure data. When you mix `Write-Host` with `Write-Output`, the transcript file may contain entries in a different order than they appeared in the console, or it may miss output entirely. For example, if an object is emitted at the end of a script, it might not be captured if the transcript stops before the formatting system processes it. This is not a bug; it is a consequence of how PowerShell separates host output from pipeline output.

For infrastructure automation, you need logs that are:
1. **Complete**: Every step is recorded, regardless of output stream interactions.
2. **Structured**: Each entry has a consistent format (timestamp, level, message, context).
3. **Parseable**: The log can be consumed by other tools (e.g., Splunk, ELK, Azure Monitor) without complex text parsing.

Transcripts fail on all three counts. They are unstructured text, they drop data, and they are hard to parse reliably.

## Building a structured logging function

The solution is to create a simple logging function that writes to a file in a structured format. JSON is a good choice because it is widely supported and easy to parse. The function should handle timestamps, log levels, and optional context.

Here is a minimal example of a structured logging function. It is illustrative and has not been tested in a live environment.

```powershell
function Write-StructuredLog {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [Parameter(Mandatory=$false)]
        [ValidateSet('Info', 'Warning', 'Error', 'Debug')]
        [string]$Level = 'Info',

        [Parameter(Mandatory=$false)]
        [hashtable]$Context = @{}
    )

    $logEntry = @{
        Timestamp = (Get-Date).ToString('o')
        Level     = $Level
        Message   = $Message
        Context   = $Context
    }

    # Append to log file
    $logFile = 'C:\Logs\infrastructure.log'
    $logEntry | ConvertTo-Json | Out-File -FilePath $logFile -Append
}
```

This function writes a JSON object to a file. Each line is a complete log entry. You can call it from your script like this:

```powershell
Write-StructuredLog -Message 'Starting deployment' -Level 'Info'
try {
    # Some infrastructure action
    Write-StructuredLog -Message 'Resource created' -Level 'Info' -Context @{ ResourceId = 'res-123' }
}
catch {
    Write-StructuredLog -Message 'Deployment failed' -Level 'Error' -Context @{ Error = $_.Exception.Message }
    throw
}
```

## Handling errors and context

Structured logging shines when you include context. If a step fails, you want to know what was happening at the time. The `Context` parameter allows you to pass additional data, such as resource IDs, parameters, or state.

When an error occurs, you should log it before re-throwing. This ensures the error is captured even if the script exits. Use the `catch` block to log the exception details. The `$PSItem` variable contains the error record, which you can convert to a string or extract specific properties.

```powershell
catch {
    Write-StructuredLog -Message 'Operation failed' -Level 'Error' -Context @{
        Error = $PSItem.Exception.Message
        StackTrace = $PSItem.ScriptStackTrace
    }
    throw
}
```

This approach ensures that the log file contains a complete, structured record of the script's execution, including errors. It is far more reliable than relying on transcripts.

## Verification

To verify that your structured logging is working, check the log file after running the script. Each line should be a valid JSON object. You can use `Get-Content` and `ConvertFrom-Json` to parse the log and inspect the entries.

```powershell
Get-Content 'C:\Logs\infrastructure.log' | ConvertFrom-Json | Format-Table Timestamp, Level, Message
```

If the output is consistent and complete, your structured logging is working. If you see missing entries or malformed JSON, review your logging function and ensure that all output paths are captured.

Structured logging is a small change that pays off in reliability and maintainability. It replaces the unpredictability of transcripts with a consistent, parseable format. For infrastructure scripts, this is a critical step towards robust automation.

References for Add structured logging to an infrastructure script: [Limitations of PowerShell transcripts](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/output-missing-from-transcript), [Placing Comment-Based Help in Scripts](https://learn.microsoft.com/en-us/powershell/scripting/developer/help/placing-comment-based-help-in-scripts), [Everything you wanted to know about exceptions](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-exceptions).
