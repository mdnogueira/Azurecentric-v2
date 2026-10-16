---
title: "Azure Classic Virtual Machines – Why use it?"
description: "Other day I was with on a customer that ask me why he should not create Azure classic virtual machines? He did create much of his IaaS infrastructure on the classic portal. He…"
pubDate: 2017-03-15
category: compute
tags: []
translationKey: azure-classic-virtual-machines-why-use-it
legacy: true
legacyUrl: /2017/03/azure-classic-virtual-machines-why-use-it.html
---

Other day I was with on a customer that ask me why he should not create Azure classic virtual machines? He did create much of his IaaS infrastructure on the classic portal. He basically wants to understand why he should move or even start to create the virtual machines on the ARM Portal.

One of the main distinguishing characteristics of classic virtual machines—in comparison with Azure Resource Manager—is their inherent dependency on cloud services. Any VM you create by using the classic deployment model becomes part of a new or an existing cloud service.

A cloud service constitutes a logical boundary for virtual machines it contains, offering several additional features, including:
  * A public IP address and associated Domain Name System (DNS) name in the cloudapp.net DNS namespace.
  * Support for endpoints, which you can use to expose individual ports of VMs within the cloud service for external access (from the Internet or other Azure services).
  * Automatic name resolution and direct communication between its VMs without the need to use their fully qualified domain names (FQDNs).
  * Automatic assignment of private IP addresses to its VMs.

In addition to being part of a cloud service—which is mandatory in the classic deployment model— a virtual machine can also belong to a virtual network. By implementing this approach, you allow for direct communication between VMs in different cloud services, as long as they are on the same virtual network or on virtual networks connected to each other.

To deploy a classic VM into a virtual network, you must implement that virtual network by using classic. In other words, classic VMs require a classic VNet and, conversely, classic VNets support only classic VMs.

While the network model changed significantly in Azure Resource Manager, the VNet IP addressing rules remain the same. This means that you can follow the ARM VNet design guidelines. On the other hand, the network implementation procedures have changed in Azure Resource Manager.

In addition, note that external connectivity to classic VMs generally (with the exception of instance-level IP addresses, which are described below) relies on cloud service endpoints. Because Azure Resource Manager does not support cloud services, you will not be able to leverage topics applicable to Azure Resource Manager–based implementations, but instead, follow the information provided here.

An endpoint allows access to a VM residing in a cloud service via its public IP address, either TCP or UDP protocol, and an arbitrary public port, which maps to a designated internal port of the VM. By default, provisioning a Windows-classic VM automatically creates a Remote Desktop Protocol (RDP) and a Windows Remote Management (WinRM) endpoint. Similarly, provisioning a Linux- VM results in the creation of a Secure Shell (SSH) endpoint. You have the option of disabling any of them at the time of deploying the virtual machine or at any point afterwards. Keep in mind that disabling the endpoint affects only external connectivity, still allowing you to connect to the virtual machine from within the same cloud service or virtual network.

You can also create additional, custom endpoints for VMs. Endpoint can be configured as part of a load-balanced set, to provide traffic distribution across multiple VMs. It can also be configured for direct server return. This provides the VM endpoint the floating IP capability necessary to set up a SQL AlwaysOn Availability Group.

## **Instance-level Public IP Addresses**

If you want to be able to connect to a VM from outside the cloud service by an IP address assigned directly to it, rather than by using the **cloud service VIP:<_portnumber_>**, you can use instance-level Public IP (PIP) addressing.

Typical usage scenarios for PIPs include:
  * Passive FTP. Using a PIP, the VM can receive traffic on any port. This enables scenarios such as passive FTP where the ports are chosen dynamically.
  * Outbound IP. Outbound traffic originating from the VM uses PIP as the source, which uniquely identifies the VM to external entities.

## **Azure Load Balancing**

Azure Load Balancing for classic virtual machines also relies on the capabilities inherent to cloud services. To configure Azure load balancing across VMs in a cloud service, you must create the load-balanced set, and in this set include all of the VMs (within the same cloud service) that you want to respond to external requests to a particular public IP address and port number. These VMs listen on their private IP address and private port; the Azure Load Balancer, therefore, maps the public IP address and port number of the cloud service to the private IP address and port number of one VM in the set, and reverses this for the response traffic from the VM.

### **Direct Server Return**

One potential issue with Azure load balancing is the possibility of the load balancer to become a bottleneck if the volume of traffic is high. To remediate this issue, you can configure a load-balanced set to provide Direct Server Return. This feature allows the VM that is servicing a client request to respond directly to the client. Effectively, the load balancer is free to handle new requests, rather than keep processing responses. Direct Server Return is commonly implemented for video or audio, which are susceptible to network delays.

## **Availability sets**

Another classic VM feature that relies on the existence of cloud services is the availability set. In this context, an availability set represents a logical grouping of virtual machines that belong to the same cloud service. Just as with Azure Resource Manager VM–based availability set, each virtual machine in the same availability set is automatically assigned a distinct **Update Domain** (up to two) and a **Fault Domain** (up to five).

## **Access Control List**

A cloud service facilitates protection of its endpoints by allowing you to associate them with Access Control Lists (ACLs). An ACL contains a range of external IP addresses for which the access should be either explicitly permitted or denied. However, the functionality provided by ACLs has been superseded by Network Security Group, which you can use to control not only external but also internal (within a virtual network) traffic, so at this point, there is no compelling reason to use them anymore.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
