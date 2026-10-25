---
title: "Troubleshooting Hyper-V Replica"
description: "This section explains how to troubleshoot Hyper-V Replica. Use this guide when: You have problems with connectivity between Primary and Replica servers You have problems…"
pubDate: 2013-04-01
category: hyper-v
tags: ["hyper-v-replica", "troubleshooting", "hyper-v"]
translationKey: troubleshooting-hyper-v-replica
legacy: true
legacyUrl: /2013/04/troubleshooting-hyper-v-replica.html
---

## Introduction to Troubleshooting Hyper-V Replica

This section explains how to troubleshoot Hyper-V Replica.  Use this guide when:
  * You have problems with connectivity between Primary and Replica servers
  * You have problems enabling a virtual machine for replication
  * You have problems with virtual machine replication whether it is Initial Replication (IR) or Delta Replication (DR)
  * You have problems executing management actions associated with virtual machines on a Primary or Replica server
  * You have problems with the Replication Broker configured in a Hyper-V Failover Cluster.
  * You need to collect Performance monitoring data for replicated virtual machines.

### Tools for Troubleshooting Hyper-V Replica

#### Utilities and Commands for Troubleshooting Hyper-V Replica

##### Performance Monitor

Performance Monitor contains Hyper-V counters specific to Hyper-V Replica.  These counters monitor replication statistics for configured virtual machines.  The specific counter is **Hyper-V Failover Replication Counter VM**.  The data that can be collected for each selected virtual machine includes:
  * Average Replication Latency
  * Average Replication Size
  * Last Replication Size
  * Network Bytes Received
  * Network Bytes Sent
  * Replication Count
  * Replication Latency
  * Resynchronized Bytes

##### Hyper-V Replica Integration into the Hyper-V Best Practice Analyzer (BPA)

Rules pertaining to Hyper-V Replica are included in the Hyper-V Best Practice Analyzer. The following BPA Rule details are provided to assist with troubleshooting:
<table cellpadding="0" cellspacing="0" border="1" >
<tbody >
<tr >
<td width="171" valign="top" >

##### Summary

</td>
<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >
<td width="171" valign="top" >

**Rule Title**

</td>
<td width="628" valign="top" >A Replica server must be configured to accept replication requests
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Red
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >This computer is designated as a Hyper-V Replica server but is not configured to accept incoming replication data from primary servers.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>
<td width="628" valign="top" >This server cannot accept replication traffic from primary servers.
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Resolution**

</td>
<td width="628" valign="top" >Use Hyper-V Manager to specify which primary servers this Replica server should accept replication data from.
</td>
</tr>
<tr >
<td width="171" valign="top" >

##### Summary

</td>
<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >
<td width="171" valign="top" >

**Rule Title**

</td>
<td width="628" valign="top" >Replica servers should be configured to identify specific primary servers authorized to send replication traffic
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Severity**

</td>
<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Category**

</td>
<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Issue**

</td>
<td width="628" valign="top" >As configured, this Replica server accepts replication traffic from all primary servers and stores them in a single location.
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Impact**

</td>
<td width="628" valign="top" >All replication from all primary servers is stored in one location, which might introduce privacy or security problems.
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Resolution**

</td>
<td width="628" valign="top" >Use Hyper-V Manager to create new authorization entries for the specific primary servers and specify separate storage locations for each of them. You can use wildcard characters to group primary servers into sets for each authorization entry.
</td>
</tr>
<tr >
<td width="171" valign="top" >

##### Summary

</td>
<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >
<td width="171" valign="top" >

**Rule Title**

</td>
<td width="628" valign="top" >Compression is recommended for replication traffic
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Severity**

</td>
<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >
<td width="171" valign="top" >**Category**
</td>
<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Issue**

</td>
<td width="628" valign="top" >The replication traffic sent across the network from the primary server to the Replica server is uncompressed.
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Impact**

</td>
<td width="628" valign="top" >Replication traffic will use more bandwidth than necessary. This impacts the following virtual machines:<List of VMs>
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Resolution**

</td>
<td width="628" valign="top" >Configure Hyper-V Replica to compress the data transmitted over the network in the settings for the virtual machine in Hyper-V Manager. You can also use tools outside of Hyper-V to perform compression.
</td>
</tr>
<tr >
<td width="171" valign="top" >

##### Summary

</td>
<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >
<td width="171" valign="top" >**Rule Title**
</td>
<td width="628" valign="top" >Configure guest operating systems for VSS-based backups to enable application-consistent snapshots for Hyper-V Replica
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Severity**

</td>
<td width="628" valign="top" >Red
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Category**

</td>
<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >
<td width="171" valign="top" >

**Issue**

</td>
<td width="628" valign="top" >Application-consistent snapshots require that Volume Shadow Copy Services (VSS) is enabled and configured in the guest operating systems of virtual machines participating in replication.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >Even if application-consistent snapshots are specified in the replication configuration, Hyper-V will not use them unless VSS is configured. This impacts the following virtual machines:<List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Use Hyper-V Manager to install integration services in the virtual machine.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >Integration services must be installed before primary or Replica virtual machines can use an alternate IP address after a failover
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Red
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >Virtual machines participating in replication can be configured to use a specific IP address in the event of failover, but only if integration services are installed in the guest operating system of the virtual machine.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >In the event of a failover (planned, unplanned, or test), the Replica virtual machine will come online using the same IP address as the primary virtual machine. This configuration might cause connectivity issues. This impacts the following virtual machines:<List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Use Hyper-V Manager to install integration services in the virtual machine.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >To participate in replication, servers in failover clusters must have a Hyper-V Replica Broker configured
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Red
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >For failover clusters, Hyper-V Replica requires the use of a Hyper-V Replica Broker name instead of an individual server name.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >If the virtual machine is moved to a different failover cluster node, replication cannot continue.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Use Failover Cluster Manager to configure the Hyper-V Replica Broker. In Hyper-V Manager, ensure that the replication configuration uses the Hyper-V Replica Broker name as the server name.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >Virtual hard disks with paging files should be excluded from replication
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >Paging files should be excluded from participating in replication, but no disks have been excluded.
</td>
</tr>
<tr >

<td width="171" valign="top" >

** Impact**

</td>

<td width="628" valign="top" >Virtual hard disks that experience a high volume of input/output activity will unnecessarily require much greater resources to participate in replication. This impacts the following virtual machines:\n{0}
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >If you have not already done so, create a separate virtual hard disk for the Windows paging file. If initial replication has already been completed, use Hyper-V Manager to remove replication. Then, configure replication again and exclude the virtual hard disk with the paging file from replication.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >Configure the Failover TCP/IP settings that you want the Replica virtual machine to use in the event of a failover
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >Replica virtual machines configured with a static IP address should be configured to use a different IP address from their primary virtual machine counterpart in the event of failover.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >Clients using the workload supported by the primary virtual machine might not be able to connect to the Replica virtual machine after a failover. Also, the primary virtual machine's original IP address will not be valid in the Replica virtual machine network topology.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Use Hyper-V Manager to configure the IP address that the Replica virtual machine should use in the event of failover. This impacts the following virtual machine(s): <List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >Authorization entries should have distinct tags for primary servers with virtual machines that are not part of the same security group.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >The server will accept replication requests for the replica virtual machine from any of the servers in the authorization list associated with the same replication tag as of the VM.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >There might be privacy and security concerns with a virtual machine accepting replication from primary servers belonging to different authorization entries. This impacts the following authorization entries:<List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Use different tags in the authorization entries for primary servers with virtual machines that are not part of the same security group. Modify the Hyper-V settings to configure the replication tags.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >Certificate-based authentication is configured, but the specified certificate is not installed on the Replica server or failover cluster nodes
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Red
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >The security certificate that Hyper-V Replica has been configured to use to provide certificate-based replication is not installed on the Replica server (or any failover cluster nodes).
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >In the event of a cluster failover or move to another node, Hyper-V replication will pause if the new node does not also have the appropriate certificate installed. This impacts the following nodes: <List of nodes>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Install the configured certificate on the Replica server (and all associated nodes in the failover cluster, if any).
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >Replication is paused for one or more virtual machines on this server
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Operation
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >Replication is paused for one or more of the virtual machines. While the primary virtual machine is paused, any changes that occur will be accumulated and will be sent to the Replica virtual machine once replication is resumed.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >As long as replication is paused, accumulated changes occurring in the primary virtual machine will consume available disk space on the primary server. After replication is resumed, there might be a large burst of network traffic to the Replica server. This impacts the following virtual machines: <List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Confirm that pausing replication was intended. If replication was paused to address low disk space or network connectivity, resume replication as soon as those issues are resolved.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >Initial replication is complete, but no test failover has been attempted
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Red
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Operation
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >No test failovers have been attempted since completing initial replication.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >A test failover confirms that failover will succeed and that all workload operations on the primary virtual machine continue properly after failover to the Replica virtual machine. This impacts the following virtual machines: <List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Use Hyper-V Manager to conduct a test failover.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >There has been no test failover in at least one month
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Operation
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >Test failovers should be carried out at least monthly to verify that failover will succeed and that virtual machine workloads will operate as expected after failover.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >A test failover confirms that failover will succeed and that all workload operations on the primary virtual machine continue properly after failover to the Replica virtual machine. This impacts the following virtual machines: <List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Use Hyper-V Manager to conduct a test failover.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >Certificate-based authentication is recommended for replication.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >One or more virtual machines selected for replication are configured for Kerberos authentication.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >The replication network traffic from the primary server to the replication server is unencrypted. This impacts the following virtual machines:<List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >If another method is being used to perform encryption, you can ignore this. Otherwise, modify the virtual machine settings to choose certificate-based authentication.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >Configure a policy to throttle the replication traffic on the network
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >There might not be a limit on the amount of network bandwidth that replication is allowed to consume.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >Network bandwidth could become completely dominated by replication traffic, affecting other critical network activity. This impacts the following ports: <List of Ports>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >If you use another method to throttle network traffic, you can ignore this. Otherwise, use Group Policy Editor to configure a policy that will throttle the network traffic to the relevant port of the Replica server.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >**Rule Title**
</td>

<td width="628" valign="top" >Resynchronization of replication should be scheduled for off-peak hours.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >Resynchronization of replication for the primary VMs is not scheduled for off-peak hours.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >Replication logs and Replication Point Objective will increase when the VM is in a resynchronize-required state for a longer time. At the same time, resynchronization will affect the IOPS bandwidth on the primary and the replica server, hence might affect production workloads.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Use Hyper-V Manager VM Replication settings to configure the auto-resynchronize replication window of the primary VM within the off-peak hours.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >VHDX-based virtual hard disks are recommended for virtual machines that have recovery history enabled in replication settings.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >VHD-based virtual hard disks are being used for the virtual machines that are enabled for replication with recovery history turned on.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >Under some circumstances, the VHDs on the replica server could experience consistency issues. This impacts the following virtual machine(s): <List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Use the new virtual hard disk format (VHDX) for the virtual machines that are enabled for replication with recovery history turned on. You can convert a virtual hard disk from VHD format to VHDX format. The VHDX format has reliability mechanisms that help protect the disk from corruptions due to system power failures. However, do not convert the virtual hard disk if it is likely to be attached to an earlier release of Windows at some point. Windows releases earlier than {1} do not support the VHDX format.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >Recovery snapshots should be removed after failover.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Operation
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Issue**

</td>

<td width="628" valign="top" >A failed over virtual machine has one or more recovery snapshots.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >Available space may run out on the physical disk that stores the snapshot files. If this occurs, no additional disk operations can be performed on the physical storage. Any virtual machine that relies on the physical storage could be affected. This impacts the following virtual machines: <List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >For each failed over virtual machine, use the Complete-VMFailover cmdlet in Windows PowerShell to remove the recovery snapshots and indicate Failover completion.
</td>
</tr>
<tr >

<td width="171" valign="top" >

##### Summary****

</td>

<td width="628" valign="top" >

##### Detail

</td>
</tr>
<tr >

<td width="171" valign="top" >

**Rule Title**

</td>

<td width="628" valign="top" >A large number of recovery points has been configured
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Severity**

</td>

<td width="628" valign="top" >Yellow
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Category**

</td>

<td width="628" valign="top" >Configuration
</td>
</tr>
<tr >

<td width="171" valign="top" >

*Issue**

</td>

<td width="628" valign="top" >Hyper-V Replica has been configured to store more than nine previous recovery points.
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Impact**

</td>

<td width="628" valign="top" >Maintaining too many recovery points could cause the Replica server to run out of available disk space. This impacts the following virtual machines: <List of VMs>
</td>
</tr>
<tr >

<td width="171" valign="top" >

**Resolution**

</td>

<td width="628" valign="top" >Review the number of recovery points configured, taking into account factors such as the number of virtual machines on the server and the oldest recovery point that is really required.
</td>
</tr>
</tbody>
</table>

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
