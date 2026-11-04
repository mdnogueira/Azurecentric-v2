---
title: "A tríade CIA: três perguntas sobre o mesmo serviço"
description: "Use a confidencialidade, a integridade e a disponibilidade para analisar um portal de clientes, escolher evidência útil e identificar lacunas nos controlos."
pubDate: 2026-11-06T11:00:00-05:00
language: pt-PT
category: cloud-security
tags: [cybersecurity, cloud-security, data-protection, security-architecture]
translationKey: cybersecurity-in-practice-02-cia-triad
draft: false
---

*Episódio 2 da série Cibersegurança na Prática*

[Consultar a série](/pt/series/cybersecurity-in-practice)

Um cliente consegue iniciar sessão na aplicação, abrir um pedido e obter uma resposta. Tudo parece estar a funcionar bem. Depois, descobre que esse cliente também consegue abrir o pedido de outra pessoa, bastando alterar um identificador no endereço.

A aplicação estava disponível. A informação não ficou limitada às pessoas a quem se destinava. São duas observações diferentes, e essa diferença mostra a utilidade da tríade CIA.

Neste contexto, CIA significa **confidencialidade, integridade e disponibilidade**, a partir das iniciais dos termos em inglês. Permite colocar três perguntas sobre o mesmo serviço: quem pode ler a informação, quem a pode alterar e se as pessoas certas a conseguem utilizar quando precisam. Os [princípios de segurança da Microsoft](https://learn.microsoft.com/en-us/azure/well-architected/security/principles) tratam estas preocupações em conjunto numa carga de trabalho segura. Na nossa análise, o passo importante é encontrar evidência para cada uma.

![Três cenários de falha distintos num portal de clientes fictício: um registo divulgado à pessoa errada, uma alteração não autorizada a um pedido e um serviço que não pode ser restabelecido.](/images/series/cybersecurity-in-practice/episode-02-cia-triad.pt.svg)

## Mantenha uma aplicação como referência

Vamos continuar com o **portal de clientes fictício** do Episódio 1. Os clientes submetem pedidos, os colaboradores processam-nos e uma equipa de operações mantém o serviço em funcionamento. Os exemplos deste artigo são ilustrativos; não são resultados de uma implementação real.

O portal guarda nomes, contactos, descrições dos pedidos e um histórico de alterações. Depende da identidade, do código da aplicação, de um repositório de dados e dos mecanismos de recuperação. Este âmbito reduzido permite tornar as três preocupações concretas, sem tentar analisar toda a organização de uma só vez.

Antes de discutir controlos, identifique a informação que o serviço guarda e os percursos que ela segue. As [orientações de classificação de dados da Microsoft](https://learn.microsoft.com/en-us/azure/well-architected/security/data-classification) explicam por que motivo a sensibilidade e os requisitos da organização devem influenciar a proteção. Neste exercício, utilize o esquema de classificação da sua organização. Criar uma nova etiqueta apenas para a aplicação deixaria a restante equipa sem saber exatamente o que significa.

## Confidencialidade: quem deve poder ler a informação?

Imagine que um cliente abre o pedido de outro cliente. O serviço pode continuar a devolver uma resposta com sucesso, mas a informação chegou à pessoa errada.

A pergunta útil para a análise é concreta: um cliente consegue ler apenas os pedidos que está autorizado a consultar? Acompanhe o pedido desde o início de sessão até à decisão de acesso ao registo individual. A existência de uma conta válida não responde, por si só, a essa segunda questão.

Para o portal fictício, um teste sugerido utilizaria duas contas de cliente sintéticas e pedidos sintéticos separados, num ambiente de testes autorizado. O resultado esperado é que cada conta consiga ler os registos que lhe são permitidos e não consiga ler os da outra conta. Trata-se de uma verificação proposta, não de um teste realizado para este artigo. Evite utilizar dados reais de clientes para demonstrar o problema.

Considere também o acesso dos colaboradores, as exportações e os processos de suporte. Restringir a interface dos clientes deixaria uma lacuna se uma função de colaborador sem essa necessidade pudesse descarregar os mesmos registos através de uma função administrativa.

## Integridade: podemos confiar no que o registo diz?

Considere agora uma falha diferente. Um pedido indica que o cliente aprovou uma alteração, mas alguém modificou esse estado sem autorização. Não foi necessário retirar informação do portal para que o registo deixasse de ser fiável.

Na análise, distinga a permissão para ler um registo da permissão para o alterar. Depois, pergunte como é associada uma alteração aprovada à identidade que a realizou. Um histórico de atividade pode apoiar uma investigação, mas a existência de registos de atividade não prova que todas as ações necessárias foram autorizadas, nem que esses registos estão devidamente protegidos.

Um pedido prático de evidência consiste em acompanhar uma atualização permitida com dados sintéticos: quem a solicitou, que função a permitiu, o que mudou e como encontrar o evento posteriormente. Acrescente uma tentativa equivalente por uma função que não deva poder realizar essa atualização. Acorde os resultados esperados antes de executar qualquer uma das verificações.

Existe também uma questão de recuperação. Restaurar uma cópia antiga de um pedido pode eliminar uma alteração não autorizada, mas também pode eliminar alterações legítimas feitas depois dessa cópia. A equipa precisa de compreender o que está a restaurar e como decide se a informação recuperada é fiável.

## Disponibilidade: o serviço consegue regressar em segurança?

A terceira falha é mais fácil de observar: o portal está indisponível quando os clientes precisam dele. Ainda assim, «a página abre» é uma definição limitada de recuperação. Um cliente consegue iniciar sessão, ler o pedido certo e submeter uma atualização válida? Os colaboradores conseguem processá-la depois?

No portal fictício, um exercício de recuperação deve definir esse resultado utilizável antes de escolher os passos técnicos. Uma cópia de segurança da base de dados, por si só, não descreve como vão trabalhar em conjunto o alojamento da aplicação, as dependências de identidade e as pessoas responsáveis pela recuperação.

Os controlos de segurança também fazem parte desta discussão. As [orientações da Microsoft sobre compromissos de segurança](https://learn.microsoft.com/en-us/azure/well-architected/security/tradeoffs) descrevem como novas dependências, complexidade de configuração e acesso durante a recuperação podem afetar a fiabilidade. A resposta é incluir essas dependências no desenho da solução e no exercício de recuperação. Desativar um controlo durante um incidente, sem um processo de decisão acordado, introduz outra incerteza quando a equipa já está sob pressão.

## Coloque as três perguntas na mesma folha de análise

Utilize a tabela seguinte como exemplo de trabalho. A coluna de evidência descreve o que recolheria; não afirma que estas verificações foram concluídas com sucesso.

| Preocupação | Pergunta sobre o portal | Evidência sugerida |
|---|---|---|
| Confidencialidade | Um cliente consegue ler o pedido de outro cliente? | Verificações autorizadas com contas sintéticas e o desenho do acesso aos registos |
| Integridade | Uma função de colaborador inadequada consegue alterar um estado de aprovação? | Verificações de atualizações permitidas e recusadas, com os eventos de auditoria associados |
| Disponibilidade | A equipa consegue restabelecer um serviço utilizável com registos fiáveis? | Registo de um exercício de recuperação que abranja dependências da aplicação e verificações de negócio |

Atribua um responsável a cada pergunta sem resposta. A equipa da aplicação pode investigar o acesso aos registos, um responsável pelos dados pode definir os destinatários previstos e as operações podem coordenar a recuperação. Registe as responsabilidades reais do seu serviço, em vez de assumir que estes exemplos se aplicam a todas as equipas.

Escolha depois uma preocupação para investigar primeiro. Explique por que motivo é importante para este serviço, que evidência falta e quando a equipa irá analisar o assunto. Uma preocupação pode continuar em aberto enquanto a evidência é recolhida; uma caixa por preencher é mais útil do que uma resposta confiante que ninguém consegue fundamentar.

Nas minhas fases de trabalho, este exercício enquadra-se sobretudo em **Avaliar** e alimenta **Planear**. Também nos diz o que a proteção, a deteção, a resposta e a recuperação têm de demonstrar. Estas atividades sobrepõem-se, como discutimos no Episódio 1.

Antes do próximo artigo, acrescente as três perguntas ao serviço que escolheu. **Na próxima sexta-feira, vamos distinguir autenticação de autorização** e acompanhar a decisão de acesso, desde a identificação de um utilizador até à permissão para executar uma ação num recurso específico.

Até à próxima,  
**Marcos Nogueira**  
[Ligue-se a mim no LinkedIn](https://www.linkedin.com/in/mdnoga/)
