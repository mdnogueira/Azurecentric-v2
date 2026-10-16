---
title: "Como ligar o Windows Admin Center ao Azure"
description: "Passo a passo para registar o Windows Admin Center (WAC) no seu tenant do Azure: device code, login, permissões e como confirmar o Tenant ID correto quando tem mais do que um."
pubDate: 2019-10-16
category: automation
tags: [hybrid, subscriptions, windows-admin-center]
translationKey: how-to-connect-windows-admin-center-with-azure
cover: ../../../assets/old/posts/2019/10/WAC1.png
coverAlt: "Como ligar o Windows Admin Center ao Azure"
---

Quando começo um projeto com um cliente novo e a conversa chega à gestão dos workloads, seja on-premises seja no Azure, gosto sempre de pôr o Windows Admin Center (WAC) em cima da mesa como tema.

Desde os primeiros tempos do Windows Admin Center que fiquei completamente viciado no WAC. Achei-o muito fácil de trabalhar e, comparado com a outra ferramenta nativa de gestão de servidores (sim, o Server Manager), é muito melhor — é o dia e a noite.

Depois de instalar o WAC, se for a **Settings** encontra a configuração do **Azure** em **Gateway**. Depois é só clicar no botão Register para iniciar o processo.

![Imagem 1](../../../assets/old/posts/2019/10/WAC1.png)

Depois de clicar em **Register**, aparece o device code que precisa de registar no seu tenant do Azure. Copie o código (ou clique no botão **Copy Code**). Sugiro que o cole temporariamente num notepad.

A seguir clique no URL **Device Login**, indicado no passo 2.

![Imagem 2](../../../assets/old/posts/2019/10/WAC2.png)

Depois de clicar no link **Device Login**, aparece a janela para introduzir o Device Code fornecido anteriormente. Cole o código e clique em **Next**.

![Imagem 3](../../../assets/old/posts/2019/10/WAC3.png)

Agora precisa de introduzir as credenciais para ligar o WAC ao Azure. Escreva o seu endereço de email e depois a palavra-passe. Clique em **Next**.

![Imagem 4](../../../assets/old/posts/2019/10/WAC4.png)

Depois de iniciar sessão com credenciais válidas, está quase a terminar o registo do seu dispositivo como dispositivo de confiança para gerir workloads com o WAC e ligar-se aos serviços do Azure.

![Imagem 5](../../../assets/old/posts/2019/10/WAC5.png)

Agora que registou o dispositivo, precisa de configurar as permissões. Neste passo tem de escolher o tenant do Azure correto. Se só tem um tenant do Azure associado à sua conta, basta clicar em **Register**.

![Imagem 6](../../../assets/old/posts/2019/10/WAC6.png) 

Se tem mais do que um tenant do Azure associado à sua conta, precisa de confirmar a qual deles quer dar permissões. Neste momento o WAC mostra apenas o ID do tenant. Assumindo que não sabe de cor o ID do seu tenant, esta é a forma que recomendo para validar qual é o Tenant ID a que quer dar permissões ao WAC.

Inicie sessão no Azure Portal; no canto superior direito encontra as suas credenciais. Clique nelas e depois no link **Switch Directory**.

![Imagem 7](../../../assets/old/posts/2019/10/WAC7.png)

Ao clicar em **Switch Directory**, expande-se a secção **Directory + Subscription**. Em Switch Directory, use a lista para ver que tenants do Azure tem associados. Ao selecionar o correto, consegue ver o Tenant ID. Confirme que é o mesmo ID que aparece no WAC. Depois clique em **Register**.

![Imagem 8](../../../assets/old/posts/2019/10/WAC8.png)

![Imagem 9](../../../assets/old/posts/2019/10/WAC9.png)

Um abraço,

**Marcos Nogueira**  
**_Azure MVP_**  
[azurecentric.com](http://azurecentric.com)  
Twitter: [@mdnoga](http://www.twitter.com/mdnoga)
