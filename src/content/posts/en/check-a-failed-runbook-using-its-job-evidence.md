---
title: "Check a failed runbook using its job evidence"
description: "Diagnose failed Azure Automation runbooks by tracing job status, stream output, and permission scopes."
pubDate: 2026-03-11
category: governance
tags: ["azure-automation", "runbooks", "troubleshooting", "powershell", "permissions"]
translationKey: check-a-failed-runbook-using-its-job-evidence
draft: false
---

A runbook job has failed. The portal shows a red status, but the error message is either missing, generic, or points to a permission issue that doesn't match what you expect. The first step is not to guess the cause, but to look at the job evidence. Azure Automation provides specific streams and status codes that tell you exactly where the execution stopped and why.

## Check the job status first

[![Runbook Failure Diagnosis Flow](/images/posts/2026/azc-286-checkpoints.svg)](/images/posts/2026/azc-286-checkpoints.svg)

Before diving into logs, confirm the job status. Azure Automation jobs move through a defined lifecycle. If the status is `Queued` or `Starting`, the job hasn't reached the code yet. If it is `Failed`, the job has terminated. Note that `Failed` can mean different things depending on the runbook type. For graphical or PowerShell Workflow runbooks, a compilation failure results in a `Failed` status. For PowerShell runbooks, it means the job failed to start or threw an exception during execution [Runbook execution in Azure Automation](https://learn.microsoft.com/en-us/azure/automation/automation-runbook-execution).

If the job status is `Suspended`, this applies only to graphical and PowerShell Workflow runbooks. The system suspends the job when an exception occurs, provided the `ErrorActionPreference` is set to `Stop` [Runbook execution in Azure Automation](https://learn.microsoft.com/en-us/azure/automation/automation-runbook-execution). If you see this status, the runbook has hit a checkpoint and is waiting for you to resume it or for the system to retry it. If the job is `Stopped`, it was manually halted by a user [Runbook execution in Azure Automation](https://learn.microsoft.com/en-us/azure/automation/automation-runbook-execution).

## Examine the error streams

A `Failed` status does not always provide a detailed error message in the summary view. You need to look at the job output streams. Azure Automation captures output in several streams: `Output`, `Error`, `Warning`, `Verbose`, and `Debug` [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks).

The `Error` stream is the most critical for troubleshooting. It contains the specific exception or error message that caused the job to fail. If the runbook uses `ErrorActionPreference` set to `Stop`, non-terminating errors become terminating errors, which are captured in the `Error` stream and cause the job to fail [Runbook execution in Azure Automation](https://learn.microsoft.com/en-us/azure/automation/automation-runbook-execution). If the preference is set to `Continue` (the default), non-terminating errors are logged in the `Error` stream but the job may still complete successfully [Runbook execution in Azure Automation](https://learn.microsoft.com/en-us/azure/automation/automation-runbook-execution).

To view these streams, select the failed job in the Azure portal and open the **Streams** tab. Look for entries in the `Error` stream. If the stream is empty, the failure might be due to a compilation error, a timeout, or a permission issue that prevented the job from starting properly. In such cases, check the `Output` and `Warning` streams for any clues.

## Verify permissions and authentication

Many runbook failures are permission-related. If the error message mentions `Forbidden`, `403`, or `this.Client.SubscriptionId cannot be null`, the issue is likely with the identity used by the runbook [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks).

If the runbook uses a managed identity, ensure that the identity has been granted the appropriate role assignments in the target subscription or resource group. A role at the control plane does not imply data-plane rights. For example, having Contributor access to the Automation account does not grant access to the resources it manages [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks). You need to explicitly assign roles like Contributor or Reader to the managed identity on the target resources [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks).

If the runbook uses a Run As account or a service principal, verify that the certificate has not expired and that the application ID and tenant ID are correct. If you are accessing resources in a different subscription, you must configure the Run As account or service principal with permissions in that subscription as well [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks). The error `Unknown_user_type` or `No certificate was found` often indicates a credential asset issue or an expired certificate [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks).

## Check for module and environment issues

If the job fails with a term not recognized as a cmdlet, or if it fails with `A task was canceled`, the issue might be with the modules or the execution environment [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks).

Ensure that all required modules are imported into the Automation account and are up to date. Outdated Azure modules can cause failures. You can update the modules by selecting **Modules** in the Automation account and choosing **Update Azure modules** [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks). This process takes approximately 15 minutes [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks).

If the runbook is running on a Hybrid Runbook Worker, check the worker itself for connectivity and module availability. The worker must have access to the required resources and modules. If the runbook is running in the Azure sandbox, note that the sandbox has resource limits and does not support interactive operations or calling external executables [Runbook execution in Azure Automation](https://learn.microsoft.com/en-us/azure/automation/automation-runbook-execution).

## Trace the execution flow

If the job fails intermittently, consider adding retry logic to your authentication or resource access routines. Transient network failures can cause timeouts. You can implement a simple retry loop to handle these cases [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks).

```powershell
# Illustrative example: Retry logic for authentication
$logonAttempt = 0
$logonResult = $False

while(!($logonResult) -And ($logonAttempt -le 10))
{
    $LogonAttempt++
    #Logging in to Azure...
    $connectionResult = Connect-AzAccount `
    Start-Sleep -Seconds 30
    if($connectionResult)
    {
       $logonResult = $True 
    }
}
```

This code is an illustrative example and has not been tested. It demonstrates how to wrap the authentication call in a loop to handle transient failures.

## Verify the fix

After making changes, rerun the runbook. Monitor the job status and streams to confirm that the issue is resolved. If the job still fails, repeat the troubleshooting steps, focusing on the new error messages. If the issue persists, consider running the script locally to isolate environment-specific problems [Troubleshoot Azure Automation runbook issues](https://learn.microsoft.com/en-us/azure/automation/troubleshoot/runbooks).

By systematically checking the job status, streams, permissions, and environment, you can identify the root cause of most runbook failures. This approach avoids guesswork and ensures that you address the actual issue rather than symptoms.
