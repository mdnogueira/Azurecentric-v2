---
title: "Creating an ExpressRoute VPN on Azure"
description: "To understand deeper what are the options you have to connect your datacenter/organization with Azure, I recommend read this older post. On this post I want to share what do…"
pubDate: 2017-06-09
category: networking
tags: ["expressroute", "vpn"]
translationKey: creating-an-expressroute-vpn-on-azure
legacy: true
legacyUrl: /2017/06/creating-an-expressroute-vpn-on-azure.html
---

To understand deeper what are the options you have to connect your datacenter/organization with Azure, I recommend read this older [post](/posts/options-to-connect-your-datacenter-to-azure-virtual-networks-part-4-expressroute). On this post I want to share what do you need to configure so you can implement an ExpressRoute VPN between your datacenter and your Azure environment.

Implementing ExpressRoute connectivity is a multi-step process that involves interaction with the connectivity or exchange provider to establish physical connectivity. The process relies on the coordinated effort between the provider and Microsoft to provision the virtual circuit. On a high level, it consists of the following sequence of tasks:
 	
1. **Satisfy prerequisites.** This includes designating an Azure subscription in which the ExpressRoute connection will be defined, selecting a provider available at your location, and establishing physical connectivity with the provider. 	
2. **Initiate creation of an ExpressRoute circuit.** At the present time, you can use either Azure PowerShell or the Azure portal to accomplish this task. As part of the circuit creation, you will need to specify several circuit properties, including:
  1. **Provider.** The connectivity or exchange provider that you selected.
  2. **Peering location**. The location hosting the physical connection.
  3. **Tier.** Either the Standard or Premium, where the latter represents the Premium add-on option.
  4. **Data metering.** Either Unlimited or Metered determining the billing model.
  5. This task automatically generates a service key that uniquely identifies the circuit. You need to relay its value to the provider, which will complete the provisioning process.
3. **Configure routing.** In general, connectivity providers that deliver Layer 3 services will manage this part of the process for you. When using Layer 2 connectivity providers, satisfying routing prerequisites and configuring routing are your responsibilities, as described on the one of the previous post (see [here](/posts/options-to-connect-your-datacenter-to-azure-virtual-networks-part-4-expressroute)).
4. **Link virtual networks to ExpressRoute circuits.** This is necessary in private peering scenarios. Virtual networks do not have to reside in the same subscription as the ExpressRoute circuit.
  **Note:** Following the proper sequence and timing between the first and the second step are important because billing of an ExpressRoute circuit starts the moment that Microsoft issues the corresponding service key.

When creating an ExpressRoute circuit, you can determine the progress of its provisioning by monitoring its two properties:	
* **Service provider provisioning state.** This represents progress on the connectivity provider’s side and can take one of the following values:
  * **NotProvisioned**
  * **Provisioning**
  * **Provisioned** 	
* This represents progress on the Microsoft side, and includes:
  * **Enabling**
  * **Enabled**
  * **Disabling**

The circuit must be in the **Provisioned** service provider provisioning state and have the **Enabled** status in order to be operational. You can identify the values of both properties by using Azure PowerShell (**_Get-AzureRmExpressRouteCircuit_**) or the Azure portal.

If you encounter routing issues, you should also check a couple of additional BGP related parameters:
* **BGP provisioning state.** This indicates whether BGP-based peering is in effect on the Microsoft edge.
* **Advertised public prefixes state.** Use this to detect mismatches between advertised prefixes and ASNs.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
