---
title: "Build an Azure Compute Gallery image workflow"
description: "Build a repeatable Linux image workflow using Azure VM Image Builder and Azure Compute Gallery, covering permissions, replication, and cleanup."
pubDate: 2024-05-01
category: compute
tags: []
translationKey: build-an-azure-compute-gallery-image-workflow
draft: false
---

You need a reliable way to produce custom Linux images and distribute them across regions without manual capture steps. Azure VM Image Builder automates the build process, and Azure Compute Gallery manages the resulting versions and their replication. The workflow requires specific permissions, a user-assigned identity, and careful handling of the gallery resource hierarchy during cleanup.

## Prerequisites and Provider Registration

Before creating any resources, ensure the required resource providers are registered in your subscription. VM Image Builder depends on several providers, including `Microsoft.VirtualMachineImages`, `Microsoft.Compute`, `Microsoft.KeyVault`, `Microsoft.Storage`, `Microsoft.Network`, and `Microsoft.ContainerInstance` [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder).

Check registration status using the Azure CLI:

```azurecli-interactive
az provider show -n Microsoft.VirtualMachineImages -o json | grep registrationState
az provider show -n Microsoft.ContainerInstance -o json | grep registrationState
az provider show -n Microsoft.Compute -o json | grep registrationState
az provider show -n Microsoft.KeyVault -o json | grep registrationState
az provider show -n Microsoft.Storage -o json | grep registrationState
az provider show -n Microsoft.Network -o json | grep registrationState
```

If the state is not *registered*, run the registration commands for all required providers [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder).

## Set Up Variables and Resource Group

Define variables to store the resource group name, location, and gallery details. A critical constraint in this workflow is that the Azure VM Image Builder resource and the source (the VM or managed disk you are capturing) must reside in the same resource group. The Azure Compute Gallery, however, can be in a different resource group [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder).

In this example, we use a single resource group for simplicity, but you should be aware of this constraint if your source VM is in a separate management group.

```azurecli-interactive
# Resource group name - ibLinuxGalleryRG in this example
sigResourceGroup=ibLinuxGalleryRG
# Datacenter location - West US 2 in this example
location=westus2
# Additional region to replicate the image to - East US in this example
additionalregion=eastus
# Name of the Azure Compute Gallery - myGallery in this example
sigName=myIbGallery
# Name of the image definition to be created - myImageDef in this example
imageDefName=myIbImageDef
# Reference name in the image distribution metadata
runOutputName=aibLinuxSIG
subscriptionID=$(az account show --query id --output tsv)

az group create -n $sigResourceGroup -l $location
```

## Create User-Assigned Identity and Permissions

VM Image Builder uses a user-assigned managed identity to inject the image into the Azure Compute Gallery. You must create this identity and assign it a custom role with permissions to create image versions [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder).

1. Create the user-assigned identity:

```azurecli-interactive
identityName=aibBuiUserId$(date +'%s')
az identity create -g $sigResourceGroup -n $identityName
imgBuilderCliId=$(az identity show -g $sigResourceGroup -n $identityName --query clientId -o tsv)
imgBuilderId=/subscriptions/$subscriptionID/resourcegroups/$sigResourceGroup/providers/Microsoft.ManagedIdentity/userAssignedIdentities/$identityName
```

2. Download the role definition template and update it with your subscription and resource group details [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder):

```azurecli-interactive
curl https://raw.githubusercontent.com/Azure/azvmimagebuilder/master/solutions/12_Creating_AIB_Security_Roles/aibRoleImageCreation.json -o aibRoleImageCreation.json
imageRoleDefName="Azure Image Builder Image Def"$(date +'%s')
sed -i -e "s/<subscriptionID>/$subscriptionID/g" aibRoleImageCreation.json
sed -i -e "s/<rgName>/$sigResourceGroup/g" aibRoleImageCreation.json
sed -i -e "s/Azure Image Builder Service Image Creation Role/$imageRoleDefName/g" aibRoleImageCreation.json
az role definition create --role-definition ./aibRoleImageCreation.json
```

3. Assign the role to the identity:

```azurecli-interactive
az role assignment create \
    --assignee $imgBuilderCliId \
    --role "$imageRoleDefName" \
    --scope /subscriptions/$subscriptionID/resourceGroups/$sigResourceGroup
```

## Create Gallery and Image Definition

VM Image Builder does not create the gallery or image definition; these must exist beforehand [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder).

1. Create the gallery:

```azurecli-interactive
az sig create \
    -g $sigResourceGroup \
    --gallery-name $sigName
```

2. Create the image definition. Include features like `TrustedLaunchSupported` if required [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder):

```azurecli-interactive
az sig image-definition create \
   -g $sigResourceGroup \
   --gallery-name $sigName \
   --gallery-image-definition $imageDefName \
   --publisher myIbPublisher \
   --offer myOffer \
   --sku 20_04-lts-gen2 \
   --os-type Linux \
   --hyper-v-generation V2 \
   --features SecurityType=TrustedLaunchSupported
```

## Configure and Run the Image Template

Download the JSON template for the image build and substitute your variables [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder):

```azurecli-interactive
curl https://raw.githubusercontent.com/Azure/azvmimagebuilder/master/quickquickstarts/1_Creating_a_Custom_Linux_Shared_Image_Gallery_Image/helloImageTemplateforSIG.json -o helloImageTemplateforSIG.json
sed -i -e "s/<subscriptionID>/$subscriptionID/g" helloImageTemplateforSIG.json
sed -i -e "s/<rgName>/$sigResourceGroup/g" helloImageTemplateforSIG.json
sed -i -e "s/<imageDefName>/$imageDefName/g" helloImageTemplateforSIG.json
sed -i -e "s/<sharedImageGalName>/$sigName/g" helloImageTemplateforSIG.json
sed -i -e "s/<region1>/$location/g" helloImageTemplateforSIG.json
sed -i -e "s/<region2>/$additionalregion/g" helloImageTemplateforSIG.json
sed -i -e "s/<runOutputName>/$runOutputName/g" helloImageTemplateforSIG.json
sed -i -e "s%<imgBuilderId>%$imgBuilderId%g" helloImageTemplateforSIG.json
```

Submit the template and trigger the build:

```azurecli-interactive
az resource create \
    --resource-group $sigResourceGroup \
    --properties @helloImageTemplateforSIG.json \
    --is-full-object \
    --resource-type Microsoft.VirtualMachineImages/imageTemplates \
    -n helloImageTemplateforSIG01

az resource invoke-action \
     --resource-group $sigResourceGroup \
     --resource-type  Microsoft.VirtualMachineImages/imageTemplates \
     -n helloImageTemplateforSIG01 \
     --action Run
```

Wait for the build and replication to complete. You can verify the image version in the gallery using `az sig image-version list` [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder).

## Verification and Cleanup

To verify the image, create a VM using the latest version reference [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder):

```azurecli-interactive
az vm create \
  --resource-group $sigResourceGroup \
  --name myAibGalleryVM \
  --admin-username aibuser \
  --location $location \
  --image "/subscriptions/$subscriptionID/resourceGroups/$sigResourceGroup/providers/Microsoft.Compute/galleries/$sigName/images/$imageDefName/versions/latest" \
  --security-type TrustedLaunch \
  --generate-ssh-keys
```

If the resources are no longer needed, delete them in reverse order of creation. You must delete the image version before the image definition, and the image definition before the gallery [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder).

1. Delete the template:

```azurecli-interactive
az resource delete \
    --resource-group $sigResourceGroup \
    --resource-type Microsoft.VirtualMachineImages/imageTemplates \
    -n helloImageTemplateforSIG01
```

2. Remove permissions:

```azurecli-interactive
az role assignment delete \
    --assignee $imgBuilderCliId \
    --role "$imageRoleDefName" \
    --scope /subscriptions/$subscriptionID/resourceGroups/$sigResourceGroup
az role definition delete --name "$imageRoleDefName"
az identity delete --ids $imgBuilderId
```

3. Delete the image version. The quickstart example uses a fragile query to find versions starting with `0.`. For a more robust approach, list the versions and delete the specific one you created, or use a known version number if you manage them explicitly [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder):

```azurecli-interactive
# List versions to identify the one to delete
az sig image-version list \
-g $sigResourceGroup \
--gallery-name $sigName \
--gallery-image-definition $imageDefName \
--subscription $subscriptionID

# Delete the specific version (replace <version> with the actual version string)
az sig image-version delete \
-g $sigResourceGroup \
--gallery-image-version <version> \
--gallery-name $sigName \
--gallery-image-definition $imageDefName \
--subscription $subscriptionID
```

4. Delete the image definition and gallery [Use Azure VM Image Builder with an Azure Compute Gallery for Linux VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder):

```azurecli-interactive
az sig image-definition delete \
g $sigResourceGroup \
--gallery-name $sigName \
--gallery-image-definition $imageDefName \
--subscription $subscriptionID
az sig delete -r $sigName -g $sigResourceGroup
az group delete -n $sigResourceGroup -y
```

## Considerations for Replication and Cost

Azure Compute Gallery replicates image versions to target regions. The first replica incurs network egress charges; subsequent replicas within the region do not [Overview of Azure Compute Gallery](https://learn.microsoft.com/en-us/azure/virtual-machines/azure-compute-gallery). Storage costs are based on the occupied size of the image version and the number of replicas [Overview of Azure Compute Gallery](https://learn.microsoft.com/en-us/azure/virtual-machines/azure-compute-gallery). For production images, maintain at least three replicas, or one replica for every 20 concurrent VMs, up to 50 per region [Overview of Azure Compute Gallery](https://learn.microsoft.com/en-us/azure/virtual-machines/azure-compute-gallery). Use Zone Redundant Storage (ZRS) where available for high availability [Overview of Azure Compute Gallery](https://learn.microsoft.com/en-us/azure/virtual-machines/azure-compute-gallery).

diagram:
  title: Azure VM Image Builder Workflow
  nodes:
    - name: Source VM
      description: Generalized Linux VM or managed disk
    - name: Image Builder Template
      description: JSON config defining build steps and distribution
    - name: User-Assigned Identity
      description: Provides permissions to write to the Compute Gallery
    - name: Compute Gallery
      description: Stores the image definition and version
    - name: Target Regions
      description: Regions where the image version is replicated
    - name: Deployed VM
      description: VM created from the latest image version

claims:
  - claim: Azure VM Image Builder requires specific resource providers to be registered.
    source_id: S2
    evidence_span: "To use VM Image Builder, you need to register the providers. Check your registration by running the following commands: az provider show -n Microsoft.VirtualMachineImages -o json | grep registrationState"
  - claim: VM Image Builder uses a user-assigned managed identity to inject the image into the gallery.
    source_id: S2
    evidence_span: "VM Image Builder uses the provided user-identity to inject the image into an Azure Compute Gallery."
  - claim: VM Image Builder does not create the gallery or image definition.
    source_id: S2
    evidence_span: "To use VM Image Builder with Azure Compute Gallery, you need to have an existing gallery and image definition. VM Image Builder doesn't create the gallery and image definition for you."
  - claim: Storage costs for Azure Compute Gallery are based on the occupied size of the image version and the number of replicas.
    source_id: S1
    evidence_span: "For images, the storage cost is charged as a snapshot and is based on the occupied size of the image version, the number of replicas of the image version and the number of regions the version is replicated to."
  - claim: Network egress charges apply only to the first replica copied to additional regions.
    source_id: S1
    evidence_span: "you'll pay network egress charges for the first replica to be copied to the additional two regions. Subsequent replicas are handled within the region, so there are no additional charges."
  - claim: You must delete image versions before the image definition, and the image definition before the gallery.
    source_id: S2
    evidence_span: "When you're deleting gallery resources, you need delete all the image versions before you can delete the image definition that was used to create them. To delete a gallery, you first need to have deleted all the image definitions in the gallery."

review_questions:
  - "How does the workflow change if the source image is a specialized VM rather than a generalized one?"
  - "What are the specific limits for image versions per subscription per region, and how do they impact large-scale deployments?"
  - "How can you automate the exclusion of specific image versions from the 'latest' selection using regional flags?"
  - "What are the prerequisites for sharing images via a direct shared gallery in preview, and how does it differ from RBAC sharing?"
  - "How does shallow replication affect the ability to deploy large numbers of VMs concurrently compared to deep replication?"
