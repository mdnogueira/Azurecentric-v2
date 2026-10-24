---
title: "Review certificate expiry across Windows servers"
description: "Review certificate expiry on Windows Server 2025 using PowerShell and the local certificate store."
pubDate: 2026-03-24
category: windows-server
tags: ["windows-server-2025", "certificates", "powershell", "pki", "automation"]
translationKey: review-certificate-expiry-across-windows-servers
draft: false
---

You have a batch of Windows Server 2025 machines to audit, and you need to know which certificates are approaching expiry. The most direct way to do this is to query the local certificate stores using PowerShell. This approach works on Windows Server 2025 without requiring external agents or complex remote management frameworks.

The first thing to establish is where the certificates live. Windows stores certificates in several distinct stores, such as the local machine's personal store, the trusted root store, and the certificate authority store. For server identity and TLS, you are usually interested in the certificates in the `Cert:\LocalMachine\My` store. These are the certificates that the server presents to clients. However, if you are auditing the trust chain, you also need to check the `Cert:\LocalMachine\Root` store for trusted roots and the `Cert:\LocalMachine\CA` store for intermediate certificates.

[![Certificate Expiry Review Flow](/images/posts/2026/azc-291-checkpoints.svg)](/images/posts/2026/azc-291-checkpoints.svg)

## Query the local certificate store

To get a list of certificates in the local machine's personal store, you can use the `Get-ChildItem` cmdlet with the `Cert:` drive. This drive is a provider that exposes the certificate stores as a file-system-like hierarchy.

```powershell
# Illustrative example: List certificates in the local machine's personal store
Get-ChildItem -Path Cert:\LocalMachine\My | Select-Object Subject, NotAfter, Thumbprint
```

This command returns a list of objects, each representing a certificate. The `Subject` property tells you what the certificate is for, `NotAfter` shows the expiry date, and `Thumbprint` is a unique identifier. You can filter this list to find certificates that are expiring soon. For example, to find certificates expiring in the next 30 days:

```powershell
# Illustrative example: Find certificates expiring in the next 30 days
$expiryDate = (Get-Date).AddDays(30)
Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object { $_.NotAfter -lt $expiryDate -and $_.NotAfter -gt (Get-Date) }
```

This script calculates the date 30 days from now and filters the certificates to show only those that expire before that date but after today. This gives you a clear view of imminent expirations.

## Check the trusted root store

While server identity certificates are critical, the trust chain is equally important. If a trusted root certificate expires, all certificates issued by that root will be considered untrusted. To check the trusted root store, use the same `Get-ChildItem` cmdlet but point it to the `Root` store:

```powershell
# Illustrative example: List trusted root certificates
Get-ChildItem -Path Cert:\LocalMachine\Root | Select-Object Subject, NotAfter, Thumbprint
```

You can apply the same filtering logic as before to find expiring roots. Note that the Microsoft Root Certificate Program automatically updates the trusted and untrusted root certificates in Windows. As documented in the Windows Server documentation, these updates are delivered via the CTL Updater, which downloads the latest Certificate Trust Lists (CTLs) from the Windows Update site. This means that while you can manually audit the store, the system is designed to keep these lists current automatically. However, if you are in a disconnected environment or have disabled automatic updates, you must ensure that the CTLs are updated manually or via a scheduled task.

## Automate the review process

For a single server, the manual PowerShell commands are sufficient. However, if you have multiple servers, you can automate the process by running these commands remotely. PowerShell Remoting (WinRM) allows you to execute commands on remote machines. To do this, you need to ensure that WinRM is enabled on the target servers and that you have the necessary permissions.

```powershell
# Illustrative example: Run a certificate check on a remote server
Invoke-Command -ComputerName "Server01" -ScriptBlock {
    Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object { $_.NotAfter -lt (Get-Date).AddDays(30) }
}
```

This command connects to `Server01` and runs the certificate check script block. The results are returned to your local session. You can extend this to check multiple servers by passing a list of computer names to `Invoke-Command`.

## Verify the results

Once you have the list of expiring certificates, you need to verify the context. The `Subject` property tells you the common name or subject of the certificate, but it might not be enough to identify the specific service. You can use the `Thumbprint` to look up more details in the certificate store or in your configuration management database. If the certificate is for a web service, check the IIS or Application Host configuration to see which site or application is using it. If it is for a service like SQL Server or Exchange, check the respective service configuration.

It is also important to distinguish between the certificate itself and the private key. The `Get-ChildItem` cmdlet does not show whether a certificate has an associated private key. To check for private keys, you can look at the `HasPrivateKey` property:

```powershell
# Illustrative example: Check for private key presence
Get-ChildItem -Path Cert:\LocalMachine\My | Select-Object Subject, HasPrivateKey, NotAfter
```

If a certificate does not have a private key, it might be a public certificate or a root certificate. For server identity, you need the private key to perform TLS handshakes. If a certificate is expiring and has a private key, you need to plan for renewal. If it does not have a private key, it might be safe to ignore, depending on its role in the trust chain.

## Next steps

After identifying the expiring certificates, you need to decide on the renewal strategy. If the certificates are issued by an internal Active Directory Certificate Services (AD CS) CA, you can use the certificate template and auto-enrollment features to renew them. As described in the Server Certificate Deployment Planning documentation, you can configure certificate templates to handle renewal automatically. If the certificates are issued by an external CA, you need to follow the CA's renewal process, which might involve generating a new CSR and submitting it to the CA.

For the trusted root store, if you find an expiring root, you need to coordinate with the CA provider to get the updated root certificate. Once you have the new root, you can import it into the `Cert:\LocalMachine\Root` store using the Group Policy or manual import methods. Remember that changes to the root store may require a restart of the services or the server to take effect, depending on how the services cache the certificate store.

By using PowerShell to query the certificate stores, you can get a clear and actionable view of certificate expiry across your Windows Server 2025 estate. This method is lightweight, requires no additional software, and integrates well with existing automation tools. Ensure that you test your renewal process in a non-production environment before applying it to production servers to avoid service disruptions.

References for Review certificate expiry across Windows servers: [Certificates and Trust Management in Windows](https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/certificate-trust), [Distribute certificates to Windows devices by using Group Policy](https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/distribute-certificates-group-policy), [Server Certificate Deployment Planning](https://learn.microsoft.com/en-us/windows-server/networking/core-network-guide/cncg/server-certs/server-certificate-deployment-planning).
