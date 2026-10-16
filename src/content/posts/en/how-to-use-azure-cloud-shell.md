---
title: "How to use Azure Cloud Shell"
description: "Since when they announce the Azure Cloud Shell (see post here), I’ve been waiting to use the PowerShell on the Azure Cloud Shell. I’m still growing my learning how to use the…"
pubDate: 2017-11-15
category: automation
tags: [azure-cli, powershell]
translationKey: how-to-use-azure-cloud-shell
cover: ../../../assets/old/posts/2017/11/ACS1.png
coverAlt: "How to use Azure Cloud Shell"
legacy: true
legacyUrl: /2017/11/how-to-use-azure-cloud-shell.html
---

Since when they announce the Azure Cloud Shell (see post [here](/posts/azure-cloud-shell)), I’ve been waiting to use the PowerShell on the Azure Cloud Shell. I’m still growing my learning how to use the Azure CLI, but PowerShell I’ve been using for years, and I feel way more comfortable with it.

So, how I can use Azure Cloud Shell? Just open the Azure Portal, and on the top bar, between the Notifications and the Settings you will find the Azure Cloud Shell icon  

![Image1](../../../assets/old/posts/2017/11/ACS1.png) .

![Image2](../../../assets/old/posts/2017/11/ACS2.png)

When you click on the icon, it will ask you to configure the Azure Cloud Shell. The process will provision machines, where you can run the shells (Azure CLI and Azure PowerShell). It’s a fairly simple process. Just follow the steps below.

1. Choose what is your Shell of choice. It doesn’t matter if you choose Bash or PowerShell. You can always switch back and forward after the initial setup.

![Image3](../../../assets/old/posts/2017/11/ACS3.png)
 	
2. Choose what is the subscriptions that you want to use. Then you have the simple option of creating the storage or click in **Show advanced setting**. In this case I opt for the advanced settings.

![Image4](../../../assets/old/posts/2017/11/ACS4.png)
 	
3. On the Advanced setting, you can specify the Resource Group, Storage Account and File Share names that you want to use.

![Image5](../../../assets/old/posts/2017/11/ACS5.png)

  **NOTE:** Just remember that you have to follow the requirements how to create storage account and file shares (small caps and alphanumeric characters).

4. In this case I select the Bash. After I click create, starting to provision the machines. First create all the resources from the previous step.

![Image6](../../../assets/old/posts/2017/11/ACS6.png)
 	
5. After the creation of the resources, it’s connecting to the Bash terminal.

![Image7](../../../assets/old/posts/2017/11/ACS7.png)
 	
6. And that is the end! Now you can start to use the Azure CLI on the Azure Portal.

![Image8](../../../assets/old/posts/2017/11/ACS8.png)

## Changing to PowerShell (or Shell)

After you create the Azure Cloud Shell, you can switch from Bash to PowerShell and vice versa. To do that, just follow the steps:

1. Click on the Shell that you are using. In this case I was using Bash. When you click the drop box, you will see the other Shell.

![Image9](../../../assets/old/posts/2017/11/ACS9.png)
 	
2. Select the Shell that you want. In this case PowerShell, then click Restart.

![Image10](../../../assets/old/posts/2017/11/ACS10.png)
 	
3. After that, the Azure Cloud Shell is shutdown the previous Shell and it will restart on the new Shell (even if you never use it before).

![Imag11](../../../assets/old/posts/2017/11/ACS11.png)
 	
4. Now it’s creating all the resources required for the first use.

![Image12](../../../assets/old/posts/2017/11/ACS12.png)
 	
5. After the creating of all the resources, it will connect to the terminal.

![Image13](../../../assets/old/posts/2017/11/ACS13.png)
 	
6. Finished! Now you can you use the PowerShell on Azure portal.

![Image14](../../../assets/old/posts/2017/11/ACS14.png)

Because you are login at the Azure Portal, you don’t need to run the PowerShell command **_Login-AzureRm_**. You can start from there.

![Image15](../../../assets/old/posts/2017/11/ACS15.png)

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
