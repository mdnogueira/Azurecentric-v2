---
title: "Dynamic Optimization on SCVMM 2012"
description: "SCVMM 2012 introduced the ability to constantly monitor and rebalance load on clusters by using “Dynamic Optimization”. How Dynamic Optimization works, will help understand its…"
pubDate: 2013-02-12
category: windows-server
tags: ["windows-server", "scvmm", "dynamic-optimization"]
translationKey: dynamic-optimization-on-scvmm-2012
legacy: true
legacyUrl: /2013/02/dynamic-optimization-on-scvmm-2012.html
---

SCVMM 2012 introduced the ability to constantly monitor and rebalance load on clusters by using “Dynamic Optimization”.  How Dynamic Optimization works, will help understand its behavior and get the most out of this feature.

What does Dynamic Optimization do?  Simply put, it searches for live migrations within a Host Cluster that will improve the overall health of the cluster. “Health” describes two main facets - Host load and VM configuration.

## **Dynamic Optimization versus PRO-tips**

Users of VMM 2008 know both the benefits and the challenges of using PRO-tips to respond to load issues in their environment. Dynamic Optimization capitalizes on the brand new Intelligent Placement engine to more effectively and proactively handle changing load in your host clusters. PRO used an Operations Manager agent to monitor the host for critical thresholds being crossed, and then initiated migrations away from that host. Dynamic Optimization improves a few aspects of the process.
  * Dynamic Optimization monitors and acts natively in the VMM service, without the need for Operations Manager integration.
  * Dynamic Optimization runs on the VMM server, not on each host, so decisions are centralized and plans are formulated that are best for the      cluster as a whole, rather than potentially conflicting actions from each host.
  * Dynamic Optimization is aware of all the rules and requirements of each VM, without the need for different management packs to monitor many      aspects of VM health. Networking requirements, custom placement rules, host reserves - Dynamic Optimization can respond centrally to issues with      all of these considerations.

For many health monitoring requirements Operations Manager is still the right choice and custom management packs allow deep monitoring of a wide range of specific hardware or configurations. In the case of VMM’s load management however, Dynamic Optimization is almost always the right tool for the job.

## **Dynamic Optimization’s logic**

The dynamic optimizer is guided by a simple set of rules, given here in priority order.

## **Dynamic Optimization priority #1: Never introduce a new problem into the system**

Any action that Dynamic Optimization takes is first checked to ensure that it doesn’t trigger any placement warnings or errors.  Warnings or errors will block Dynamic Optimization from considering that action, no matter how much it might rebalance the environment.  Also, certain VMs are marked as “Exclude from Dynamic Optimization”. These VMs will never be moved by Dynamic Optimization.

## **Dynamic Optimization priority #2: Resolve VM configuration issues (warnings or errors)**

As Dynamic Optimization assesses the VMs being hosted in a cluster, the most important issue that will cause it to take action are rules being violated that are causing warnings or errors to placement. Has the VM been configured to require Network Optimization (VMQ) but the current host doesn’t have that available? Is the VM on a host that doesn’t have access to the correct logical networks that the VM needs?

## **Dynamic Optimization priority #3: Resolve violated host load thresholds**

When you configure Dynamic Optimization at a HostGroup level, you will be asked to specify what your target maximums are for host load. When Dynamic Optimization detects that one of these thresholds has been crossed, it will make it a priority to attempt to migrate VMs in such a way as to reduce the load on the affected host.

## **Dynamic Optimization priority #4: Balance load across hosts**

_(Only applicable at aggressiveness settings High, Medium-High and Medium)_
Once no issues from the first 3 priority levels can be found or corrected, Dynamic Optimization starts to search all possible migrations within the cluster to evaluate their net effect on the star ratings of the VM being migrated.  If the net increase in star rating meets the requirements of the HostGroup’s aggressiveness setting, the migration will be planned by Dynamic Optimization.  The star ratings necessary to trigger migrations are:
<table cellpadding="0" width="400" cellspacing="0" border="1" >
<tbody >
<tr >

<td width="220" valign="top" >

**Dynamic Optimization Aggressiveness**

</td>

<td width="178" valign="top" >

**Star rating increase required**

</td>
</tr>
<tr >

<td width="220" valign="top" >High
</td>

<td width="178" valign="top" >0.1 stars
</td>
</tr>
<tr >

<td width="220" valign="top" >Medium-High
</td>

<td width="178" valign="top" >0.2 stars
</td>
</tr>
<tr >

<td width="220" valign="top" >Medium
</td>

<td width="178" valign="top" >0.3 stars
</td>
</tr>
</tbody>
</table>

Remember, these migrations will only be approved by Dynamic Optimization if they can occur without triggering any warnings or errors on the destination host.

## **Dynamic Optimization Modes - Manual vs Automatic**

By default, Dynamic Optimization ships in manual mode. That means that it will take no automatic actions, but is available for you to trigger on-demand. You can run a manual Dynamic Optimization by right-clicking your cluster and choosing “Optimize Hosts” or choosing that option from the ribbon when a Host Cluster has focus.

Running Dynamic Optimization in manual mode will first do a calculation-only run, showing the proposed migrations and confirming before actually making any changes to the environment.

In the host group properties, you can elect to put Dynamic Optimization into automatic mode, and choose a calculation interval. (Default 10 minutes)  This will cause all the clusters in that host group to automatically calculate and execute a Dynamic Optimization plan periodically, without it being necessary for you to intervene.  Automatic Dynamic Optimization runs are not added to the task trail unless they result in migrations.

## **Dynamic Optimization Performance Data**

Dynamic Optimization uses the same data that drives all placement, with two minor variations.
Firstly, for most placement functions (New VM, migrate VM, new service etc), performance data is aggregated and averaged over a long period of time to get a profile of the typical usage expected from a VM under normal conditions.

Dynamic Optimization needs to take actions based only on the most recent information, so it only looks at the most recent performance information gathered from VMs and hosts.  These performance samples are, by default, captured every 9 minutes, and the data used is a rolling average of the VM performance over that sample period.

Secondly, since Dynamic Optimization never does storage migrations, disk performance data is irrelevant and ignored when a host’s load is calculated. In VMM 2012, only CPU and Memory are considered to make up the host load metric used by Dynamic Optimization. Remember, however, that absolutely any piece of placement information will be used to evaluate if a VM is correctly configured or operating over the reserves or levels that you define.

## **Investigating Dynamic Optimization issues**

We have had some tremendously positive feedback on Dynamic Optimization. Customers who contact us usually have only one major question. “How can I investigate whether Dynamic Optimization should be taking action on my cluster?”

Your first and most important diagnostic tool is VM migration ratings. All VMM 2012 functions are powered by the same Intelligent Placement engine, and Dynamic Optimization is no exception. The ratings and warnings that you see when considering a migration are based on the identical data and logic that drives Dynamic Optimization.  If you are expecting a VM to migrate from one host to another, just initiate that migration through the UI and take a look at the host ratings dialog. (You don’t need to actually do the migration, just get as far as ratings and then cancel.)

The primary issue that might be blocking Dynamic Optimization’s operation is the presence of warnings or errors in the migration rating. Dynamic Optimization will almost never make a migration that results in warnings or errors. The most common cause of Dynamic Optimization queries are clusters where some cluster-wide warning such as VMQ, cluster overcommit or agent health are causing a warning against every host. Resolving these warnings will allow Dynamic Optimization to run normally.

The next thing to consider is the level of overall imbalance and the aggressiveness setting. Dynamic Optimization will not migrate unless these is a considerable difference in _host_ health. Having 10 small idle VMs on a large host will not be enough to necessarily start migrations to an empty host. The host has to be full enough that its star ratings start to decline perceptibly from those of another host.  Increasing aggressiveness to high will cause migrations to start sooner, as will applying CPU load to the VMs.
Lastly, check that VMs that you expect to migrate are not marked as “Exclude from Dynamic Optimization”.  VMs can opt out of Dynamic Optimization management, and if the only viable migrations are to VMs which are not available for Dynamic Optimization, no actions will occur.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
