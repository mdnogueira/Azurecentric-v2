---
title: "Implementing Self-signed Certificates in Hyper-V Replica"
description: "The command installs a test certificate in the Personal store of the local machine and is saved as a file locally. The certificate can be used for both Client and Server…"
pubDate: 2012-12-25
category: hyper-v
tags: [hyper-v-replica]
translationKey: implementing-self-signed-certificates-in-hyper-v-replica
legacy: true
legacyUrl: /2012/12/implementing-self-signed-certificates-in-hyper-v-replica.html
---

## **On the Primary Server**
  * Copy the _makecert.exe_ utility locally.
  * Run the following elevated command to Create a self-signed root authority certificate
```js
makecert _**_-pe -n "CN=PrimaryTestRootCA" -ss root -sr LocalMachine -sky signature -r "PrimaryTestRootCA.cer"
```
The command installs a test certificate in the root store of the local machine and is saved as a file locally
  * Run the following elevated command to create a new certificate signed by the test root authority certificate
```js
makecert _**_-pe -n "CN=<_**_FQDN_**_>" -ss my -sr LocalMachine -sky exchange -eku 1.3.6.1.5.5.7.3.1,1.3.6.1.5.5.7.3.2 -in "PrimaryTestRootCA" -is root -ir LocalMachine -sp "Microsoft RSA SChannel Cryptographic Provider" -sy 12 PrimaryTestCert.cer
```
Where **_<FQDN>_** is the Primary Server FQDN

The command installs a test certificate in the Personal store of the local machine and is saved as a file locally. The certificate can be used for both Client and Server authentication

## **  ****On the Replica Server**
  * Copy the _makecert.exe_ locally
  * Run the following elevated command to Create a self-signed root authority certificate
```js
makecert_**_ -pe -n "CN=RecoveryTestRootCA" -ss root -sr LocalMachine -sky signature -r "RecoveryTestRootCA.cer"
```
The command installs a test certificate in the root store of the local machine and is saved as a file locally.	
  * Run the following elevated command to create a new certificate signed by the test root authority certificate
```js
makecert_**_ -pe -n "CN=<FQDN>" -ss my -sr LocalMachine -sky exchange -eku 1.3.6.1.5.5.7.3.1,1.3.6.1.5.5.7.3.2 -in "RecoveryTestRootCA" -is root -ir LocalMachine -sp "Microsoft RSA SChannel Cryptographic Provider" -sy 12 RecoveryTestCert.cer
```

Where <FQDN> is the Replica Server FQDN

The command installs a test certificate in the Personal store of the local machine and is saved as a file locally.  The certificate can be used for both Client and Server authentication.

## **Finishing Up**
  * Copy "RecoveryTestRootCA.cer" from the Replica server to the Primary and import by running the following command elevated
```js
certutil -addstore -f Root "RecoveryTestRootCA.cer"
```
  * Copy "PrimaryTestRootCA.cer" from the Primary server to the Replica and import by running the following command elevated
```js
certutil -addstore -f Root "PrimaryTestRootCA.cer"
```
  * By default, a certificate revocation check is mandatory and Self-Signed Certificates don’t support Revocation checks. Hence, both modify the following registry key on both the Primary and Replica servers to disable the CRL check
```js
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Virtualization\Replication" /v DisableCertRevocationCheck /d 1 /t REG_DWORD /f
```
The above step (3) is applicable if the CRL is inaccessible in general.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
