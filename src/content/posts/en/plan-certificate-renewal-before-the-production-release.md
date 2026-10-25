---
title: "Plan certificate renewal before the production release"
description: "Plan certificate renewal by distinguishing managed, paid, and BYO options to avoid production outages."
pubDate: 2025-12-28
category: app-paas
tags: ["certificates", "azure-app-service", "certificate-renewal", "azure-container-apps", "tls-ssl", "containers"]
translationKey: plan-certificate-renewal-before-the-production-release
draft: false
---

You have a production release scheduled for next week, and your custom domain certificate expires in ten days. The immediate problem is not the release itself, but the fact that the certificate binding will break before the new code lands. If you are relying on a certificate that requires manual intervention, the release timeline is now a race against an expiration date.

The first step is to identify which certificate type is currently bound to your domain. Azure App Service and Azure Container Apps offer different mechanisms for certificate management, and the renewal behaviour depends entirely on which one you are using. Assuming the wrong capability leads to last-minute panic.

## Identify your current certificate type

App Service provides three distinct certificate options, each with different renewal implications. You need to check the **TLS/SSL settings** blade for your web app to see which category your custom domain falls into.

### App Service managed certificates (Free)

These are fully managed by App Service and are issued at no cost. The documentation states they are "fully managed by App Service, including automatic renewal" [What Is TLS/SSL in Azure App Service?](https://learn.microsoft.com/en-us/azure/app-service/overview-tls). If your domain is bound to a free managed certificate, you do not need to do anything. The system handles issuance and renewal automatically. However, these certificates do not support wildcard domains or custom root CAs, and you cannot export them [What Is TLS/SSL in Azure App Service?](https://learn.microsoft.com/en-us/azure/app-service/overview-tls). If you are using this type, your renewal is already planned; you just need to verify the binding is active.

### App Service certificates (ASC)

These are paid certificates. Unlike the free managed certificates, ASCs are stored in Azure Key Vault and are "fully managed" in terms of renewal, but they require you to own and manage the certificate lifecycle within your Key Vault [What Is TLS/SSL in Azure App Service?](https://learn.microsoft.com/en-us/azure/app-service/overview-tls). If you are using ASC, renewal is automatic provided the Key Vault integration is correctly configured. You should check the Key Vault to ensure the certificate is set to renew and that notifications are configured for lifecycle events [Certificates in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/certificates-overview).

### Bring your own certificate (BYOC)

If you have uploaded a PFX file directly to App Service, this is a BYOC scenario. This is "fully customer-managed" [What Is TLS/SSL in Azure App Service?](https://learn.microsoft.com/en-us/azure/app-service/overview-tls). There is no automatic renewal. You must manually upload the renewed certificate and rebind it to the domain before the current one expires. This is the most common cause of production outages because the burden of renewal lies entirely with you.

## Plan the renewal action

Once you have identified the type, the action plan diverges.

### If you are using BYOC

You must renew the certificate externally or through your internal PKI, then upload the new PFX to App Service. The process involves:

1. Obtain the renewed certificate (PFX format).
2. Upload it to the **Private Key Certificates** section in the App Service blade.
3. Go to **Custom Domains** and rebind the domain to the new certificate.
4. Verify the binding is active and the new certificate is served.

This process requires downtime or careful timing if you are using IP-based bindings, but SNI bindings allow you to bind the new certificate before removing the old one. Do not wait until the last day. Upload the new certificate with sufficient time to allow for verification. SNI allows multiple certificates to be bound to the same IP address, but you must ensure the old certificate remains valid during the transition period to avoid clients rejecting the connection if they have cached the old expiry date.

### If you are using ASC

Check the associated Key Vault. Ensure the certificate is set to auto-renew. If you are using Key Vault for other certificates, verify that the access policies allow App Service to read the certificate. If the Key Vault is in a different subscription or tenant, ensure the permissions are correctly configured. The renewal is automatic, but the dependency on Key Vault means you must monitor the Key Vault health, not just the App Service certificate status.

### If you are using Free Managed Certificates

No action is required for renewal. However, you should verify that the domain validation is still passing. If the domain ownership changes or the DNS records are modified, the managed certificate may fail to renew. Check the **TLS/SSL settings** blade for any errors or warnings related to domain validation.

## Verify the binding

Regardless of the certificate type, you must verify the binding before the release. Use the following steps:

1. Navigate to the **TLS/SSL settings** blade in the Azure portal.
2. Select the **Private Key Certificates** or **Certificate Authority Certificates** section.
3. Identify the certificate bound to your custom domain.
4. Check the **Expiration date** to ensure it is well beyond the release date.
5. Use a tool like `curl` or an online SSL checker to verify that the correct certificate is being served for your domain.

If you are using BYOC, ensure the new certificate is bound and the old one is removed or set to expire after the new one. If you are using ASC or Free Managed Certificates, confirm that the automatic renewal process is functioning by checking the Key Vault or the App Service certificate status.

## Considerations for Container Apps

If your workload is on Azure Container Apps, the certificate management options are similar but distinct. Container Apps supports custom domains with free managed certificates, existing certificates, and certificates from Azure Key Vault [Certificates in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/certificates-overview). The free managed certificates in Container Apps are described as "free of charge and easy to use" [Certificates in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/certificates-overview). For specific details on how these are renewed, refer to the linked documentation, as the provided overview does not explicitly state the renewal mechanism. If you are using Key Vault, the renewal behaviour is the same as in App Service: automatic if configured, but dependent on Key Vault health.

## Decision criteria

- **Use Free Managed Certificates** if you need a simple, no-cost solution for a single domain and do not need wildcard support or exportability.
- **Use ASC** if you need wildcard domains, exportability, or integration with existing Key Vault infrastructure.
- **Use BYOC** if you have specific compliance requirements that necessitate using a certificate from your own PKI, but be prepared to manage the renewal manually.

The key to avoiding production outages is to identify the certificate type early and plan the renewal action accordingly. If you are using BYOC, start the renewal process immediately. If you are using ASC or Free Managed Certificates, verify the automatic renewal configuration and monitor the Key Vault or certificate status. Do not assume that a certificate will renew itself without checking the underlying configuration.

Verify the binding and expiration date one final time before you proceed with the release. This ensures the infrastructure dependency is resolved, allowing the release timeline to focus on the code changes.
