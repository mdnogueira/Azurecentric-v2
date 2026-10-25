---
title: "Read and validate JSON configuration in PowerShell"
description: "Read and validate JSON configuration in PowerShell using native cmdlets, with explicit scope and verification steps."
pubDate: 2025-06-23
category: automation
tags: ["powershell", "json", "configuration", "validation", "scripting"]
translationKey: read-and-validate-json-configuration-in-powershell
draft: false
---

You have a JSON configuration file and need to read it into a PowerShell object, validate its structure, and extract specific values without relying on external tools. The immediate answer is to use `Get-Content` to read the file and `ConvertFrom-Json` to parse it into a native PowerShell object. Once parsed, you can validate the structure by checking for expected properties and types using standard PowerShell comparison operators and type casting.

## Reading the JSON file

[![JSON Configuration Validation Flow](/images/posts/2025/azc-193-checkpoints.svg)](/images/posts/2025/azc-193-checkpoints.svg)

PowerShell includes `ConvertFrom-Json` as a cmdlet. Cmdlets are native PowerShell commands collected into modules that can be loaded on demand [What is a PowerShell command?](https://learn.microsoft.com/en-us/powershell/scripting/powershell-commands). The first step is to read the raw text from your configuration file. `Get-Content` reads the file as a string array by default, but `ConvertFrom-Json` accepts pipeline input, so you can pass the output directly.

```powershell
# Illustrative example: Read and parse a JSON file
$configPath = '.\config.json'
$config = Get-Content -Path $configPath -Raw | ConvertFrom-Json
```

The `-Raw` parameter is critical here. Without it, `Get-Content` returns an array of strings (one per line). While `ConvertFrom-Json` can often handle an array of strings, passing a single string with `-Raw` is more predictable and avoids potential issues with line-ending variations or large files. The result, `$config`, is a custom object where JSON keys become properties.

## Validating the structure

A JSON file might be syntactically valid but semantically incorrect for your script. For example, a property might be missing, or a value might be the wrong type. PowerShell objects do not enforce a schema, so you must check for the presence and type of expected properties.

### Checking for required properties

Use the `-contains` operator on the property names or check if a property is `$null`. If a property is missing, accessing it returns `$null`.

```powershell
# Illustrative example: Check for a required property
if ($null -eq $config.DatabaseConnection) {
    Write-Error "Configuration missing required property: DatabaseConnection"
    exit 1
}
```

### Validating data types

JSON types map to .NET types in PowerShell. Strings become `System.String`, numbers become `System.Int64` or `System.Double`, and booleans become `System.Boolean`. You can verify the type using the `-is` operator.

```powershell
# Illustrative example: Validate a numeric property
if ($config.Timeout -isnot [int] -and $config.Timeout -isnot [long]) {
    Write-Error "Timeout must be an integer"
    exit 1
}
```

If your JSON contains nested objects, they become nested custom objects. You can access them using dot notation. If a nested object is missing, the entire chain returns `$null`.

```powershell
# Illustrative example: Access a nested property
$hostName = $config.Server.HostName
if ($null -eq $hostName) {
    Write-Error "Server configuration missing HostName"
}
```

## Handling arrays

JSON arrays become PowerShell arrays. You can iterate over them or check their count.

```powershell
# Illustrative example: Validate an array
if ($null -eq $config.Tags -or $config.Tags.Count -lt 1) {
    Write-Error "Tags array must contain at least one item"
}
```

## Error handling

`ConvertFrom-Json` throws a terminating error if the JSON is syntactically invalid. You should wrap the parsing step in a `try/catch` block to handle malformed JSON gracefully.

```powershell
# Illustrative example: Handle JSON parsing errors
try {
    $config = Get-Content -Path $configPath -Raw | ConvertFrom-Json
} catch {
    Write-Error "Failed to parse JSON: $_"
    exit 1
}
```
