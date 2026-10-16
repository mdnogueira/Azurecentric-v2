---
title: "Changing the Azure Gateway subnet with Express Route"
description: "One of the things that I like to do when I start a new Azure Architecture, is what I called an Azure Foundation workshop, where I can validate all the infrastructure…"
pubDate: 2018-05-10
category: networking
tags: [expressroute, vnet]
translationKey: changing-the-azure-gateway-subnet-with-express-route
legacy: true
legacyUrl: /2018/05/changing-the-azure-gateway-subnet-with-express-route.html
---

One of the things that I like to do when I start a new Azure Architecture, is what I called an Azure Foundation workshop, where I can validate all the infrastructure configuration, so we can design accordingly. But not always happens on that way.

So, this is the scenario: Costumer has an Express Route setup between their datacenter and Azure. The Express Route terminates on the Core VNet. But the VNet needs to be extended and therefore the subnets (including the Gateway subnet) needs to change.

The rule is, if you need to change the VNet and/or Subnet address that is been used, you CAN’T! So, you need to delete (what you want to change (in this case the Gateway subnet)) and recreate it. So far so good, but in this scenario, we already have an Express Route connection stablish and working to the Gateway Virtual Network.

This is the steps that you should do to accomplish the change:

1. Disconnect the Gateway from Express Route circuit
2. Delete the Gateway
3. Update (or recreate) the Gateway subnet
4. Recreate the Gateway
5. Create new connection between Gateway and Express Route circuit

These steps need to happen on both sides, on Azure and on the Datacenter.

I hope this gives you a guidance, if you face this situation.

Cheers,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
