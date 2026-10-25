---
title: "Considerations on using Load Balancing with Azure VMs"
description: "During this week, I had to design a solution using Azure Load Balance to build, to host a significant amount of content that requires a lot of bandwidth. From what I could…"
pubDate: 2019-02-01
category: networking
tags: ["azure-load-balancer", "azure-virtual-machines"]
translationKey: considerations-on-using-load-balancing-with-azure-vms
legacy: true
legacyUrl: /2019/02/considerations-on-using-load-balancing-with-azure-vms.html
---

During this week, I had to design a solution using Azure Load Balance to build, to host a significant amount of content that requires a lot of bandwidth. From what I could find, the size and the series of the VMs in Azure impacts on the output of the bandwidth, and directly impacts on the performance of the solution.

So, after careful calculation we decide to go with the F-Series. But that does stop that. After a few tests we verified that the performance that we wanted to achieve was not what we expected. So, I started to poke around, and this is what I found out.

If your solution is primarily based on egress traffic, egress traffic is limited in Azure, therefore you want to consider the egress rate limits on the choice of your VMs. Here are the considerations:

  1. Depending of the VM SKU, you have different egress rate limits
  2. Azure Load Balancers does not have egress rate limits
  3. Egress does not traverse the load balancers platform

Here is the explanation that might impact on your final solution.

While the customers addressing has to appear to go through the frontend address in both directions, the data path underneath is always asymmetric. And in fact, even further optimized in some scenarios. 

The inbound (from Internet) packet goes through a scale unit of the multitenant infrastructure that makes up a big part of the Load Balance service. The return packet goes direct to the client. 

Not being a proxy and having a horizontally and vertically distributed and scaled service in turn provides massive scale. Traffic is not forced through a single choke point.

So, in a scenario when the reply is larger than the request, the reply ("download") part of your connection is limited by egress rate limit of VM (and per frontend ingress is limited by the capacity of the multitenant platform scale unit, and by a node on the scale unit and DDoS mitigation for per flow.)

In this case, by increasing the amount the number of VMs in my solution, I could achieve the download rate goal that I was looking for. I really hope this help build your solution using Azure Load Balancers.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
