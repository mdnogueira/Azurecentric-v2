---
title: "Configure a custom domain and HTTPS for a web application"
description: "Map a custom domain and enable HTTPS in Azure App Service using managed certificates, covering DNS, bindings, and validation constraints."
pubDate: 2025-11-04
category: apps
tags: ["azure-app-service", "custom-domain", "ssl-certificate", "managed-certificate", "https"]
translationKey: configure-a-custom-domain-and-https-for-a-web-application
draft: false
---

You have a web application running on Azure App Service and need to replace the default `*.azurewebsites.net` domain with your own branded address, secured with HTTPS. The practical answer is to map your DNS, bind the domain in the portal, and then enable the free App Service Managed Certificate. This approach removes the burden of manual renewal, but it requires that your app is publicly reachable during the validation process and that you understand the scope limitations of managed certificates.

## Map the custom domain to your app

Before App Service can issue a certificate, it must know that the domain belongs to your app. This involves two distinct steps: configuring your DNS provider and binding the domain in Azure.

### Configure DNS records

You need to create DNS records that point your domain to Azure. The record type depends on whether you are using an apex domain (e.g., `contoso.com`) or a subdomain (e.g., `www.contoso.com`).

For an **apex domain**, you must create an **A record** pointing to your app’s IP address. You can find this IP address in the App Service blade under **Custom domains** or via the Azure CLI. Because IP addresses can change, monitoring for updates is necessary if you do not use Azure DNS for the zone.

For a **subdomain**, you should create a **CNAME record** that aliases directly to your app’s default domain (e.g., `myapp.azurewebsites.net`). Do not point the CNAME to an intermediate service like Traffic Manager unless you have explicitly configured it for custom domains, as this can block certificate issuance [Install a TLS/SSL Certificate for Your App](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-certificate).

### Bind the domain in Azure

Once the DNS records are propagated, you need to bind the domain to your specific App Service app. In the Azure portal, navigate to your app, select **Custom domains** from the left-hand menu, and click **Add custom domain**. Enter your domain name and select **Validate**. If the DNS records are correct and you own the domain, the validation will succeed.

Note that binding the domain does not automatically enable HTTPS. You must explicitly configure the SSL binding and the certificate separately.

## Enable the free App Service Managed Certificate

App Service offers a free managed certificate that is fully automated. It is issued by DigiCert and renewed automatically as long as your configuration remains stable [Install a TLS/SSL Certificate for Your App](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-certificate). This is the recommended approach for most production apps because it eliminates the risk of expiration due to human error.

### Prerequisites for issuance

Before you create the certificate, ensure the following:

1. **App Service Plan Tier**: Your app must be running on a Basic, Standard, Premium, or Isolated tier. Free and Shared plans do not support custom domain bindings or managed certificates [Install a TLS/SSL Certificate for Your App](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-certificate).
2. **Public Accessibility**: For root domains, the app must be publicly accessible. Certificate validation requires the issuer to reach your app to verify ownership. If you have IP restrictions configured, ensure they allow traffic from the certificate issuer’s IP ranges or disable them temporarily during validation [Install a TLS/SSL Certificate for Your App](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-certificate).
3. **CAA Records**: For some domains, you may need to create a Certification Authority Authorization (CAA) record with your DNS provider, allowing `digicert.com` to issue certificates for your domain [Install a TLS/SSL Certificate for Your App](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-certificate).

### Create the certificate

In the Azure portal, navigate to your App Service app and select **Certificates** from the left-hand menu. Click **Add certificate** and select the **Managed certificates** tab. Choose the custom domain you mapped earlier and click **Validate**. If validation succeeds, click **Add**.

The certificate creation process may take a few minutes. Once complete, the certificate will appear in the list with a status of **Active**.

## Bind the certificate to your custom domain

Having the certificate in your app’s certificate store is not enough; you must bind it to your custom domain to enable HTTPS. This step tells App Service to use the managed certificate for traffic arriving at your custom domain.

In the **Certificates** blade, select the managed certificate you just created. Click **Add binding** and choose **Custom domain**. Select your custom domain from the list and choose **TLS/SSL certificate** as the binding type. Confirm the binding.

App Service will now serve HTTPS traffic for your custom domain using the managed certificate. You can verify this by navigating to `https://yourdomain.com` in a browser. The certificate details should show that it is issued by DigiCert and managed by App Service.

## Verify and monitor

After configuration, verify that the certificate is valid and not expiring soon. In the **Certificates** blade, check the **Managed certificates** list for the status and expiration date. App Service will automatically renew the certificate before it expires, but it is good practice to monitor this periodically.

If you encounter issues with certificate issuance, check the following:

- **DNS Propagation**: Ensure your DNS records have fully propagated. Use a DNS lookup tool to verify the A or CNAME records.
- **Public Access**: Ensure your app is not blocked by IP restrictions or firewall rules during the validation process.
- **CAA Records**: If issuance fails, check your DNS provider for CAA records that might be blocking DigiCert.

For more detailed guidance on custom domains and certificates, refer to the [Overview of using custom domain names](https://learn.microsoft.com/en-us/azure/app-service/overview-custom-domains) and [Install a TLS/SSL Certificate for Your App](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-certificate) documentation.
