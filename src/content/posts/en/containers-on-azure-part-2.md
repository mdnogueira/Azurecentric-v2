---
title: "Containers on Azure – Part 2"
description: "On the previous post (see here), I talked about the concept of Containers, Azure Container Service and Azure Service Fabric. Now that you know the concept and have an idea how…"
pubDate: 2017-05-16
category: apps
tags: ["containers", "service-fabric", "azure-virtual-machines", "docker", "linux"]
translationKey: containers-on-azure-part-2
legacy: true
legacyUrl: /2017/05/containers-on-azure-part-2.html
---

On the previous post ([see here](/posts/containers-on-azure-part-1)), I talked about the concept of Containers, Azure Container Service and Azure Service Fabric. Now that you know the concept and have an idea how to implement it, let see how can you deploy containers in Azure.

Azure offers several ways to provision Azure virtual machines that support Docker containers:
  * **Install the Docker virtual machine extension.** You can either add the extension to an existing Azure virtual machine running a Docker-supported distribution of Linux or include it when deploying a new Azure virtual machine via a Resource Manager template or a command-line script. The extension installs the Docker daemon, also called the _Docker Engine_; the Docker client; and Docker Compose. The Docker daemon is necessary for an Azure virtual machine to function as a Docker host.
    **Note:** Docker Engine is a lightweight software component that runs as a daemon on a Linux operating system. It provides the environment for running containerized apps.
    The Docker client is management software that allows you to interact with the Docker Engine via a command line, which allows you to create, run, and transfer containers.
    Docker Compose is a utility for building and running Docker apps that consist of multiple containers.
  * **Provision a Docker Azure virtual machine available from the Azure Marketplace.** Use the Azure portal to deploy a Linux virtual machine to run Docker containerized workloads. During the virtual machine deployment, Azure automatically provisions the Docker virtual machine extension, which installs all the necessary Docker components.
  * **Deploy an ACS cluster.** This allows you to provision and manage multiple instances of Docker containers residing on clustered Docker hosts.
  * **Use the Docker Machine driver to deploy an Azure virtual machine with support for Docker containers.** Docker Machine is a command-line utility that allows you to perform several Docker-related administrative tasks, including provisioning new Docker hosts. The utility includes support for deploying Docker hosts on-premises and on Azure virtual machines. You must include the _‑driver azure _parameter when running the **_docker-machine create_** For example, the following command deploys a new Azure virtual machine named **dockerazurevm1** in an Azure subscription. You specify the subscription ID, create an administrative user account named **mrdocker**, and enable connectivity on TCP port 80.

```js
docker-machine create -d azure \ --azure-ssh-user mrdocker \ --azure-subscription-id your_Azure_subscription_ID \ --azure-open-port 80 \ dockerazurevm1
```
With the default settings, the virtual machine has the size **Standard_A2** and resides on an Azure virtual network named **docker-machine** in a **docker-machine** resource group in the **West US** region. A default network security group associated with the virtual machine network interface allows inbound connectivity on TCP port 22 for Secure Shell connections and on TCP port 2376 for remote connections from the Docker client. The command also generates self-signed certificates that help to secure subsequent communication from the computer where you ran Docker Machine and store the corresponding private key in your user’s account profile.

For the full syntax of the docker-machine create -d azure command, refer to [Microsoft Azure](https://docs.docker.com/machine/drivers/azure/).

Docker Machine is available on Windows, Linux, and Mac OS X operating systems. For installation instructions and links to download locations, refer to [Install Docker Machine](https://docs.docker.com/machine/install-machine/#installing-machine-directly).

## Containers on a Azure Virtual Machine

Choosing the most convenient and efficient way to run containers in your environment depends on the location of Docker hosts. Docker Machine allows for managing an on-premises and Azure-based Docker host in a consistent manner.

During Azure virtual machine provisioning, Docker Machine generates the self-signed certificate that you can use to establish a Secure Shell session to the Docker host. It also stores the certificate’s private key in your user account profile. This allows you to continue managing the Azure virtual machine from the same computer on which you initiated the virtual machine provisioning. To simplify management, you should also configure environment variables within your Windows command shell. To identify the environment variables to configure, run the following at the command prompt, where _dockerazurevm1_ is the name of the Azure virtual machine you deployed by running the **docker-machine create** command.
```js
docker-machine env dockerazurevm1
```

This should return output similar to the following.
```js
SET DOCKER_TLS_VERIFY=”1” 
SET DOCKER_HOST=”tcp://191.237.46.90:2376”
SET DOCKER_CERT_PATH=”C:\Users\Admin\.docker\dockerazurevm1\certs”
SET DOCKER_MACHINE_NAME=”dockerazurevm1”
@FOR /f "tokens=*" %i IN ('docker-machine env dockervm1) DO @%i
```

You can now start a container on the Azure virtual machine by running the following command.
```js
docker run -d -p 80:80 --restart=always container_name
```
This automatically locates the container named _container_name_, publishes it on port 80, initiates its execution in the detached mode, and ensures that the container always restarts after it terminates, regardless of the exit status. With the detached mode, the console session is not attached to the container process, so you can use it to continue managing the Docker host. In the attached mode, the console session displays the standard input, output, and error from the Docker container.

For the full syntax of the docker run command, refer to [Docker Run](https://docs.docker.com/engine/reference/commandline/run/).

The **docker run** command attempts to locate the latest version of the container locally on the Docker host. By default, it checks the version against the [Docker Hub](https://hub.docker.com/). This is a central, Docker-managed repository of Docker images available publicly via the Internet. If there is no locally cached container image or its version is out-of-date, the Docker daemon automatically downloads the latest version from the Docker Hub.

You can set up a private Docker Registry to maintain your own collection of container images. A private Docker Registry runs as a container based on the registry image available from the Docker Hub. You can store your private images in an Azure storage account.

To set up a private Docker Registry, follow this procedure:
  1. Create an Azure storage account.
  2. Start a registry container on a Docker host by running the following command.
```js
docker run -d -p 5000:5000 -e REGISTRY_STORAGE=azure -e REGISTRY_STORAGE_AZURE_ACCOUNTNAME="storage-account_name" -e REGISTRY_STORAGE_AZURE_ACCOUNTKEY="storage-account-key" -e REGISTRY_STORAGE_AZURE_CONTAINER="registry" --name=registry registry:2
```
    In the preceding command, **_storage_account_name_** and **_storage_account_key_** represent the name and one of the two keys of the Azure storage account you created in the previous step. This provisions a new registry container and makes it accessible via TCP port 5000.
    **Note:** To allow inbound connections on the port that you specified when executing the docker run command, be sure to update the network security group associated with the Docker Azure VM network interface where the registry container is running.
  3. Build a new Docker image by running the **docker build **command, or pull an existing image from Docker Hub by running the **docker pull** command.
  4. Use the following **docker tag** command to associate the image you created or downloaded in the previous step with the private registry.
```js
docker tag hello-world localhost:5000/image_name
```
    In the preceding command, _image_name _represents the name of the image. This tags the image and designates a new repository in your private registry.
  5. To upload the newly tagged image to the private Docker Registry, run the following command.
```js
docker push localhost:5000/image_name
```
    This pushes the image into the private registry.
  6. To download the image from the private registry, run the following command.
```js
docker pull localhost:5000/image_name
```
    If you run the **docker run **command, the Docker daemon uses the newly downloaded image from your private registry.

Cheers,

**Marcos Nogueira**
[azurecentric.com](http://azurecentric.com)
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
