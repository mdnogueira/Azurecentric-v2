---
title: "Server management and automation with Windows Server 2012 R2"
description: "Datacenter infrastructure has become complex: Multiple industry standards are confusing hardware vendors, and customers are looking for guidance on how to best automate their…"
pubDate: 2013-06-28
category: windows-server
tags: [hyper-v, rsat]
translationKey: server-management-and-automation-with-windows-server-2012-r2
legacy: true
legacyUrl: /2013/06/overview-of-server-virtualization-with-windows-server-2012-r2-2-2.html
---

Datacenter infrastructure has become complex: Multiple industry standards are confusing hardware vendors, and customers are looking for guidance on how to best automate their datacenter while adopting a standards-based management approach supporting their multi-vendor investments. Windows Server 2012 R2 enables IT professionals to meet this need by offering an integrated platform to automate and manage the increasing datacenter ecosystem. Windows Server 2012 R2 delivers capabilities to manage many servers and the devices connecting them, whether they are physical or virtual, on-premises or in the cloud.  

## Standards-based management 

Windows Server 2012 R2 enhances the manageability of datacenters through significant improvements in the standards-based infrastructure. It does this by delivering application programming interfaces (APIs) that are easier for developers and IT Pros to use. These APIs provide support for recent standards and add new kinds of Windows PowerShell commands (cmdlets) that make it simpler and more cost-effective to connect to and manage multiple servers and devices in the datacenter.  

WMI is a standard Common Information Model Object Manager (CIMOM) that hosts many standard class providers; however, early on, there was not an interoperable management protocol, so WMI used the Distributed Component Object Model (DCOM). This made it an “island of management” for Windows managing Windows.  

This situation changed with the DMTF’s definition and approval of WS-Man, a SOAP-based, firewall-friendly protocol that allows a client on any operating system to invoke operations on a standards-compliant CIMOM running on any platform. Microsoft shipped the first partial implementation of WS-Man in Windows Server 2003 and named it Windows Remote Management (WinRM).  

Since Windows Server 2012, WinRM has become the default protocol for management. This provides interoperability with a number of CIMOM and WS-Man stacks available on other platforms, including Openwsman (Perl, Python, Java, and Ruby Bindings), Wiseman, and OpenPegasus.  

## Simplified multi-server management 

Since Windows Server 2012, the capabilities of **Server Manager **have expanded considerably to facilitate multi-server tasks, such as remote role and feature deployment to both physical and virtual servers, remote role and feature management, and custom server group creation.  

By using Server Manager in Windows Server 2012 R2, you can provision servers and offline virtual hard disks from your desktop without requiring either physical access to the system or Remote Desktop Protocol (RDP) connections to each server. Server Manager also helps administrators manage groups of servers collectively from a single, integrated console, allowing them respond to business-critical problems with greater speed and agility.  

## Robust automation 

Windows PowerShell offers comprehensive, resilient, and simple automation of your Windows Servers to help you manage most server roles and aspects of the datacenter. PowerShell sessions to remote servers are resilient and can withstand various types of interruptions. In addition, learning Windows PowerShell has become much easier than ever through improved cmdlet discovery, simplified, consistent syntax across all cmdlets and an integrated scripting environment. In Windows Server 2012 R2, Windows **PowerShell 4.0 **delivers over 3,000 cmdlets to enable you to manage server roles and automate management tasks quickly.  

You can also execute and monitor scripts more efficiently through more robust session connectivity, workflow capabilities, enhanced job scheduling, and Windows PowerShell Web Access. Last not least, you can write Windows PowerShell scripts more quickly and intuitively through the built-in Integrated Scripting Environment (ISE) that enables script sharing, which connects IT Professionals to a larger Windows PowerShell user community.  

In addition to the enhanced functionality of Windows PowerShell, you can also rely on new management capabilities in Windows Server 2012 R2 for deploying resources in a repeatable, reliable and standardized manner.  

For example, **Desired State Configuration **provides the ability to help standardize deployments by enabling you to ensure that the components of your datacenter have the correct configuration. To that effect, Windows Server 2012 R2 has PowerShell language extensions and providers which enable declarative, autonomous and repeatable deployment, configuration and conformance of standards-based managed elements. This provides the ability to define the exact configuration of target nodes (computers or devices) and prevent “configuration drift”, thereby providing stable, reliable, standardized deployments.  

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
