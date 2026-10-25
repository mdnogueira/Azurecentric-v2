---
title: "Use ShouldProcess for an infrastructure change function"
description: "Implement ShouldProcess in PowerShell functions to safely manage infrastructure changes with WhatIf and Confirm support."
pubDate: 2026-01-25
category: automation
tags: ["powershell", "automation", "infrastructure", "shouldprocess", "cmdletbinding"]
translationKey: use-shouldprocess-for-an-infrastructure-change-function
draft: false
---

Infrastructure automation often requires modifying resources outside the PowerShell runtime. A broad filter or a typo can apply changes to the wrong targets. Adding `-WhatIf` and `-Confirm` support to your functions provides a safety net, allowing you to preview or validate changes before they happen.

The core mechanism is the `SupportsShouldProcess` attribute in the `CmdletBinding` block, combined with calls to `$PSCmdlet.ShouldProcess()` around the actual modification logic. This approach works for both functions and compiled cmdlets, ensuring consistent behaviour across your toolset.

[![ShouldProcess Flow](/images/posts/2026/azc-270-checkpoints.svg)](/images/posts/2026/azc-270-checkpoints.svg)

## Declare support in CmdletBinding

The first step is to tell PowerShell that your function supports these common parameters. You do this by adding `SupportsShouldProcess` to the `[CmdletBinding()]` attribute.

```powershell
function Set-InfrastructureResource {
    [CmdletBinding(SupportsShouldProcess)]
    param()
    # Logic goes here
}
```

Once this is declared, PowerShell automatically adds the `-WhatIf` and `-Confirm` parameters to your function. You do not need to define them yourself. When a user calls your function with `-WhatIf`, PowerShell handles the logic to prevent execution and display a message. When `-Confirm` is used, it prompts the user.

## Control the confirmation prompt

By default, functions with `SupportsShouldProcess` do not prompt for confirmation unless the user explicitly passes `-Confirm`. If your function performs a destructive action, you can set the `ConfirmImpact` to `High` in the `CmdletBinding` attribute. This forces a confirmation prompt even if the user did not specify `-Confirm`.

```powershell
function Set-InfrastructureResource {
    [CmdletBinding(
        SupportsShouldProcess,
        ConfirmImpact = 'High'
    )]
    param()
    # Logic goes here
}
```

The possible values for `ConfirmImpact` are `Low`, `Medium`, `High`, and `None`. The default preference variable `$ConfirmPreference` is `High`. This means that if a function has a `ConfirmImpact` of `High`, it will always prompt. If it is `Medium` or `Low`, it will only prompt if the user specifies `-Confirm` or if `$ConfirmPreference` is set lower than the impact level. Setting `ConfirmImpact` to `None` suppresses confirmation prompts even when `-Confirm` is specified, which is useful for non-interactive scripts where you want to ensure no prompts occur.

## Implement the ShouldProcess check

The actual safety check happens when you call `$PSCmdlet.ShouldProcess()`. This method returns `$true` if the operation should proceed, and `$false` if `-WhatIf` was specified or if the user declined the `-Confirm` prompt. You should wrap the code that modifies the system inside an `if` block that checks this return value.

```powershell
function Set-InfrastructureResource {
    [CmdletBinding(
        SupportsShouldProcess,
        ConfirmImpact = 'High'
    )]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ResourceName
    )

    # Validation logic can run here regardless of WhatIf

    if ($PSCmdlet.ShouldProcess($ResourceName, 'Update configuration')) {
        # Actual modification code goes here
        Write-Verbose "Updating configuration for $ResourceName"
    }
}
```

The `ShouldProcess` method accepts parameters to customise the message displayed to the user. The first parameter is the target (e.g., the resource name), and the second is the operation description. This allows you to provide clear context in the `-WhatIf` output.

## Handle nested calls and Force

If your function calls other cmdlets or functions that also support `ShouldProcess`, you need to be careful. By default, `-WhatIf` and `-Confirm` are not automatically passed to nested calls. You should explicitly pass these parameters to maintain consistency.

```powershell
if ($PSCmdlet.ShouldProcess($ResourceName, 'Update configuration')) {
    Update-ChildResource -Name $ResourceName -WhatIf:$WhatIfPreference -Confirm:$false
}
```

For functions with `ConfirmImpact` set to `High`, users often want to bypass the confirmation prompt in automated scripts. You can implement a `-Force` parameter to allow this. When `-Force` is specified, you can skip the confirmation logic or pass `-Confirm:$false` to nested calls.

```powershell
function Set-InfrastructureResource {
    [CmdletBinding(
        SupportsShouldProcess,
        ConfirmImpact = 'High'
    )]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ResourceName,
        [switch]$Force
    )

    if ($Force -or $PSCmdlet.ShouldProcess($ResourceName, 'Update configuration')) {
        # Actual modification code
    }
}
```

This approach ensures that your function behaves predictably in both interactive and automated scenarios. It gives users control over when changes are applied, reducing the risk of accidental infrastructure modifications.

## Verify the implementation

To verify that your function works correctly, run it with `-WhatIf` first. This should display the intended changes without executing them. Then, run it without `-WhatIf` to see the confirmation prompt if `ConfirmImpact` is `High`. Finally, test with `-Confirm:$false` to ensure it runs silently in scripts.

```powershell
Set-InfrastructureResource -ResourceName 'WebServer01' -WhatIf
Set-InfrastructureResource -ResourceName 'WebServer01' -Confirm:$false
```

This verification process ensures that your function is safe to use and integrates well with existing automation workflows.



References for Use ShouldProcess for an infrastructure change function: [Everything you wanted to know about ShouldProcess](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-shouldprocess), [Creating a Cmdlet that Modifies the System](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/creating-a-cmdlet-that-modifies-the-system), [Writing Help for PowerShell Scripts and Functions](https://learn.microsoft.com/en-us/powershell/scripting/developer/help/writing-help-for-windows-powershell-scripts-and-functions).
