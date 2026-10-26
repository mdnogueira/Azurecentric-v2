---
title: "Erro 0x800F081F ao adicionar features no Windows Server 2016 numa Azure Virtual Machine"
description: "Ao adicionar a feature SMBv1 numa Azure VM com Windows Server 2016 obtive o erro 0x800F081F: a imagem do Azure já não traz os ficheiros de origem. A solução passa por um install.wim."
pubDate: 2020-03-04
category: compute
tags: ["azure-virtual-machines", "windows-server", "troubleshooting"]
translationKey: error-0x800f081f-adding-features-windows-server-2016-azure-vm
cover: ../../../assets/old/posts/2020/03/SMBv1-1.png
coverAlt: "Erro 0x800F081F ao adicionar features no Windows Server 2016 numa Azure Virtual Machine"
---

Num dos meus clientes precisei de adicionar a feature SMBv1 para permitir a comunicação com um File Server legado a correr Windows Server 2003.

![Imagem 1](../../../assets/old/posts/2020/03/SMBv1-1.png)

Durante o processo deparei-me com este erro:

![Imagem 2](../../../assets/old/posts/2020/03/SMBv1-2.png)

Fiz então o download do ISO do Windows Server 2016 e tentei instalar apontando para a pasta Sources, como o erro sugere (abordagem semelhante à que se usa para instalar o .NET 2.0 num Windows Server 2016). Mas o erro persistiu.

Depois de alguma pesquisa e de contactar o suporte do Azure, percebi o seguinte.

Obtive o **_erro 0x800F081F = CBS_E_SOURCE_MISSING_** (source for package or file not found, ResolveSource() unsuccessful) ao tentar ativar a feature SMBv1. Neste caso, a razão é que a imagem do template de deploy do Windows Server 2016 no Azure parece já não trazer os ficheiros de origem do SMBv1 (provavelmente "**amd64_microsoft-windows-smbserver-v1_31bf3856ad364e35_10.0.14393.0_none_076bd4d60d263c3c**" ou algo relacionado com o SMBv1).

Se já viu este problema em máquinas Windows Server 2016 criadas no Azure a partir do template por omissão, siga estes passos:
1. **Apontar para o install.wim original do Windows Server 2016**
  1. Faça download do **install.wim** (do ISO do Windows Server 2016).
  2. Crie as pastas **C:\tempwim** e **C:\tempwim\mount**
  3. Copie o **install.wim** para **C:\tempwim**
  4. Abra a Command Prompt como administrador
    1. Escreva: _**dism /mount-wim /wimfile:c:\tempwim\install.wim /index:4 /mountdir:c:\tempwim\mount /readonly**_
    2. **Nota:** index 4 = Datacenter. Se a máquina corre outra edição, substitua o número do index de acordo com a lista abaixo
      1. = Standard CORE
      2. = Standard
      3. = Datacenter CORE
      4. = Datacenter
    3. Escreva: **_dism /online /Enable-Feature /FeatureName:SMB1Protocol /All /source:c:\tempwim\mount\windows\winsxs /limitaccess_**
  5. Reinicie a máquina
  6. Configure depois o SMBv1 conforme necessário
2. **Desmontar o install.wim da pasta de mount**
  1. Abra a Command Prompt como administrador
  2. Escreva: **_dism /unmount-wim /mountdir:c:\tempwim\mount /discard_**

Um abraço,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
