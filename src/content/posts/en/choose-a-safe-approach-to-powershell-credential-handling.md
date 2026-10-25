---
title: "Choose a safe approach to PowerShell credential handling"
description: "Define robust PowerShell credential parameters, handle legacy cmdlet constraints, and prevent injection without relying on Invoke-Expression."
pubDate: 2025-03-03
category: automation
tags: ["powershell", "credential-handling", "security", "script-injection", "best-practices"]
translationKey: choose-a-safe-approach-to-powershell-credential-handling
draft: false
---

You need to run a PowerShell function as a different user, or allow it to run with or without elevated credentials. The first thing to check is whether the underlying cmdlet accepts a `PSCredential` object, and how you will handle the case where no credential is provided.

A `PSCredential` object represents a set of security credentials, such as a username and password. You can create one interactively using `Get-Credential`, or programmatically using a secure string. When you add a credential parameter to your own function, you should follow the conventions used by existing PowerShell cmdlets to make your code predictable for other practitioners.

## Define the parameter correctly

Start by adding the parameter in the `param` block of your function. The recommended name is `$Credential`, and the type should be `[System.Management.Automation.PSCredential]`. To make the parameter more robust, you can add validation attributes and a default value.

```powershell
function Get-Something {
    param(
        $Name,
        [ValidateNotNull()]
        [System.Management.Automation.PSCredential]
        [System.Management.Automation.Credential()]
        $Credential = [System.Management.Automation.PSCredential]::Empty
    )
    # Parameter declaration example; no remote operation is performed.
    [pscustomobject]@{ Name = $Name; CredentialSupplied = ($Credential -ne [System.Management.Automation.PSCredential]::Empty) }
}
```

The `[System.Management.Automation.Credential()]` attribute allows you to pass in a username as a string and have an interactive prompt for the password. This mirrors the behaviour of cmdlets like `Get-Credential`. The default value `[System.Management.Automation.PSCredential]::Empty` ensures that your function can run without providing credentials, avoiding errors when passing the object to other cmdlets.

> [!NOTE]
> Some cmdlets that accept a credential parameter do not support `[System.Management.Automation.PSCredential]::Empty` as they should. See the section on legacy cmdlets below for a workaround.

## Handling legacy cmdlets

Not all cmdlets support credential objects or allow empty credentials. Some cmdlets, like `Invoke-Sqlcmd`, require a clear-text username and password as strings. Others may not accept an empty credential object.

### Using splatting to handle empty credentials

If the cmdlet you are calling does not accept an empty credential object, you can use parameter splatting to conditionally add the credential. This avoids repeating the script block or command invocation.

```powershell
function Set-RemoteRegistryValue {
    param(
        $ComputerName,
        $Path,
        $Name,
        $Value,
        [ValidateNotNull()]
        [System.Management.Automation.PSCredential]
        [System.Management.Automation.Credential()]
        $Credential = [System.Management.Automation.PSCredential]::Empty
    )

        $Splat = @{
            ComputerName = $ComputerName
        }

        if ($Credential -ne [System.Management.Automation.PSCredential]::Empty) {
            $Splat['Credential'] = $Credential
        }

        $null = Invoke-Command -ScriptBlock {
            Set-ItemProperty -Path $using:Path -Name $using:Name -Value $using:Value
        } @splat
}
```

This approach ensures that the `Credential` parameter is only passed if it contains actual credentials. If `$Credential` is empty, the splat table does not include it, and the cmdlet runs using the current user's context.

### Working with string passwords

For cmdlets that require string passwords, you can extract the username and password from a `PSCredential` object. The `GetNetworkCredential()` method of the `$Credential` object allows you to obtain the password as a clear-text string.

```powershell
function Get-AllSQLDatabases {
    param(
        $SQLServer,
        [ValidateNotNull()]
        [System.Management.Automation.PSCredential]
        [System.Management.Automation.Credential()]
        $Credential = [System.Management.Automation.PSCredential]::Empty
    )

        $UserName = $Credential.UserName
        $Password = $Credential.GetNetworkCredential().Password

        $splat = @{
            UserName = $UserName
            Password = $Password
            ServerInstance = 'SQLServer'
            Query = "Select * from Sys.Databases"
        }

        Invoke-Sqlcmd @splat
}
```

Be aware that extracting clear-text passwords introduces security considerations. Ensure that the password is not logged or exposed in error messages. Use secure methods to provide the initial password, such as environment variables or secret management modules, rather than hardcoding it in the script.

## Preventing script injection attacks

When handling user input, especially in functions that might use `Invoke-Expression`, you must guard against script injection attacks. An injection attack occurs when a user provides input that includes extra commands, which are then parsed and run by PowerShell.

### Use typed input

Specify a type for input parameters to prevent arbitrary strings from being processed. For example, restricting a parameter to an integer type will cause an error if a string containing commands is passed.

```powershell
function Get-ProcessById {
    param ([int] $ProcId)
    Invoke-Expression -Command "Get-Process -Id $ProcId"
}
```

### Avoid `Invoke-Expression`

As a best practice, avoid using `Invoke-Expression`, especially when handling user input. It is dangerous because it parses and runs whatever string content you provide. Instead, rely on PowerShell parameter binding.

```powershell
function Get-ProcessById {
    param ($ProcId)
    Get-Process -Id $ProcId
}
```

### Escape single quotes

If you must use `Invoke-Expression` with user string input, wrap the input in single quotes and use the `EscapeSingleQuotedStringContent()` method to protect against users inserting their own single quote characters.

```powershell
function Get-ProcessById {
    param ($ProcId)
    $ProcIdClean = [System.Management.Automation.Language.CodeGeneration]::
        EscapeSingleQuotedStringContent("$ProcId")
    Invoke-Expression -Command "Get-Process -Id '$ProcIdClean'"
}
```

This ensures that the user input is treated as a single string literal, preventing injection attacks.

## Verification

To verify that your function handles credentials correctly, test it with the following scenarios:

1. Run the function without providing credentials. It should execute using the current user's context.
2. Run the function with a username string. It should prompt for a password and then execute.
3. Run the function with a pre-created `PSCredential` object. It should execute using the provided credentials.
4. Test with invalid input to ensure that injection attempts are blocked.

By following these practices, you can create PowerShell functions that are secure, flexible, and consistent with existing cmdlets.

References for Choose a safe approach to PowerShell credential handling: [Add Credential support to PowerShell functions](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/add-credentials-to-powershell-functions), [Credential Attribute Declaration](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/credential-attribute-declaration), [Preventing script injection attacks](https://learn.microsoft.com/en-us/powershell/scripting/security/preventing-script-injection).
