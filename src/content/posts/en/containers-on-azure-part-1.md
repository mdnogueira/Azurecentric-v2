---
title: "Containers on Azure – Part 1"
description: "In the last decade, hardware virtualization has drastically changed the IT landscape. One of many consequences of this trend is the emergence of cloud computing. However, a…"
pubDate: 2017-05-13
category: apps
tags: ["containers", "service-fabric", "container-service", "linux"]
translationKey: containers-on-azure-part-1
legacy: true
legacyUrl: /2017/05/containers-on-azure-part-1.html
---

In the last decade, hardware virtualization has drastically changed the IT landscape. One of many consequences of this trend is the emergence of cloud computing. However, a more recent virtualization approach promises to bring even more significant changes to the way you develop, deploy, and manage compute workloads. This approach is based on the concept of _containers_.

These series of posts explain containers and the ways you can implement them in Azure and in your on-premises datacenter.

When this concept was introduced on the Microsoft world, it was somehow difficult to me, to understand the all concept and how I will use it. So, my propose here is to easy the path and explain how containers works and the ways you can implement them in Azure and in your on-premises datacenter. The goal is to facilitate the path to deploy clusters of containerized workloads by using Azure Container Services (ACS).

Azure Service Fabric offers an innovative way to design and provision applications by dividing them into small, independently operating components called _microservices_. Containers and microservices are complementary technologies. By combining them, you can further increase the density of your workloads, optimize resource usage, and minimize cost.

## What is Containers?

On a very simplistic way, containers are the next stage in virtualizing computing resources. Hardware virtualization freed people to a large extent from the constraints imposed by physical hardware. It enabled running multiple isolated instances of operating systems concurrently on the same physical hardware. Container-based virtualization virtualizes the operating system, allowing you to run multiple applications within the same operating system instance while maintaining isolation. Containers within a virtual machine provide functionality similar to that of virtual machines on a physical server. To better understand this analogy, this topic compares virtual machines with containers.

The following table lists the high-level differences between virtual machines and containers.
<table style="border: 1px solid black;" >
<tbody >
<tr style="border: 1px solid black;" >

<td width="128" > Feature
</td>

<td width="276" >Virtual machines
</td>

<td width="297" >Containers
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="129" >Isolation mechanism
</td>

<td width="276" >Built in to the hypervisor
</td>

<td width="296" >Relies on operating system support.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="128" >Required amount of memory
</td>

<td width="276" >Includes operating system and app requirements
</td>

<td width="297" >Includes containerized apps requirements only.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="128" >Startup time
</td>

<td width="276" >Includes operating system boot, start of services, apps, and app dependencies
</td>

<td width="300" >Includes only start of apps and app dependencies. The operating system is already running.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="128" >Portability
</td>

<td width="276" >Portable, but the image is larger because it includes the operating system
</td>

<td width="310" >More portable, because the image includes only apps and their dependencies.
</td>
</tr>
<tr style="border: 1px solid black;" >

<td width="128" >Image automation
</td>

<td width="276" >Depends on the operating system and apps
</td>

<td width="300" >Based on the Docker registry (for Docker images).
</td>
</tr>
</tbody>
</table>

To better understand the difference between Virtual Machines and Containers, I highly suggest reading the following article, refer to [Virtual Machines and Containers in Azure](https://docs.microsoft.com/en-ca/azure/virtual-machines/linux/containers)

Compared with virtual machines, containers offer several benefits, including:
  * Increased speed with which you can develop and share application code.
  * An improved testing lifecycle for applications.
  * An improved deployment process for applications.
  * The increased density of your workloads, resulting in improved resource utilization.

The most popular containerization technology is available from Docker. Docker uses Linux built-in support for containers. Windows Server 2016 includes a container feature that deliver equivalent functionality in the Windows Server operating system.

## Azure Container Service

ACS allows you to administer clusters of multiple Docker hosts running containerized apps. ACS manages the provisioning of cloud infrastructure components, including Azure virtual machines and virtual machine scale sets, Azure storage, virtual networks, and load balancers. Additionally, it provides the management and scaling of containerized apps to tens of thousands of containers via integration with the following two orchestration engines:
  * The Mesosphere Datacenter Operating System (DC/OS). A distributed operating system provided by the Apache Software Foundation.
  * Docker Swarm. Clustering software provided by Docker.

Based on this integration, you can manage ACS clusters on the DC/OS or the Docker Swarm platform by relying on the same tools you use to manage your existing containerized workflows.

You can provision an ACS cluster directly from the Azure portal. Alternatively, you can use the Azure Resource Manager template or Azure command-line interface. During provisioning, you choose either DC/OS or Docker Swarm as the framework configuration. Subsequent configuration and management specifics depend mainly on this choice. Although both orchestration engines fully support Docker-formatted containers and Linux-based container isolation, they have architectural and functional differences, including:
  * DC/OS contains a Master availability set, public agent virtual machine scale set, and private agent virtual machine scale set, with fault-tolerant master/subordinate instances replicated by using Apache ZooKeeper. Docker Swarm contains a Master availability set and the agent virtual machine scale set.
  * DC/OS includes by default the Marathon orchestration platform, which manages the cluster-wide scheduling of containerized workloads. It supports multiple-resource scheduling that takes memory, CPU, disks, and ports into consideration.
  * With Docker Swarm, you can use the Docker command-line interface or the standard Docker application programming interface (API). DC/OS offers the REST API for interacting with its orchestration platform.

## Azure Service Fabric

Azure Service Fabric is a cloud-based platform for developing, provisioning, and managing distributed, highly scalable, and highly available services and applications. Its capabilities result from dividing the functionality provided by these services and applications into individual components called microservices. Common examples of such microservices include the shopping carts or user profiles of commercial websites and the queues, gateways, and caches that provide infrastructure services. Multiple instances of these microservices run concurrently on a cluster of Azure virtual machines.

This approach might sound similar to building multitier applications by using Azure Cloud Services, which allows you to independently scale web and worker tiers. However, Azure Service Fabric operates on a much more granular level, as the term microservices suggests. This allows for much more efficient resource utilization while scaling to potentially thousands of virtual machines. Additionally, it allows developers to introduce gradual changes in the code of individual application components without having to upgrade the entire application.

Another feature that distinguishes Azure Service Fabric from traditional Platform as a Service (PaaS) services is support for both stateless and stateful components. Azure Cloud Services are stateless by design. To save state information, they have to rely on other Azure services, such as Azure Storage or Azure SQL Database. Azure Service Fabric, on the other hand, offers built-in support for maintaining state information. This minimizes or even eliminates the need for a back-end storage tier. It also decreases the latency when accessing application data.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
