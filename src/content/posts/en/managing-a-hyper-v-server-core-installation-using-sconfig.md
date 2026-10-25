---
title: "Managing a Hyper-V Server Core installation using sconfig"
description: "With all the benefits that Server Core bring such as performance, security and so on. But without the GUI, it's not easy to do the daily management and maintenance of Hyper-V.…"
pubDate: 2013-10-10
category: hyper-v
tags: ["hyper-v", "server-core"]
translationKey: managing-a-hyper-v-server-core-installation-using-sconfig
legacy: true
legacyUrl: /2013/10/managing-a-hyper-v-server-core-installation-using-sconfig.html
---

With all the benefits that Server Core bring such as performance, security and so on. But without the GUI, it's not easy to do the daily management and maintenance of Hyper-V. If you want to change the computer name or the IP address, the GUI is always the easiest to use. But on the other hand, the command line can bring a fast and an automated process.

That's why since Windows Server 2012, the Server Core version of Windows and Microsoft Hyper-V Server 2012 comes with the Server Configuration (sconfig). This is a command line with a simple interface to reduce the time for doing the most common tasks in Windows.

In the following screenshot, you can see an example of sconfig's first page:

sconfig can do this via an intuitive numerical menu to facilitate the Windows configuration.

A simple example is when you have to change the IP address of your computer by using the command line. Have a look into the following command:
```js
netsh interface ip set address "Local Area Connection" static 10.10.10.10 255.255.255.0 10.10.10.1 1
```
Sometimes it is hard to remember the exact command syntax and this can lead to server misconfiguration.

Using sconfig, the process would be simply to press the numbers _8_, _0_, and then _1 _from the menu and simply specify the new IP configuration. That's it.

## SCONFIG Options

Besides IP configuration, the sconfig offers 13 other options:
  1. Domain/workgroup
  2. Computer name
  3. Adding local administrator
  4. Configuring remote management
  5. Windows update settings
  6. Downloading and installing updates
  7. Remote desktop
  8. Network settings
  9. Date and time
  10. Help in improving the product with CEIP
  11. Logging off the user
  12. Restarting the server
  13. Shutting down server

Here are some examples how to set up the most common configurations in your server core without advanced command lines.

### To change Domain/Workgroup
  1. Press **1**
  2. Than press **D** for Domain or **W** for Workgroup
  3. Specify the domain or workgroup name, the necessary username and the password and press **Enter**

### To change the computer name
  1. Press **2**_ _and specify the new computer name.
  2. Select **Yes** to restart the computer.

### To add a local administrator
  1. Press **3**.
  2. Enter the account to join the local administrators group and type the user password.

### To configure the remote management
  1. Press **4**.
  2. Select one of the following options:
    * Allow MMC Remote Management
    * Enable Windows PowerShell
    * Allow Server Manager Remote Management
    * Show Windows Firewall settings

### To change Windows update settings
  1. Press **5.**
  2. Select **A**_ _for automatic or **M**_ _for manual.

#### To download and install updates
  1. Press **6**.
  2. Select **A**_ _for all updates or **R**_ _for recommended updates only.

#### To enable remote desktop
  1. Press **7**.
  2. Select **E**_ _to enable or **D**_ _to disable.

#### To configure network settings
  1. Press **8**.
  2. Select the network adapter number you want to configure and then select one of the existing options:
    * Set network adapter IP address
    * Set DNS Servers
    * Clear DNS Server Settings

### To change the date and time
  1. Press **9**_ _and a graphical interface will show up with the date and time settings to be configured.

### To restart and shut down the server:
  * Press **1+0**_ _to join Customer Experience Improvement Program
  * Press **1+1**_ _for logoff
  * Press **1+2**_ _to restart the computer
  * Press **1+3**_ _to shut down the server
  * Press **1+4**_ _to exit to command line

After these configurations using sconfig and with reduced command line interaction, your server will be ready for the production environment.

## How it works

Server Configuration basically runs scripts in the background for every option that has been selected through a numeric menu, making your life much easier. For every number you select, sconfig can run another script to show a submenu or just run the final script to apply the changes you have selected.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
