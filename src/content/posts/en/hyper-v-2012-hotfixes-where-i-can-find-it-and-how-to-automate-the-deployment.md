---
title: "Hyper-V 2012 Hotfixes: Where I can find it and how to automate the deployment?"
description: "After my session at TechEd about Best Practices for Virtualizing and Managing Microsoft SharePoint 2013 with Microsoft System Center 2012 R2 and Windows Server 2012 R2 one of…"
pubDate: 2014-05-28
category: hyper-v
tags: ["hyper-v", "hotfix", "system-center", "windows-server", "powershell"]
translationKey: hyper-v-2012-hotfixes-where-i-can-find-it-and-how-to-automate-the-deployment
legacy: true
legacyUrl: /2014/05/hyper-v-2012-hotfixes-where-i-can-find-it-and-how-to-automate-the-deployment.html
---

After my session at TechEd about [Best Practices for Virtualizing and Managing Microsoft SharePoint 2013 with Microsoft System Center 2012 R2 and Windows Server 2012 R2](https://channel9.msdn.com/Events/TechEd/NorthAmerica/2014/DCIM-B313) one of the questions that I got was where I can find the Hyper-V hotfixes and how can I automate the deployment process. 

Where I can find the most update list of Hotfixes for Hyper-V 2012 and Hyper-V 2012 R2? I found a couple of years ago on TechNet Wiki a page where they announce public the hotfixes. Now it’s easy for me, because being an MVP I have this information sooner and I always try to publish when I get it! But for the common mortal, I highly recommend the TechNet Wiki Page (you can find [HERE](http://social.technet.microsoft.com/wiki/contents/articles/15576.hyper-v-update-list-for-windows-server-2012.aspx)). 

To automate the process or to install those hotfixes on Hyper-V Server Core, you can use the PowerShell cmdlet that Hans Vredevoort ([@hvredevoort](https://twitter.com/hvredevoort)) created that will simplify your process and make your life easier. 

This script will help to identify what hotfixes and updates are installed and what is missing. To run this tool you will need the .XML file that have all the updated list. These .XML files must be on the same directory where the PowerShell script will run (or you have to edit the script with the correct location). 

One of the ways, that did found out that worked very well for me, and I always use it when I deploy Hyper-V server, it is enable the RSS on the TechNet Wiki page and then when you received the notice that they have news hotfixes or updates, you grab the XML files and run the tool.  

The script it’s not very complex, but it’s very effective!  
```powershell
param 

( 

[parameter(mandatory=$True)] 

[String[]]$HyperHostName 

) 

#Getting current execution path 

$scriptpath = $MyInvocation.MyCommand.Path 

$dir = Split-Path $scriptpath 

$version = "This list was updated on April 17, 2014 by @hvredevoort" 

#Loading list of updates from XML files 

[xml]$SourceFileHyperV = Get-Content $dirUpdatesListHyperV.xml 

[xml]$SourceFileCluster = Get-Content $dirUpdatesListCluster.xml 

$HyperVHotfixes = $SourceFileHyperV.Updates.Update 

$ClusterHotfixes = $SourceFileCluster.Updates.update 

#Getting Hotfixes installed on the specified Hyper-V Host 

foreach($VMHost in $HyperHostName) 

{ 

$Hotfixes = Get-HotFix -ComputerName $VMHost |select HotfixID,description 

Write-Host $version $HyperHostName -ForegroundColor Green 

Write-Host "COLLECTING HOTFIXES ON HYPER-V HOST: " $HyperHostName -ForegroundColor Yellow 

Write-Host "Listing Hyper-V 2012 R2 Hotfixes" -ForegroundColor Yellow 

foreach($RecomendedHotfix in $HyperVHotfixes) 

{ 

$witness = 0 

foreach($hotfix in $Hotfixes) 

{ 

If($RecomendedHotfix.id -eq $hotfix.HotfixID) 

{ 

Write-Host "--------------------------" 

Write-Host "Hyper-V Host: "$VMHost 

Write-Host $RecomendedHotfix.Id "installed" -ForegroundColor Green 

write-host $RecomendedHotfix.Description 

Write-Host "--------------------------" 

$witness = 1 

} 

} 

if($witness -eq 0) 

{ 

Write-Host "--------------------------" 

Write-Host "Hyper-V Host: "$VMHost 

Write-Host $RecomendedHotfix.Id "not installed" -ForegroundColor Red 

write-host $RecomendedHotfix.Description 

Write-Host "--------------------------" 

} 

} 

Write-Host "Listing Failover Cluster 2012 R2 Hotfixes" -ForegroundColor Yellow 

foreach($RecomendedClusterHotfix in $ClusterHotfixes) 

{ 

$witness = 0 

foreach($hotfix in $Hotfixes) 

{ 

If($RecomendedClusterHotfix.id -eq $hotfix.HotfixID) 

{ 

Write-Host "--------------------------" 

Write-Host "Hyper-V Host: "$VMHost 

Write-Host $RecomendedClusterHotfix.Id "installed" -ForegroundColor Green 

write-host $RecomendedClusterHotfix.Description 

Write-Host "--------------------------" 

$witness = 1 

} 

} 

if($witness -eq 0) 

{ 

Write-Host "--------------------------" 

Write-Host "Hyper-V Host: "$VMHost 

Write-Host $RecomendedClusterHotfix.Id "not installed" -ForegroundColor Red 

write-host $RecomendedClusterHotfix.Description 

Write-Host "--------------------------" 

} 

} 

Write-Host $version $HyperHostName -ForegroundColor Green 

}
```

Cheers,

**Marcos Nogueira**
**_MVP_**  
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
