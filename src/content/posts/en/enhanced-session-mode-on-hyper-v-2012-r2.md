---
title: "Enhanced Session Mode on Hyper-V 2012 R2"
description: "One of the new features or improved feature on Windows Server 2012 R2 is the enhanced session mode through virtual machine connection. Hyper-V and the Virtual Machine…"
pubDate: 2013-07-03
category: hyper-v
tags: [hyper-v-server]
translationKey: enhanced-session-mode-on-hyper-v-2012-r2
legacy: true
legacyUrl: /2013/07/enhanced-session-mode-on-hyper-v-2012-r2.html
---

One of the new features or improved feature on Windows Server 2012 R2 is the enhanced session mode through virtual machine connection. Hyper-V and the Virtual Machine Connection tool now support redirection of local resources to a virtual machine session. This feature provides similar type of device redirection to a virtual machine as you get with a Remote Desktop Connection session.  

## **Enhanced Session Mode**  

In previous versions of Hyper-V the Virtual Machine Connection utility only provided redirection of the virtual machine screen, keyboard, and mouse along with limited copy / paste functionality. To get additional redirection abilities a Remote Desktop Connection to the virtual machine could be initiated, but this would require a network path to the virtual machine.  

Starting with Hyper-V in Windows Server 2012 R2 Preview, Hyper-V can now redirect local resources to a virtual machine session through Virtual Machine Connection tool. The enhanced session mode connection uses a Remote Desktop Connection session via the virtual machine bus (VMBus), so no network connection to the virtual machine is required.  

The following local resources can be redirected when using the Virtual Machine Connection tool.  
  * Display configuration  
  * Audio  
  * Printers  
  * Clipboard  
  * Smart cards  
  * USB devices  
  * Drives  
  * Supported Plug and Play devices  

This feature is enabled by default in Client Hyper-V and is disabled by default on Hyper-V running on Windows Server.  

The following guest operating systems support enhanced session mode connections:  
  * Windows Server 2012 R2 Preview  
  * Windows 8.1 Preview  

## **Practical applications**  

In previous versions of Hyper-V the way to copy files to and from a virtual machine was via a Remote Desktop Connection session or a network file copy, but these require a working network connection. When connecting to a virtual machine using the Virtual Machine Connection tool you could only copy and paste a limited amount of ASCII text to the virtual machine.  

Enhanced session mode allows you to redirect local resources to the a virtual machine in the same way as you can with Remote Desktop Connection, but you do not need network connection to the virtual machine. You only need to be able to connect to the server running Hyper-V where the virtual machine is running.  

Enhanced session mode can useful in the following scenarios:  
  * Troubleshooting a virtual machine without the need for a network connection to the virtual machine.  
  * Login to the virtual machine via smart card  
  * Printing from a virtual machine to a local printer  
  * Developers can now fully test and troubleshoot applications running in a virtual machine that require USB and sound redirection without the need to use Remote Desktop Connection.  

## **Configuring Enhanced Session Mode**  

Configuration of enhanced session mode is done in the following areas:  
  * Server settings –**Enhanced Session Mode Policy**  
  * User setting –**Enhanced Session Mode**  
  * Guest operating system  

## **Server settings – Enhanced Session Mode Policy**  

This setting affects all virtual machines running on the server running Hyper-V.  

The **Allow enhanced session mode** setting will determine to allow or not allow enhanced session mode connections to virtual machines running on the server running Hyper-V. If this setting is enabled Hyper-V will allow enhanced session mode connections to a virtual machine when the following conditions are met:  
  * An enhanced session mode connection has been requested by the Virtual Machine Connection tool.  
  * The virtual machine is running an operating system which supports enhanced session mode.  
  * The **Remote Desktop Service** is running in the virtual machine.  

When the **Allow enhanced session mode** setting is disabled, connections from the Virtual Machine Connection tool will use a basic session.  
  **NOTE:** The default setting for the **Allow enhanced session mode** is:  
    * Hyper-V on Windows Server 2012 R2 Preview - Disabled  
    * Client Hyper-V - Enabled

## **User settings – Enhanced Session Mode**  

This setting will determine if the Virtual Machine Connection tool will attempt to use enhanced session mode when available in a guest operating system. When **Use enhanced session mode** is enable device redirection will take place when the following conditions are met:  
  * **Allow enhanced session mode** is enabled on the server running Hyper-V.  
  * The virtual machine is running an operating system which supports enhanced session mode.  
  * The **Remote Desktop Service** is running in the virtual machine.  

## **Guest operating system**  

The following is a list of the guest operating systems that support enhanced session mode connections.  
  * Windows Server 2012 R2 Preview  
  * Windows 8.1 Preview  

Additionally the **Remote Desktop Service** needs to be running and the user account you be using to log on to the virtual machine needs to be a member of the **Remote Desktop Users** local group or the local **Administrators** group.  
  **NOTE:** Remote Desktop Services group policy and local group policy settings are enforced for enhanced session mode connections. So if there is a policy in effect that does not allow the redirection of printers, printer redirection in a Virtual Machine Connection session will be blocked as it would be for regular Remote Desktop Connection sessions.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
