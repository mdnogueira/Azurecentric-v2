---
title: "What Accelerated Networking can do on Azure VMs"
description: "Microsoft have been making a lot of enhancements on Azure VMs, specially on the performance. One of those is Accelerated Network adapters that is available on some of the Azure…"
pubDate: 2018-05-04
category: networking
tags: []
translationKey: what-accelerated-networking-can-do-on-azure-vms
legacy: true
legacyUrl: /2018/05/what-accelerated-networking-can-do-on-azure-vms.html
---

Microsoft have been making a lot of enhancements on Azure VMs, specially on the performance. One of those is Accelerated Network adapters that is available on
some of the Azure VM Series. Although they have made huge improvements in throughput that benefited VMs both with Accelerated Networking and those without. 

However, there are some things that only Accelerated Networking can do because it makes use of hardware to improve networking performance. The benefits of hardware acceleration include:

1. Latency is significantly improved for VMs deployed near each other (as in the same Availability Set).
2. Jitter is improved (latency is more consistent even with varying conditions and workloads)
3. Offloading some of the connection processing from the host and VMs. 
  * This enables some of Azure largest VMs to achieve throughput levels not possible without Accelerate Network. The effect is amplified with real workloads where other processing is taking place at the same time. 
  * CPU time is returned to the guests for their workloads. Monitoring CPU utilization, especially on the receiver, can also reveal the difference.

Latency and jitter are the two aspects of performance that are greatly improved with this feature. Since host policies are offloaded to the Hardware, packets no
longer suffer when CPUs are running hot or from any noisy neighbor issues. And like with any Hardware offload, the host CPU utilization is reduced. It’s not expected that you would see this directly in the guest, but it indirectly impacts performance as it frees CPUs for VM processing. 

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
