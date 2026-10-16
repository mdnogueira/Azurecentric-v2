---
title: "Windows Server 2012 R2 Hyper-V vs VMware vSphere 5.5"
description: "On my search for comparing the newest version of VMware with Hyper-V 2012 R2 I found this chart that I think it will summarize what you need to know about the two Hypervisors."
pubDate: 2013-09-30
category: hyper-v
tags: [dynamic-optimization, system-center, scvmm]
translationKey: windows-server-2012-r2-hyper-v-vs-vmware-vsphere-5-5
legacy: true
legacyUrl: /2013/09/windows-server-2012-r2-hyper-v-vs-vmware-vsphere-5-5.html
---

On my search for comparing the newest version of VMware with Hyper-V 2012 R2 I found this chart that I think it will summarize what you need to know about the two Hypervisors.  

#### How to compare?

Rather than simply comparing feature-by-feature using just simple check-marks in each category, I’ll try to provide as much detail as possible for you to intelligently compare each area. For each comparison area, I’ll rate the related capabilities with the following color coded rankings:  
  * **Supported** – Fully supported without any additional products or licenses  
  * **Limited Support** – Significant limitations when using related feature, or limitations in comparison to the competing solution represented  
  * **Not Supported** – Not supported at all or without the addition of other product licensing costs

#### Licensing 

<table style="width:467.4pt;background:white;" cellspacing="0" width="1084" cellpadding="0" border="1" class="MsoNormalTable" > <tbody > <tr >
<td width="171" style="width:102.4pt;padding:1.2pt;" valign="top" >
</td>
<td width="159" style="width:95.65pt;padding:1.2pt;" valign="top" >

**Microsoft**   
Windows Server 2012 R2   
+ System Center 2012 R2 Datacenter Editions

</td>
<td width="171" style="width:102.6pt;padding:1.2pt;" valign="top" >

**VMware**   
vSphere 5.5 Enterprise Plus + vCenter Server 5.5

</td>
<td width="581" style="width:166.75pt;padding:1.2pt;" valign="top" >

**Notes**

</td></tr> <tr >
<td width="171" style="width:102.4pt;padding:1.2pt;" valign="top" >

## of Physical CPUs per License

</td>
<td width="159" style="width:95.65pt;padding:1.2pt;" valign="top" >

**2**

</td>
<td width="171" style="width:102.6pt;padding:1.2pt;" valign="top" >

**1**

</td>
<td width="581" style="width:166.75pt;padding:1.2pt;" valign="top" >

With Microsoft, each Datacenter Edition license provides licensing for up to 2 physical CPUs per Host. Additional licenses can be “stacked” if more than 2 physical CPUs are present.   
  
With VMware, a vSphere 5.5 Enterprise Plus license must be purchased for each physical CPU. This difference in CPU licensing is one of the factors that can contribute to increased licensing costs. In addition, a minimum of one license of vCenter Server 5.5 is required for vSphere deployments.

</td></tr> <tr >
<td width="171" style="width:102.4pt;padding:1.2pt;" valign="top" >

## of Managed OSE’s per License

</td>
<td width="159" style="width:95.65pt;padding:1.2pt;" valign="top" >

**Unlimited**

</td>
<td width="171" style="width:102.6pt;padding:1.2pt;" valign="top" >

**Unlimited**

</td>
<td width="581" style="width:166.75pt;padding:1.2pt;" valign="top" >

Both solutions provide the ability to manage an unlimited number of Operating System Environments per licensed Host.

</td></tr> <tr >
<td width="171" style="width:102.4pt;padding:1.2pt;" valign="top" >

## of Windows Server VM Licenses per Host

</td>
<td width="159" style="width:95.65pt;padding:1.2pt;" valign="top" >

**Unlimited**

</td>
<td width="171" style="width:102.6pt;padding:1.2pt;" valign="top" >

**0**

</td>
<td width="581" style="width:166.75pt;padding:1.2pt;" valign="top" >

With VMware, Windows Server VM licenses must still be purchased separately. In environments virtualizing Windows Server workloads, this can contribute to a higher overall cost when virtualizing with VMware.  
  
VMware does include licenses for an unlimited # of VMs running SUSE Linux Enterprise Server per Host.

</td></tr> <tr >
<td width="171" style="width:102.4pt;padding:1.2pt;" valign="top" >

Includes Anti-virus / Anti-malware protection

</td>
<td width="159" style="width:95.65pt;padding:1.2pt;" valign="top" >

**Yes **- System Center Endpoint Protection agents included for both Host and VMs with System Center 2012 R2

</td>
<td width="171" style="width:102.6pt;padding:1.2pt;" valign="top" >

**Yes** – Includes vShield Endpoint Protection which deploys as EPSEC thin agent in each VM + separate virtual appliance.

</td>
<td width="581" style="width:166.75pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="171" style="width:102.4pt;padding:1.2pt;" valign="top" >

Includes full SQL Database Server licenses for management databases

</td>
<td width="159" style="width:95.65pt;padding:1.2pt;" valign="top" >

**Yes** – Includes all needed database server licensing to manage up to 1,000 hosts and 25,000 VMs per management server.

</td>
<td width="171" style="width:102.6pt;padding:1.2pt;" valign="top" >

**No **– Must purchase additional database server licenses to scale beyond managing 100 hosts and 3,000 VMs with vCenter Server Appliance.

</td>
<td width="581" style="width:166.75pt;padding:1.2pt;" valign="top" >

VMware licensing includes an internal vPostgres database that supports managing up to 100 hosts and 3,000 VMs via vCenter Server Appliance. 

</td></tr> <tr >
<td width="171" style="width:102.4pt;padding:1.2pt;" valign="top" >

Includes licensing for Operations Monitoring and Management.

</td>
<td width="159" style="width:95.65pt;padding:1.2pt;" valign="top" >

**Yes** – Included in System Center 2012 R2

</td>
<td width="171" style="width:102.6pt;padding:1.2pt;" valign="top" >

**No** – Operations Monitoring and Management requires separate license for vCenter Operations Manager or upgrade to vSphere with Operations Management

</td>
<td width="581" style="width:166.75pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="171" style="width:102.4pt;padding:1.2pt;" valign="top" >

Includes licensing for Private Cloud Management capabilities – pooled resources, self-service, delegation, automation, elasticity, chargeback/showback

</td>
<td width="159" style="width:95.65pt;padding:1.2pt;" valign="top" >

**Yes** – Included in System Center 2012 R2

</td>
<td width="171" style="width:102.6pt;padding:1.2pt;" valign="top" >

**No** – Private Cloud Management capabilities require additional cost of VMware vCloud Suite.

</td>
<td width="581" style="width:166.75pt;padding:1.2pt;" valign="top" >
</td></tr></tbody></table>

#### Virtualization Scalability

<table style="background:white;" cellspacing="0" width="628" cellpadding="0" border="1" class="MsoNormalTable" > <tbody > <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >
</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Microsoft**   
Windows Server 2012 R2   
+ System Center 2012 R2 Datacenter Editions

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**VMware**   
vSphere 5.5 Enterprise Plus + vCenter Server 5.5

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >

**Notes**

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Maximum # of Logical Processors per Host

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**320**

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**320**

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >

With vSphere 5.5 Enterprise Plus, VMware has “caught up” to Microsoft in terms of Maximum # of Logical Processors supported per Host.

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Maximum Physical RAM per Host

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**4TB**

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**4TB**

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >

With vSphere 5.5 Enterprise Plus, VMware has “caught up” to Microsoft in terms of Maximum Physical RAM supported per Host.

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Maximum Active VMs per Host

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**1,024**

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**512**

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Maximum Virtual CPUs per VM

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**64**

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**64**

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >

When using VMware FT, only 1 Virtual CPU per VM can be used.

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Hot-Adjust Virtual CPU Resources to VM

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes **- Hyper-V provides the ability to increase and decrease Virtual Machine limits for processor resources on running VMs.

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**Yes **- Can Hot-Add virtual CPUs for running VMs on selected Guest Operating Systems and adjust Limits/Shares for CPU resources.

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >

VMware Hot-Add CPU feature requires supported Guest Operating System. Check VMware Compatibility Guide for details.  
  
VMware Hot-Add CPU feature not supported when using VMware FT

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Maximum Virtual RAM per VM

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**1TB**

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**1TB**

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >

When using VMware FT, only 64GB of Virtual RAM per VM can be used.

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Hot-Add Virtual RAM to VM

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**( [Dynamic Memory](http://technet.microsoft.com/en-us/library/hh831766.aspx) )

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >

Requires supported Guest Operating System.

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Dynamic Memory Management

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**( [Dynamic Memory](http://technet.microsoft.com/en-us/library/hh831766.aspx) )

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**Yes** (Memory Ballooning) Note that memory overcommit is not supported for VMs that are configured as an MSCS VM Guest Cluster.

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >

VMware vSphere 5.5 also supports another memory technique: Transparent Page Sharing (TPS). While TPS was useful in the past on legacy server hardware platforms and operating systems, it is no longer effective in many environments due to modern servers and operating systems supporting Large Memory Pages (LMP) for improved memory performance.

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Guest NUMA Support

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >

NUMA = Non-Uniform Memory Access. Guest NUMA support is particularly important for scalability when virtualizing large multi-vCPU VMs on Hosts with a large number of physical processors.

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Maximum # of physical Hosts per Cluster

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**64**

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**32**

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Maximum # of VMs per Cluster

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**8,000**

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**4,000**

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Virtual Machine Snapshots

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** - Up to 50 snapshots per VM are supported.

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

Yes - Up to 32 snapshots per VM chain are supported, but VMware only recommends 2-to-3.  
  
In addition, VM Snapshots are not supported for VMs using an iSCSI initiator.

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Integrated Application Load Balancing for Scaling-Out Application Tiers

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** - via System Center 2012 R2 VMM

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**No** – Requires additional purchase of vCloud Network and Security (vCNS) or vCloud Suite.

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Bare metal deployment of new Hypervisor hosts and clusters

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** - via System Center 2012 R2 VMM

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**Yes** – Vmware Auto Deploy and Host Profiles supports bare metal deployment of new hosts into an existing cluster, but does not support bare metal deployment of new clusters.

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Bare metal deployment of new Storage hosts and clusters

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** - via System Center 2012 R2 VMM

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

GPU Virtualization for Advanced VDI Graphics

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** - Server GPUs can be virtualized and shared across VDI VMs via RemoteFX.

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**Yes** - via virtual GPU support.

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Virtualization of USB devices

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** - Client USB devices can be passed to VMs via Remote Desktop connections. Direct redirection of USB storage from Host possible with Windows-to-Go certified devices. Direct redirection of other USB devices possible with third-party solutions.

</td>
<td width="169" style="width:101.5pt;padding:1.2pt;" valign="top" >

**Yes** - via USB Pass-through support.

</td>
<td width="126" style="width:167.85pt;padding:1.2pt;" valign="top" >
</td></tr></tbody></table>

#### VM Portability, High Availability and Disaster Recovery

<table style="background:white;" cellspacing="0" width="626" cellpadding="0" border="1" class="MsoNormalTable" > <tbody > <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >
</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Microsoft**   
Windows Server 2012 R2   
+ System Center 2012 R2 Datacenter Editions

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**VMware**   
vSphere 5.5 Enterprise Plus + vCenter Server 5.5

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >

**Notes**

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Live Migration of running VMs

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Unlimited concurrent Live VM Migrations. Provides flexibility to cap at a maximum limit that is appropriate for _your_datacenter architecture.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** – but limited to 4 concurrent vMotions per host when using 1GbE network adapters and 8 concurrent vMotions per host when using 10GbE network adapters.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Live Migration of running VMs without shared storage between hosts

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Supported via Shared Nothing Live Migration

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** – Supported via Enhanced vMotion.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Live Migration using compression of VM memory state

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Supported via Compressed Live Migration, providing up to a 2X increase in Live Migration speeds.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Live Migration over RDMA-enabled network adapters

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Supported via SMB-Direct Live Migration, providing up to a 10X increase in Live Migration speeds.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Live Migration of VMs Clustered with Windows Server Failover Clustering (MSCS Guest Cluster)

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – by configuring relaxed monitoring of MSCS VM Guest Clusters.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**No** – based on documented vSphere MSCS Setup Limitations

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Highly Available VMs

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Highly available VMs can be configured on a Hyper-V Host cluster. If the application running inside the VM is cluster aware, a VM Guest Cluster can also be configured via MSCS for faster application failover times.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** – Supported by VMware HA, but with the limitations listed above when using MSCS VM Guest Clusters.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Failover Prioritization of Highly Available VMs

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Supported by clustered priority settings on each highly available VM.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Affinity Rules for Highly Available VMs

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Supported by preferred cluster resource owners and anti-affinity VM placement rules.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Cluster-Aware Updating for Orchestrated Patch Management of Hosts.

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Supported via included Cluster-Aware Updating (CAU) role service.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** – Supported by vSphere 5.5 Update Manager, but if using vCenter Server Appliance, need separate 64-bit Windows OS license for Update Management server. If supporting more than 5 hosts and 50 VMs, also need a separate SQL database server.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Guest OS Application Monitoring for Highly Available VMs

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** – Provided by vSphere App HA, but limited to only the following applications: Apache Tomcat, IIS, SQL Server, Apache HTTP Server, SharePoint, SpringSource Runtime.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

VM Guest Clustering via Shared Virtual Hard Disk files

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Provided via native Shared VHDX support for VM Guest Clusters

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** – But only Single-Host VM Guest Clustering supported via Shared VMDK files. For VM Guest Clusters that extend across multiple hosts, must use RDM instead.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Intelligent Placement of new VM workloads

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Provided via Intelligent Placement in System Center 2012 R2

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** – Provided via vSphere DRS, but without ability to intelligently place fault tolerant VMs using VMware FT.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Automated Load Balancing of VM Workloads across Hosts

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Provided via Dynamic Optimization in System Center 2012 R2

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** - Provided via vSphere DRS, but without ability to load-balance VM Guest Clusters using MSCS.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Power Optimization of Hosts when load-balancing VMs

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Provided via Power Optimization in System Center 2012 R2

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** – Provided via vSphere DRS, with the same limitations listed above for Automated Load Balancing.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Fault Tolerant VMs

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**No** - The vast majority of application availability needs can be supported via Highly Available VMs and VM Guest Clustering on a more cost-effective and more-flexible basis than software-based fault tolerance solutions. If required for specific business applications, hardware-based fault tolerance server solutions can be leveraged where needed.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** – Supported via VMware FT, but there are a large number of limitations when using VMware FT, including no support for the following when using VMware FT: VM Snapshots, Storage vMotion, VM Backups via vSphere Data Protection, Virtual SAN, Multi-vCPU VMs, More than 64GB of vRAM per VM.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >

Software-based fault tolerance solutions, such as VMware FT, generally have significant limitations. If applications require more comprehensive fault tolerance than provided via Highly Available VMs and VM Guest Clustering, hardware-based fault tolerance server solutions offer an alternative choice without the limits imposed by software-based fault tolerance solutions.

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Backup VMs and Applicatons

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** - Provided via included System Center 2012 R2Data Protection Manager with support for Disk-to-Disk, Tape and Cloud backups.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** - Only supports Disk-to-Disk backup of VMs via vSphere Data Protection. Application-level backup integration requires separately purchased vSphere Data Protection Advanced.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Site-to-Site Asynchronous VM Replication

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Provided via Hyper-V Replica with 30-second, 5-minute or 15-minute replication intervals. Minimum RPO = 30-seconds.  
  
Hyper-V Replica also supports extended replication across three sites for added protection.

</td>
<td width="165" style="width:99.25pt;padding:1.2pt;" valign="top" >

**Yes** – Provided via vSphere Replication with minimum replication interval of 15-minutes. Minimum RPO = 15-minutes.

</td>
<td width="128" style="width:6cm;padding:1.2pt;" valign="top" >

In VMware solution, Orchestrated Failover of Site-to-Site replication can be provided via separately licensed VMware SRM.  
  
In Microsoft solution, Orchestrated Failover of Site-to-Site replication can be provided via included PowerShell at no additional cost. Alternatively, a GUI interface for orchestrating failover can be provided via the separately licensed Windows Azure HRM service.

</td></tr></tbody></table>

#### Storage

<table style="width:467.4pt;background:white;" cellspacing="0" width="779" cellpadding="0" border="1" class="MsoNormalTable" > <tbody > <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >
</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Microsoft**   
Windows Server 2012 R2   
+ System Center 2012 R2 Datacenter Editions

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**VMware**   
vSphere 5.5 Enterprise Plus + vCenter Server 5.5

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >

**Notes**

</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Maximum # Virtual SCSI Hard Disks per VM

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**256** ( Virtual SCSI )

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**60** ( PVSCSI )   
**120** ( Virtual SATA )

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Maximum Size per Virtual Hard Disk

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**64TB**

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**62TB**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >

vSphere 5.5 support for 62TB VMDK files is limited to when using VMFS5 and NFS datastores only.   
  
In vSphere 5.5, VMFS3 datastores are still limited to 2TB VMDK files.   
  
In vSphere 5.5, Hot-Expand, VMware FT, Virtual Flash Read Cache and Virtual SAN are not supported with 62TB VMDK files.

</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Boot VM from Virtual SCSI disks

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** ( Generation 2 VMs )

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Hot-Add Virtual SCSI VM Storage for running VMs

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Hot-Expand Virtual SCSI Hard Disks for running VMs

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes** – but not supported with new 62TB VMDK files.

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Hot-Shrink Virtual SCSI Hard Disks for running VMs

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Storage Quality of Service

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes**( Storage QoS )

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes**( Storage IO Control )

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >

In VMware vSphere 5.5, Storage IO Control is not supported for RDM disks.   
  
In Windows Server 2012 R2, Storage QoS is not supported for Pass-through disks.

</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Virtual Fibre Channel to VMs

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** ( 4 Virtual FC ports per VM )

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes** ( 4 Virtual FC ports per VM )

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >

vSphere 5.5 Enterprise Plus also includes a software initiator for FCoE support for VMs.   
  
While not included inbox in Windows Server 2012 R2, a no-cost ISV solution is available [here](http://www.starwindsoftware.com/downloads-free) to provide FCoE support for Hyper-V VMs.

</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Live Migrate Virtual Storage for running VMs

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** - Unlimited concurrent Live Storage migrations. Provides flexibility to cap at a maximum limit that is appropriate for _your_ datacenter architecture.

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes** – but only up to 2 concurrent Storage vMotion operations per host / only up to 8 concurrent Storage vMotion operations per datastore. Storage vMotion is also not supported for MSCS VM Guest Clusters.

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Flash-based Read Cache

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** - Using SSDs in Tiered Storage Spaces, limited up to 160 physical disks and 480 TB total capacity.

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes** – but only up to 400GB of cache per virtual disk / 2TB cumulative cache per host for all virtual disks.

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Flash-based Write-back Cache

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** - Using SSDs in Storage Spaces for Write-back Cache.

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

SAN-like Storage Virtualization using commodity hard disks.

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** – Included in Windows Server 2012 R2 Storage Spaces.

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >

VMware provides Virtual SAN which is included as an experimental feature in vSphere 5.5. You can test and experiment with Virtual SAN, but VMware does not expect it to be used in a production environment.

</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Automated Tiered Storage between SSD and HDD using commodity hard disks.

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** – Included in Windows Server 2012 R2 Storage Spaces.

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >

VMware provides Virtual SAN which is included as an experimental feature in vSphere 5.5. You can test and experiment with Virtual SAN, but VMware does not expect it to be used in a production environment.

</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Can consume storage via iSCSI, NFS, Fibre Channel and SMB 3.0.

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes** – Except no support for SMB 3.0.

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Can present storage via iSCSI, NFS and SMB 3.0.

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** – Available via included iSCSI Target Server, [NFS Server](http://technet.microsoft.com/en-us/library/jj592688.aspx) and Scale-out SMB 3.0 Serversupport. All roles can be clustered for High Availability.

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >

VMware provides vSphere Storage Appliance as a separately licensed product to deliver the ability to present NFS storage.

</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Storage Multipathing

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** – via MPIO and SMB Multichannel

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes** – via VAMP

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

SAN Offload Capability

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** – via ODX

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes** – via VAAI

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Thin Provisioning and Trim Storage

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** – Available via Storage Spaces Thin Provisioning and NTFS Trim Notifications.

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes** – but trim operations must be manually processed by running esxcli vmfs unmap command to reclaim disk space.

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Storage Encryption

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** – via BitLocker

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Deduplication of storage used by running VMs

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** – Available via included Data Deduplication role service.

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Provision VM Storage based on Storage Classifications

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** – via Storage Classifications in System Center 2012 R2

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes** – via Storage Policies, formerly called Storage Profiles, in vCenter Server 5.5

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Dynamically balance and re-balance storage load based on demands

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** – Storage IO load balancing and re-balancing is automatically handled on-demand by both SMB 3.0 Scale Out File Server and Automated Storage Tiers in Storage Spaces.

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**Yes** – Performed via Storage DRS, but limited in load-balancing frequency. The default DRS load-balance interval only runs at 8-hour intervals and can be adjusted to run load-balancing only as often as every 1-hour.

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="174" style="width:104.65pt;padding:1.2pt;" valign="top" >

Integrated Provisioning and Management of Shared Storage

</td>
<td width="156" style="width:93.4pt;padding:1.2pt;" valign="top" >

**Yes** - System Center 2012 R2 VMM includes storage provisioning and management of SAN Zoning, LUNS and Clustered Storage Servers.

</td>
<td width="168" style="width:100.65pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="281" style="width:168.7pt;padding:1.2pt;" valign="top" >
</td></tr></tbody></table>

#### Networking

<table style="width:467.4pt;background:white;" cellspacing="0" width="779" cellpadding="0" border="1" class="MsoNormalTable" > <tbody > <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >
</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Microsoft**   
Windows Server 2012 R2   
+ System Center 2012 R2 Datacenter Editions

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**VMware**   
vSphere 5.5 Enterprise Plus + vCenter Server 5.5

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >

**Notes**

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Distributed Switches across Hosts

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Supported by Logical Switches in System Center 2012 R2

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Extensible Virtual Switches

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** - Several partners offer extensions today, such as Cisco, NEC, Inmon and 5nine. Windows Server 2012 R2 offers new support for co-existence of Network Virtualization and Switch Extensions.

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Replaceable, not extensible** - VMware virtual switch is replaceable, not incrementally extensible with multiple 3rd party solutions concurrently

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

NIC Teaming

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Up to 32 NICs per NIC Team. Windows Server 2012 R2 provides new Dynamic Load Balancing mode using flowlets to provide efficient load balancing even between a small numbers of hosts.

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes** – Up to 32 NICs per Link Aggregation Group

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Private VLANs (PVLAN)

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

ARP Spoofing Protection

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**No** – Requires additional purchase of vCloud Network and Security (vCNS) or vCloud Suite.

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

DHCP Snooping Protection

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**No** – Requires additional purchase of vCloud Network and Security (vCNS) or vCloud Suite.

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Router Advertisement Guard Protection

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**No** – Requires additional purchase of vCloud Network and Security (vCNS) or vCloud Suite.

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Virtual Port ACLs

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** - Windows Server 2012 R2 adds support for Extended ACLs that include Protocol, Src/Dst Ports, State, Timeout & Isolation ID

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes** - via new Traffic Filtering and Marking policies in vSphere 5.5 distributed switches

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Trunk Mode to VMs

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Port Monitoring

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Port Mirroring

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Dynamic Virtual Machine Queue

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

IPsec Task Offload

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Single Root IO Virtualization (SR-IOV)

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes**** **– SR-IOV is supported by vSphere 5.5 Enterprise Plus, but _without_ support for vMotion, Highly Available VMs or VMware FT when using SR-IOV.

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Virtual Receive Side Scaling ( Virtual RSS )

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes** ( VMXNet3 )

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Network Quality of Service

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Network Virtualization

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – Provided via Hyper-V Network Virtualization based on NVGRE protocol and in-box Site-to-Site NVGRE Gateway.

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**No** – Requires additional purchase of VMware NSX

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Integrated Network Management of both Virtual and Physical Network components

</td>
<td width="154" style="width:92.1pt;padding:1.2pt;" valign="top" >

**Yes** – System Center 2012 R2 VMM supports integrated management of virtual networks, Top-of-Rack (ToR) switches and integrated IP Address Management

</td>
<td width="182" style="width:109pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="267" style="width:160.35pt;padding:1.2pt;" valign="top" >
</td></tr></tbody></table>

#### Guest Operating Systems

<table style="width:467.4pt;background:white;" cellspacing="0" width="779" cellpadding="0" border="1" class="MsoNormalTable" > <tbody > <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >
</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Microsoft**   
Windows Server 2012 R2   
+ System Center 2012 R2 Datacenter Editions

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**VMware**   
vSphere 5.5 Enterprise Plus + vCenter Server 5.5

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >

**Notes**

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows Server 2012 R2

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows 8.1

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows Server 2012

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows 8

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows Server 2008 R2 SP1

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows Server 2008 R2

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows 7 with SP1

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows 7

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows Server 2008 SP2

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows Home Server 2011

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows Small Business Server 2011

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows Vista with SP2

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows Server 2003 R2 SP2

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows Server 2003 SP2

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows XP with SP3

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Windows XP x64 with SP2

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

CentOS 5.7, 5.8, 6.0 – 6.4

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

CentOS Desktop 5.7, 5.8, 6.0 – 6.4

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Red Hat Enterprise Linux 5.7, 5.8, 6.0 – 6.4

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Red Hat Enterprise Linux Desktop 5.7, 5.8, 6.0 – 6.4

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

SUSE Linux Enterprise Server 11 SP2 & SP3

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

SUS Linux Enterprise Desktop 11 SP2 & SP3

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

OpenSUSE 12.1

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Ubuntu 12.04, 12.10, 13.10

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes ****– **Currently13.04 in the 13.x distros

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Ubuntu Desktop 12.04, 12.10, 13.10

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes ****– **Currently13.04 in the 13.x distros

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Oracle Linux 6.4

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**Yes** – Oracle has certified its supported products to run on Hyper-V and Windows Azure

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes** – However, per this Oracle article, Oracle has not certified any of its products to run on VMware. Oracle will only provide support for issues that are either known to occur on the native OS, or can be demonstrated not to be as a result of running on VMware.

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Mac OS X 10.7.x & 10.8.x

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes** - However, see note to the right. Based on current Apple EULA, this configuration may not be legally permitted in your environment.

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >

Note that according to the Apple EULA for Mac OS X, it is **not permitted** to install Mac OS X on any platform that is not Apple-branded hardware. If you choose to virtualize Mac OS X on non-Apple hardware platforms, it's my understanding that you're violating the terms of the Apple EULA.

</td></tr> <tr >
<td width="177" style="width:105.95pt;padding:1.2pt;" valign="top" >

Sun Solaris 10

</td>
<td width="153" style="width:91.9pt;padding:1.2pt;" valign="top" >

**No**

</td>
<td width="157" style="width:94.4pt;padding:1.2pt;" valign="top" >

**Yes** – However, per this Oracle article, Oracle has not certified any of its products to run on VMware. Oracle will only provide support for issues that are either known to occur on the native OS, or can be demonstrated not to be as a result of running on VMware.

</td>
<td width="292" style="width:175.15pt;padding:1.2pt;" valign="top" >
</td></tr></tbody></table>

If you’re looking for the full list of Guest Operating Systems supported by each platform, you can find the full details at the following locations:  
  * **Microsoft:** [Supported Server and Client Guest Operating Systems on Hyper-V](http://technet.microsoft.com/library/hh831531.aspx)  
  * **VMware:** [Compatibility Guide for Guest Operating Systems Supported on VMware vSphere](http://www.vmware.com/resources/compatibility)

#### Managing Heterogeneous Hypervisor Environments

In certain scenarios, you may find that a mix of virtualization platforms is needed to cost-effectively support all the features and Guest Operating Systems for which you’re looking, in which case you’ll be pleased to find that Microsoft System Center 2012 R2 also supports Private Cloud management across heterogeneous hypervisors, including Hyper-V, VMware vSphere and Citrix XenServer.

#### Summary

As you can see, both Microsoft Windows Server 2012 R2 / System Center 2012 R2 and VMware vSphere 5.5 offer lots of enterprise-grade virtualization features. Hopefully this comparison was useful to you in more granularly evaluating each platform for _your_ environment.  

**Note:** See [here](http://privatecloud.ulitzer.com/node/2811153) the full article

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
