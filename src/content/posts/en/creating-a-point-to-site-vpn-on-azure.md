---
title: "Creating a Point-to-Site VPN on Azure"
description: "To understand deeper what are the options you have to connect your organization with Azure, I recommend read this older post. On this post, I want to share what do you need to…"
pubDate: 2017-06-05
category: networking
tags: [architecture, hybrid, powershell]
translationKey: creating-a-point-to-site-vpn-on-azure
legacy: true
legacyUrl: /2017/06/creating-a-point-to-site-vpn-on-azure.html
---

To understand deeper what are the options you have to connect your organization with Azure, I recommend read this older [post](/posts/options-to-connect-your-datacenter-to-azure-virtual-networks-part-1). On this post, I want to share what do you need to configure so you can implement a Point-to-Site (P2S) VPN between your organization individual PC and your Azure environment.

This is the typical process for creating and configuring a virtual network with point-to-site connectivity:

1. Create the root and client certificates. Certificates facilitate authentication of the VPN tunnel. To create a root self-signed certificate, you can use the **makecert.exe** command-line tool to run the following command:
```js
makecert -sky exchange -r -n "CN=RootCertificateName" -pe -a sha1 -len 2048 -ss My "RootCertificateName.cer"
```
2. Next, you need to generate client certificates. If you created a self-signed root certificate, you could use the same **makecert.exe** command-line tool with the following parameters:
```js
makecert.exe -n "CN=ClientCertificateName" -pe -sky exchange -m 96 -ss My -in "RootCertificateName" -is my -a sha1
```
  **Note:** This command creates a client certificate and stores it in your user account’s personal certificate store on the local computer. You can create as many client certificates as needed by using this same command with different values of the –n parameter. I recommend that you create unique client certificates for each VPN client. This allows you to revoke these certificates on a per user basis. After you create the client certificates, export them in the Personal Exchange File (.pfx) format and import them into the Personal certificate store on the user’s computers for each user that will be using the point-to-site VPN.
3. Create a dynamic routing gateway. A gateway is a mandatory component for a point-to-site VPN connection. You will need to create a corresponding subnet named GatewaySubnet hosting the gateway as well as define a VPN client IP address pool. You will also need to request a dynamically allocated public IP address. Provisioning a new point-to-site VPN gateway takes usually takes up to 15 minutes.
4. Download and install the VPN client software. After you configure a dynamic gateway and certificates, you will see a link to download a VPN client for a supported operating system. Download the appropriate VPN client (32-bit or 64-bit), and install it on client computers that will be initiating a VPN connection. These are the same computers onto which you installed the client certificates in the first step.
  **Note:** At this present time, the Azure portal does not support creation of a point-to-site virtual network.

## **Creating a point-to-site connection**

The following procedure describes how to create a virtual network and configure a point-to-site virtual network connection by using Azure PowerShell commands.

### **_Configure Azure prerequisites for a point-to site connection_**

To configure Azure prerequisites for a point-to-point site connection:
 	
1. Start Azure PowerShell and sign in to your subscription, type the following command, and then press Enter:
```powershell
Login-AzureRMAccount
``` 	
2. If there are multiple subscriptions associated with your account, select the target subscription in which you are going to create a virtual network, and configure a point-to-site VPN, type the following command, and then press Enter:
```powershell
Select-AzureRmSubscription –SubscriptionId <SUBSCRIPTION_ID>
```
3. Create a new resource group, type the following command, and then press Enter:
```powershell
New-AzureRMResourceGroup –Name P2S-RG –Location westus
```
4. Create a new VNet named **VNet1** and an address space (for example, 10.10.0.0/16), type the following command, and then press Enter:
```powershell
$vnet = New-AzureRMVirtualNetwork –ResourceGroupName P2S-RG –Name Vnet1 –AddressPrefix 10.0.0.0/12 –Location westus
```
5. Add a front-end subnet to the new virtual network, type the following command, and then press Enter:
```powershell
Add-AzureRmVirtualNetworkSubnetConfig -Name FrontEnd -VirtualNetwork $vnet -AddressPrefix 10.11.0.0/16
```
6. Add a gateway subnet to the new virtual network, type the following command, and then press Enter:
```powershell
Add-AzureRmVirtualNetworkSubnetConfig -Name GatewaySubnet -VirtualNetwork $vnet -AddressPrefix 10.15.255.0/26
```
7. Set a variable for the gateway virtual network subnet for which you will request a public IP address, type the following command, and then press Enter:
```powershell
$subnet= Get-AzureRMVirtualNetworkSubnetConfig –Name “GatewaySubnet” –virtualnetwork $vnet
```
8. Request a dynamically assigned IP address, type the following command, and then press Enter:
```powershell
$pip = New-AzureRMPublicIPAddress –Name P2SGWPIP –ResourceGroupName P2S-RG –Location westus –AllocationMethod Dynamic
```
9. Provide IP configuration that is required for the VPN gateway, type the following command, and then press Enter:
```powershell
$ipconfig= New-AzureRmVirtualNetworkGatewayIPConfig –Name GWIPConfig –Subnet $subnet –PublicIPAddress $pip
```
10. Update the configuration of the virtual network, type the following command, and then press Enter:
```powershell
Set-AzureRMVirtualNetwork –VirtualNetwork $vnet
```

## **_Create root and client certificates_**

You need to provision certificates to authenticate clients as they connect to the VPN gateway and to encrypt the resulting connection. You must generate a self-signed root certificate, upload it to the Azure portal, reference it to generate a client certificate, and then install the client certificate on your computer. To complete these tasks, use the following steps:

1. For computers running Windows 10 you need to install the Windows 10 SDK, and then open the command prompt in the location where the **makecert.exe** tool is installed. On computers running the 64-bit version of Windows 10, the default installation location is the platform specific subfolder under the **C:\Program Files (x86)\Windows Kits\10\bin** folder. On computers running the 32-bit version of Windows 10, the default installation location is the platform specific subfolder under **C:\Program Files\Windows Kits\10\bin**.
2. To generate the root certificate, type the following command at the command prompt, and then press Enter:
```js
makecert -sky exchange -r -n "CN=ContosoRootCertificate" -pe -a sha1 -len 2048 -ss My "ContosoRootCertificate.cer"
```
3. In the location where you run the **makecert** tool, export the ContosoRootCertificate from the **Personal** certificate store into a Base-64 encoded string, and then store it in the variable _$rootCert_.
```powershell
$rootCer = Get-ChildItem -Path 'Cert:\CurrentUser\My' | Where-Object {$_.Subject -eq 'CN=ContosoRootCertificate'}
$rootCertText = [System.Convert]::ToBase64String($rootCer.RawData)
$rootCert = New-AzureRmVpnClientRootCertificate –Name ContosoRootCert –PublicCertData [string]$rootCertText
```
4. To prepare the root certificate for use as the Azure virtual network VPN root certificate, type the following command from the Windows PowerShell prompt, and then press Enter:
```powershell
$rootCert = New-AzureRmVpnClientRootCertificate –name ContosoRootCert –PublicCertData $rootCertString
```
5. To generate the client certificate, type the following command at the command prompt, and then press Enter:
```js
makecert.exe -n "CN=ContosoClientCertificate" -pe -sky exchange -m 96 -ss My -in "ContosoRootCertificate" -is my -a sha1
```

## **_Create an Azure VPN gateway_**

Point-to-site connections require a virtual gateway in the virtual network that routes traffic to client on-premises computers. You also need to prepare an IP address pool that you need to allocate to the client that uses the point-to-site VPN connection. In the command that follows, you use the "192.168.0.0/24" IP address range. To create the virtual gateway, type the following command, and then press Enter:
```powershell
New-AzureRmVirtualNetworkGateway -Name ContosoGateway -ResourceGroupName P2S-RG -Location westus -IpConfigurations $ipconfig -GatewayType Vpn -VpnType RouteBased -EnableBgp $false -GatewaySku Standard -VpnClientAddressPool "192.168.0.0/24" -VpnClientRootCertificates $rootCert
```

### **_Create and install the VPN client configuration package_**

To connect to the VPN, a client must use a client configuration package. This package must include the client certificate that you just created:

1. To retrieve the URL link to download a VPN Client Configuration package for 64-bit VPN clients, type the following command, and then press Enter:
```powershell
Get-AzureRmVpnClientPackage -ResourceGroupName P2S-RG -VirtualNetworkGatewayName ContosoGateway -ProcessorArchitecture Amd64
```
2. Copy the URL generated from the previous command, paste it into a browser, and then download and install the VPN package.

### **_Connect to the VPN_**

After you have installed both the client certificate and the VPN client configuration package, you can connect to the virtual network. To do so:

1. Navigate to the list of VPN connections and locate the VPN connection that you created. The name of the VPN connection will be the same as the name of the virtual network in Azure.
2. Right-click the connection, and then click **Connect**.
3. Click **Continue**, and then click **Connect**.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
