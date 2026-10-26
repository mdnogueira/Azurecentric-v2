---
title: "Hyper-V Best Practices Analyzer"
description: "Sometimes when you deploy an Hyper-V Server you don’t know if you miss any configuration or if you are following the best practices regarding security, configuration or even…"
pubDate: 2013-10-19
category: hyper-v
tags: ["hyper-v", "best-practices-analyzer", "powershell"]
translationKey: hyper-v-best-practices-analyzer
legacy: true
legacyUrl: /2013/10/hyper-v-best-practices-analyzer.html
---

Sometimes when you deploy an Hyper-V Server you don’t know if you miss any configuration or if you are following the best practices regarding security, configuration or even supportability of Hyper-V Server in case you need some help from Microsoft Support. To help us Microsoft has created a few rules to help us improve our environments — these are referred to as best practices. However, it is not easy to know all of them and to make sure your Hyper-V servers are compliant with all of these practices.

To make this job easier, Windows Server comes with the Best Practices Analyzer (BPA). It has a set of best practices and rules which it will compare against all the components of your server and it will then generate a report with all the problems that are found during the scan. The report will provide helpful details such as problems, impact, and resolutions for possible issues.

Windows Server comes with best practices for almost all the roles as well as a specific one only for Hyper-V with all the practices to analyze your host server, configuration, and virtual machines.

The Hyper-V Best Practices Analyzer works only with the pre-installed Hyper-V Role. Make sure that Hyper-V is installed and as a best practice, run the BPA after every server installation and configuration is performed.

## How to do it

By following these steps, you will see how to run the best practices analyzer for Hyper-V and explore its results:
1. Open the Server Manager from the Windows Taskbar.
2. From the Server Manager window, click on Hyper-V on the pane on the left-hand side. Then use the scroll bar on the right-hand side to scroll down until the best practices analyzer option can be seen.
3. Under Best Practices Analyzer, navigate to Tasks | Start BPA Scan:
4. In the Select Servers window, select the Hyper-V servers that you want to scan and click on Start Scan.
5. The scan will start on all the selected servers. When the scan has finished, the BPA results will be shown in Server Manager, under Best Practices Analyzer.
6. When completed, the scan results will be listed in three columns—Server Name, Severity, and Title. Use the filters above each column to organize the information based on your queries.
7. Click on one of the results to see the information provided by BPA. 
    **NOTE:** An example of a warning scan result and its description
8. Open the results and analyze the problem, impact, and resolution for each server.
9. Use the filter at the top to find only warnings and errors.
10. After identifying the results, you can apply the resolutions provided by the Hyper-V BPA.

## BPA on PowerShell

All of Windows Best Practices are available through PowerShell as well. You can scan, filter, get the results, and extract reports using the PowerShell commandlets. To start a scan using the Hyper-V BPA, type the following command:
```powershell
Invoke-BpaModel –BestPracticesModelId Microsoft/Windows/Hyper-V
```
After invoking the Hyper-V BPA, you can use the **_Get-BPAResult_** command to analyze the results. The following command shows the BPA scan results:
```powershell
Get-BpaResult –BestPracticesModelId Microsoft/Windows/Hyper-V
```

If you want to filter only the warnings and the errors by using PowerShell, you can also use the following command:
```powershell
Get-BpaResult -BestPracticesModelId Microsoft/Windows/Hyper-V | Where-Object {$_.Severity –eq "Warning" –or $_.Severity –eq "Error"}
```
## **Summary**

The Best Practice Analyzer for Hyper-V has 74 scans to identify which settings are not configured, based on the Microsoft documentation and practices. It is enabled automatically when the Hyper-V role is installed.

When BPA scans the servers, it shows the results for every scan, providing helpful details about what was scanned, the impact, and even how to resolve any problems it finds. It will also give you the option to apply the necessary changes for your server in compliance with the best practices.

BPA is available through Server Manager and can be used at any time. The recommendation is to scan every server after their final configurations and also on a monthly basis after that.

Hyper-V BPA will also display information about Microsoft Support. If the server has a configuration that is not supported by Microsoft, it will inform you of this through the reports.

After running and applying the recommended settings, you can then be sure that your servers have all the best practices, currently recommended by Microsoft.

## Tips and Tricks

Using PowerShell to create HTML reports with the BPA results to improve the PowerShell results it is possible to produce a BPA HTML report using the following command. This following script uses the previous **_Get-BpaResult_** filter example to show only the warning and the error results:
```powershell
$head = '<style> BODY{font-family:Verdana; background-color:lightblue;} TABLE{border-width: 1px;border-style: solid;border-color: black;bordercollapse: collapse;} TH{font-size:1.3em; border-width: 1px;padding: 2px;border-style: solid;border-color: black;background-color:#FFCCCC} TD{border-width: 1px;padding: 2px;border-style: solid;border-color: black;background-color:yellow}</style>'
$header = "<H1>Hyper-V BPA Errors and Warnings Results</H1>"
$title = "Hyper-V BPA"
Get-BpaResult -BestPracticesModelId Microsoft/Windows/Hyper-V | Where-Object {$_.Severity -eq "Error" -or $_.Severity -eq "Warning"} | ConvertTo-HTML -head $head -body $header -title $title |
Out-File report.htm .report.htm
```

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
