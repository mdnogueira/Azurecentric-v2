---
title: "How to extend Azure Service Fabric to on-premise?"
description: "You can deploy a Service Fabric cluster on any physical or virtual machine running the Windows Server operating system, including ones residing in your on-premises datacenters.…"
pubDate: 2017-04-19
category: apps
tags: [service-fabric, powershell, failover-cluster, high-availability, hyper-v]
translationKey: how-to-extend-azure-service-fabric-to-on-premise
legacy: true
legacyUrl: /2017/04/how-to-extend-azure-service-fabric-to-on-premise.html
---

You can deploy a Service Fabric cluster on any physical or virtual machine running the Windows Server operating system, including ones residing in your on-premises datacenters. You use the standalone Windows Server package available for download from the Azure online documentation website ([see here](http://go.microsoft.com/fwlink/?LinkId=730690)).

To deploy an on-premises Service Fabric cluster, perform the following steps:
  1. Plan for your cluster infrastructure. You must consider the resiliency of the hardware and network components and the physical security of their location because in this scenario, you can no longer rely on the resiliency and security features built in to the Azure platform.	
  2. Prepare the Windows Server computer to satisfy the prerequisites. Each computer must be running Windows Server 2012 or Windows Server 2012 R2, have at least 2 GB of RAM, and have the Microsoft .NET Framework 4.5.1 or later. Additionally, ensure that the Remote Registry service is running.
  3. Determine the initial cluster size. At a minimum, the cluster must have three nodes, with one node per physical or virtual machine. Adjust the number of nodes according to your projected workload.
  4. Determine the number of fault domains and upgrade domains. The assignment of fault domains should reflect the underlying physical infrastructure and the level of its resiliency to a single component failure. Typically, you consider a single physical rack to constitute a single fault domain. The assignment of upgrade domains should reflect the number of nodes that you plan to take down during application or cluster upgrades.
  5. Download the Service Fabric standalone package for Windows Server.
  6. Define the cluster configuration. Specify the cluster settings before provisioning. To do this, modify the **ClusterConfig.json** file included in the Service Fabric standalone package for Windows Server. The file has several sections, including:
    * **NodeTypes**. NodeTypes allow you to divide cluster nodes into groups represented by a node types and assign common properties to the nodes within each group. These properties specify endpoint ports, placement constraints, or capacities.
    * **Nodes**. Nodes determine the settings of individual cluster nodes, such as the node name, IP address, fault domain, or upgrade domain.
  7. Run the create cluster script. After you modify the **ClusterConfig.json** file to match your requirements and preferences, run the **CreateServiceFabricCluster.ps1** Windows PowerShell script and reference the .json file as its parameter. You can run the script on any computer with connectivity to all the cluster nodes.
  8. Connect to the cluster. To manage the cluster, connect to it via [**http://**_IP_Address_of_a_node**:**_**19080/Explorer/index.htm**](http://IP_Address_of_a_node:19080/Explorer/index.htm), where _IP_Address_of_a_node _is the IP address of any of the cluster nodes.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
