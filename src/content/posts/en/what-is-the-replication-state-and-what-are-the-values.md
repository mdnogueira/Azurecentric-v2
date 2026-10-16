---
title: "What is the ‘Replication State’ and what are the values?"
description: "The table below captures the states as seen in WMI, UI and PowerShell."
pubDate: 2012-06-20
category: hyper-v
tags: [hyper-v-replica]
translationKey: what-is-the-replication-state-and-what-are-the-values
legacy: true
legacyUrl: /2012/06/what-is-the-replication-state-and-what-are-the-values.html
---

**Replication state** shows the **current** state of the replicating VM. It indicates whether the VM is being replicated, whether initial replication is pending etc.

**ReplicationState** can be queried from:
  * UI – As seen in the above picture
  * PowerShell – Using the **Measure-VMReplication **cmdlet.
  * WMI – From [**Msvm_ComputerSystem**](http://msdn.microsoft.com/en-us/library/hh850116(v=vs.85))class where ReplicationState is a property

The table below captures the states as seen in WMI, UI and PowerShell.
<table cellpadding="0" width="710" cellspacing="0" border="1" >
<tbody >
<tr >

<td width="45" valign="top" >

**WMI**

</td>

<td width="173" valign="top" >

**UI**

</td>

<td width="175" valign="top" >

**PowerShell**

</td>

<td width="315" valign="top" >

**Notes**

</td>
</tr>
<tr >

<td width="46" valign="top" >

0

</td>

<td width="172" valign="top" >

Not enabled

</td>

<td width="177" valign="top" >

NA

</td>

<td width="313" valign="top" >VM is **not**   enabled for replication.
</td>
</tr>
<tr >

<td width="47" valign="top" >

1

</td>

<td width="171" valign="top" >

Pending Initial   Replication

</td>

<td width="179" valign="top" >

ReadyForInitialReplication

</td>

<td width="311" valign="top" >Replication relationship has been created but **Initial Replication**   has not been initiated. This is seen on the primary VM only.
</td>
</tr>
<tr >

<td width="48" valign="top" >

2

</td>

<td width="171" valign="top" >

Pending Initial   Replication

</td>

<td width="181" valign="top" >

WaitingForInitialReplication

</td>

<td width="309" valign="top" >The replica VM enters this state when a replication   relationship has been created but **Initial   Replication **has not been initiated (or) **Initial Replication**   is in progress.

The primary VM enters this state when **Initial Replication**   is in progress.
</td>
</tr>
<tr >

<td width="49" valign="top" >

3

</td>

<td width="170" valign="top" >

Replication Enabled

</td>

<td width="182" valign="top" >

Replicating

</td>

<td width="308" valign="top" >This state (on  both the primary and replica VM)   indicates that the replication is ‘**Normal**’.
</td>
</tr>
<tr >

<td width="50" valign="top" >

4

</td>

<td width="170" valign="top" >

Prepared for planned   failover

</td>

<td width="183" valign="top" >

SyncedReplicationComplete

</td>

<td width="307" valign="top" >This state is applicable only for the primary VM. It indicates   that **Planned   Failover** is complete and that the VM is locked from powering   up.
</td>
</tr>
<tr >

<td width="51" valign="top" >

5

</td>

<td width="169" valign="top" >

Failover Complete

</td>

<td width="184" valign="top" >

FailOverWaitingCompletion

</td>

<td width="306" valign="top" >**Failover** has been initiated on the   replica VM but has not been completed. The Failover operation is considered   to be complete only when the VM is either reverse replicated (or) when   additional recovery points are removed.
</td>
</tr>
<tr >

<td width="51" valign="top" >

6

</td>

<td width="169" valign="top" >

Failover Complete

</td>

<td width="185" valign="top" >

FailedOver

</td>

<td width="305" valign="top" >The replica VM enters this state once the **Failover**   operation has been completed.
</td>
</tr>
<tr >

<td width="51" valign="top" >

7

</td>

<td width="169" valign="top" >

Replication Paused

</td>

<td width="186" valign="top" >

Suspended

</td>

<td width="304" valign="top" >The VM enters this state when replication is **Paused**. This   state is applicable on both the primary and replica VM
</td>
</tr>
<tr >

<td width="51" valign="top" >

8

</td>

<td width="169" valign="top" >

Replication Error

</td>

<td width="187" valign="top" >

Error

</td>

<td width="304" valign="top" >This state is applicable on both the primary and replica VM   and indicates that replication is not occurring on either VM. Usually   administrator intervention is required to restore replication.
</td>
</tr>
<tr >

<td width="51" valign="top" >

9

</td>

<td width="169" valign="top" >

Resynchronization required

</td>

<td width="188" valign="top" >WaitingForStartResynchronize
</td>

<td width="303" valign="top" >The primary VM enters this state when it needs to be   resynchronized.
</td>
</tr>
<tr >

<td width="51" valign="top" >

10

</td>

<td width="168" valign="top" >

Resynchronizing

</td>

<td width="188" valign="top" >

Resynchronizing

</td>

<td width="303" valign="top" >Resynchronization has been initiated on the primary VM.
</td>
</tr>
<tr >

<td width="51" valign="top" >

11

</td>

<td width="168" valign="top" >

Resynchronize Suspended

</td>

<td width="188" valign="top" >

ResynchronizeSuspended

</td>

<td width="303" valign="top" >If the primary VM suspends the resynchronization
</td>
</tr>
</tbody>
</table>

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
