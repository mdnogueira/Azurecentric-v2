---
title: "Test a reusable function with Pester"
description: "Test a PowerShell function with Pester by packaging it as a module for predictable scoping and isolation."
pubDate: 2025-12-02
category: automation
tags: ["powershell", "pester", "testing", "modules", "scripting"]
translationKey: test-a-reusable-function-with-pester
draft: false
---

You have a PowerShell function that needs to be tested. The most reliable way to do this is with Pester, but only if the function is packaged as a module and the test environment is isolated from the rest of your session. A function sitting in a script file is hard to test consistently because its scope and availability depend on how it was loaded. A module, by contrast, gives you a predictable entry point and a clear boundary for what is exported.

The first step is to ensure your function is in a script module. Save your code in a `.psm1` file inside a directory with the same name. For example, `MyModule/MyModule.psm1`. This structure allows you to use `Import-Module` to load it cleanly. If you are testing a function that relies on other modules, include those dependencies at the top of your `.psm1` file using `Import-Module`. This ensures the function has the context it needs when the test runs.

## Set up the module structure

A script module is simply a valid PowerShell script saved with a `.psm1` extension. The directory containing it must be in a path listed in `$Env:PSModulePath`, or you must specify the path explicitly when importing. Using a standard module path makes it easier to manage versions and updates, but for testing, you can often work directly in a local folder.

To control which parts of your module are available to the outside world, use `Export-ModuleMember` at the end of your `.psm1` file. This is a good practice because it prevents accidental exposure of helper functions or variables that are meant for internal use only. If you do not use this cmdlet, all functions in the script are exported by default, which can lead to naming conflicts or unexpected behaviour in your tests.

```powershell
# MyModule.psm1
function Get-DateInfo {
    param(
        [datetime]$InputDate = (Get-Date)
    )
    return @{
        Day = $InputDate.Day
        Month = $InputDate.Month
        Year = $InputDate.Year
    }
}

Export-ModuleMember -Function Get-DateInfo
```

This code is an illustrative example. It defines a simple function that returns a hashtable of date components. In a real scenario, your function might interact with external systems, so you will need to consider how to mock those interactions in your tests.

## Write the Pester test

Pester tests are written in a `.Tests.ps1` file. The convention is to place this file in the same directory as your module. The test file should import the module and then define one or more `Describe` blocks. Each `Describe` block represents a feature or scenario, and inside it, you use `It` blocks to define specific expectations.

When writing tests, you should aim to isolate the function from its dependencies. If your function calls other cmdlets or modules, you can use Pester's `Mock` feature to replace those calls with controlled outputs. This allows you to test the logic of your function without relying on external systems. For example, if your function calls `Get-Date`, you might mock it to return a specific date, ensuring that your tests are deterministic.

```powershell
# MyModule.Tests.ps1
Import-Module -Name ./MyModule/MyModule.psm1 -Force

Describe "Get-DateInfo" {
    It "returns the correct day for a given date" {
        $result = Get-DateInfo -InputDate "2025-12-01"
        $result.Day | Should -Be 1
    }

    It "returns the correct month for a given date" {
        $result = Get-DateInfo -InputDate "2025-12-01"
        $result.Month | Should -Be 12
    }

    It "uses today's date when no input is provided" {
        Mock Get-Date { return [datetime]"2025-12-01" }
        $result = Get-DateInfo
        $result.Day | Should -Be 1
    }
}
```

This code is an illustrative example. It shows how to test the function with explicit input and how to mock the default parameter value. The `Mock` cmdlet replaces `Get-Date` within the scope of the `It` block, ensuring that the function uses the mocked date rather than the actual system time.

## Run the tests and verify results

To run your tests, open a PowerShell session and navigate to the directory containing your module and test file. Run `Invoke-Pester`. This cmdlet will execute all `.Tests.ps1` files in the current directory and its subdirectories. The output will show you which tests passed and which failed, along with any error messages.

If a test fails, Pester will provide details about the expectation that was not met. For example, if the `Day` property was expected to be `1` but was `2`, the output will clearly state this discrepancy. Use this information to debug your function or your test. It is important to run your tests frequently, especially after making changes to your module, to ensure that you do not introduce regressions.

Once you are satisfied with your tests, you can integrate them into your CI/CD pipeline. Most modern CI/CD systems support PowerShell, and you can add a step to run `Invoke-Pester` before deploying your module. This ensures that only tested code is released to production. If the tests fail, the pipeline can be configured to stop the deployment, preventing broken code from reaching your users.

## Clean up after testing

After you have finished testing, you can remove the module from the current session using `Remove-Module`. This cmdlet removes the module from memory but does not delete the files from disk. If you are working in a shared environment, it is good practice to clean up any temporary files or modules that you created during testing. This helps to keep your environment tidy and prevents conflicts with other users or processes.

If you used mocks in your tests, be aware that they are scoped to the `It` block in which they were defined. Once the block completes, the mock is automatically removed, and the original cmdlet is restored. This means you do not need to manually clean up mocks, but you should be careful not to rely on them outside of the test scope.

By following these steps, you can create a robust testing framework for your PowerShell functions. The key is to treat your function as a black box, focusing on its inputs and outputs rather than its internal implementation. This approach makes your tests easier to write, easier to maintain, and more reliable in the long run.

References for Test a reusable function with Pester: [How to Write a PowerShell Script Module](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/how-to-write-a-powershell-script-module), [Writing a Windows PowerShell Module](https://learn.microsoft.com/en-us/powershell/scripting/developer/module/writing-a-windows-powershell-module), [Writing Help for PowerShell Scripts and Functions](https://learn.microsoft.com/en-us/powershell/scripting/developer/help/writing-help-for-windows-powershell-scripts-and-functions).
