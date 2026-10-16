---
title: "Creating a Site-to-Site VPN on Azure"
description: "To understand deeper what are the options you have to connect your datacenter/organization with Azure, I recommend read this older post. On this post I want to share what do…"
pubDate: 2017-06-07
category: networking
tags: [architecture, hybrid, powershell]
translationKey: creating-a-site-to-site-vpn-on-azure
legacy: true
legacyUrl: /2017/06/creating-a-site-to-site-vpn-on-azure.html
---

To understand deeper what are the options you have to connect your datacenter/organization with Azure, I recommend read this older [post](/posts/options-to-connect-your-datacenter-to-azure-virtual-networks-part-3-site-to-site-vpn). On this post I want to share what do you need to configure so you can implement a Site-to-Site (S2S) VPN between your datacenter and your Azure environment.

## **Configuring a site-to site connection**

The following procedure describes how to create an Azure virtual network and configure it with a site-to-site connection. It is based on the assumption that the on-premises network resides in the West United States and occupies the IP address space of 10.0.0.0/16. The virtual network in Azure will reside in the corresponding Azure region and occupy a non-overlapping address space of 192.168.0.0/16. The procedure relies on Microsoft Azure PowerShell and uses the Azure Resource Manager deployment model.

### **_Connect to your Azure subscription from Azure PowerShell_**

To connect to your Azure subscription from Azure PowerShell

1. Start Azure PowerShell and sign in to your subscription:
```powershell
Add-AzureRMAccount
```
2. If there are multiple subscriptions associated with your account, select the target subscription in which you are going to create the virtual network, and then configure a site-to-site VPN:
```powershell
Set-AzureRmContext –SubscriptionId <SUBSCRIPTION_ID>
```

### **_Create the resource group, virtual network, and its subnets_**

To create the resource group, virtual network, and its subnets:

1. Create a new resource group named **S2S-RG **in the Azure region that will host the virtual network:
```powershell
New-AzureRMResourceGroup –Name S2S-RG –Location westus
```
2. Create a new VNet named **VNetWUS01**, assign it an address space (in this example 10.10.0.0/16) that does not overlap with your on-premises address space, and then store a reference to the new virtual network in the **_$vnet_** variable:
```powershell
$vnet = New-AzureRMVirtualNetwork –ResourceGroupName S2S-RG –Name VNetWUS01 –AddressPrefix 10.0.0.0/12 –Location westus
```
3. Add a front-end subnet to the new virtual network:
```powershell
Add-AzureRmVirtualNetworkSubnetConfig -Name FrontEnd -VirtualNetwork $vnet -AddressPrefix 10.11.0.0/16
```
4. Add a gateway subnet to the new virtual network:
```powershell
Add-AzureRmVirtualNetworkSubnetConfig -Name GatewaySubnet -VirtualNetwork $vnet -AddressPrefix 10.15.255.224/27
```
  **Note:** The name of the VPN gateway subnet must be GatewaySubnet. The minimum size of the gateway subnet is /29; however, you should consider choosing /27 to ensure its support for ExpressRoute in case you decide to provision it at some point in the future. In general, you should also allocate its IP address space at the upper end of the address space of the virtual network, as the sample script above does.
5. Update the configuration of the virtual network:
```powershell
Set-AzureRMVirtualNetwork –VirtualNetwork $vnet
```

### **_Add the local (on-premises) network configuration_**

Specify the properties of the on-premises network, and then store them in the variable _$local_. You must provide the following values:

* **Name**. Provide a descriptive name for the local network.
* **GatewayIpAddress**. Specify the public IP address of your on-premises VPN device.
* **Address Prefix**. Specify the IP address range of your on-premises network.
```powershell
$local = New-AzureRmLocalNetworkGateway -Name LocalSite -ResourceGroupName S2S-RG -Location westus -GatewayIpAddress '128.8.8.8' -AddressPrefix '10.16.0.0/12'
```

## **_Configure a public IP address for the Azure VPN gateway_**

Configure a public IP address for the Azure VPN gateway:

1. Request a dynamically assigned IP address:
```powershell
$gwpip = New-AzureRmPublicIPAddress –Name S2SGTWPIP –ResourceGroupName S2S-RG –Location westus –AllocationMethod Dynamic
```
2. Set a variable representing the gateway subnet in **VNetWUS01**:
```powershell
$subnet= Get-AzureRmVirtualNetworkSubnetConfig –Name “GatewaySubnet” –virtualnetwork $vnet
```
3. Create the IP configuration required for the VPN gateway, and then store it in the _$ipconfig_ variable:
```powershell
$ipconfig= New-AzureRmVirtualNetworkGatewayIPConfig –Name GWIPConfig –Subnet $subnet –PublicIPAddress $gwpip
```

## **_Create the Azure VPN gateway_**

Create the Azure VNP gateway that will be used for the site-to-site VPN connection, and then store the value in the variable _$gateway_. Specify the following values:

* **GatewayType**: Define the gateway type to be VPN.
* **VpnType**: Choose between the route-based VPN type or the policy-based VPN type. Your choice must match the type of the on-premises VPN gateway. This example assumes the use of the route-based VPN type:
```powershell
$gateway = New-AzureRmVirtualNetworkGateway -Name AdatumGateway -ResourceGroupName S2S-RG -Location westus -IpConfigurations $ipconfig -GatewayType Vpn -VpnType RouteBased
```

## **_Configure the on-premises VPN device_**

The specifics of configuring an on-premises VPN gateway depend on its type and its vendor. For example, you can use either a computer running Windows server operating system with Routing and Remote Access Service (RRAS) or a non-Microsoft device. In any case, as part of the configuration, you will need to specify the public IP address of the Azure VPN gateway. You requested this public IP address and assigned it to the Azure VPN gateway in the previous steps. To identify it, run the following command:
```powershell
Get-AzureRmPublicIpAddress -Name S2SGTWPIP -ResourceGroupName S2S-RG
```
## **_Create a VPN connection_**

Create a VPN connection named **localtoazure** between the on-premises VPN gateway and the Azure VPN gateway. You need to provide the value of the shared key. This key is used to encrypt the VPN tunnel and must match the key that you specify during the on-premises VPN gateway configuration.
```powershell
New-AzureRmVirtualNetworkGatewayConnection -Name localtoazure -ResourceGroupName S2S-RG -Location westus -VirtualNetworkGateway1 $gateway -LocalNetworkGateway2 $local -ConnectionType IPsec -RoutingWeight 10 -SharedKey 'AzureIsAwesome2017!'
```

## **_Verify the VPN connection_**

Use the following command to verify the VPM connection.
```powershell
Get-AzureRmVirtualNetworkGatewayConnection -Name localtoazure -ResourceGroupName S2S-RG -Debug
```

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
