---
title: "Autenticação e autorização: siga a decisão para lá do início de sessão"
description: "Siga uma decisão de acesso num portal de clientes: início de sessão, permissões sobre registos, identidade da API e Azure RBAC, com casos permitidos e recusados."
pubDate: "2026-11-13T11:00:00-05:00"
language: "pt-PT"
category: "identity-access"
tags: ["cybersecurity", "authentication", "authorization", "microsoft-entra-id", "rbac"]
translationKey: "cybersecurity-in-practice-03-authentication-vs-authorization"
draft: false
---

*Episódio 3 da série Cibersegurança na Prática*

[Consultar a série](/pt/series/cybersecurity-in-practice)

O cliente inicia sessão, conclui a MFA e abre o portal. Isso dá-lhe informação útil sobre o início de sessão. Continua a ser necessário confirmar se esse cliente pode consultar um pedido específico, alterar o respetivo estado ou descarregar um anexo.

A autenticação e a autorização respondem a perguntas diferentes. A autenticação verifica uma identidade declarada; a autorização determina que ações essa identidade pode realizar. A Microsoft estabelece esta distinção nas suas [orientações sobre a plataforma de identidades](https://learn.microsoft.com/en-us/entra/identity-platform/authentication-vs-authorization).

No Episódio 2, utilizámos a confidencialidade, a integridade e a disponibilidade para analisar um portal de clientes fictício. Esta semana, vamos acompanhar uma decisão de acesso nesse mesmo portal. As contas, os registos e os resultados esperados abaixo são ilustrativos; não são constatações de uma implementação real.

![Um cliente fictício passa pela autenticação e o portal verifica depois, separadamente, a permissão para um pedido e uma operação específicos. O início de sessão bem-sucedido não dispensa a decisão de autorização.](/images/series/cybersecurity-in-practice/episode-03-access-decision.pt.svg)

## Acompanhe a decisão até ao registo individual

Suponha que o pedido A pertence ao Cliente A e o pedido B ao Cliente B. Ambos são utilizadores legítimos. Ambos devem conseguir iniciar sessão. A regra proposta para o portal é que cada cliente pode consultar o seu próprio pedido e não pode consultar o pedido do outro cliente.

A verificação interessante surge depois do início de sessão. Se o Cliente A alterar o identificador do pedido num endereço ou numa chamada à API, o que impede o portal de devolver o pedido B? Esconder uma ligação na interface deixa essa pergunta sem resposta. O serviço que processa o pedido tem de aplicar a regra de acesso antes de devolver a informação protegida.

As [orientações da Microsoft sobre autorização baseada em recursos](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based?view=aspnetcore-10.0) demonstram a avaliação de um utilizador em relação a um recurso e a uma política específicos. Explicam também por que motivo um atributo que exige apenas um utilizador autenticado é insuficiente para essa decisão sobre o recurso. A implementação depende da framework da aplicação; a pergunta da revisão mantém-se: onde é verificada a permissão desta identidade para este registo?

Identifique sempre a operação. A permissão para consultar um pedido não implica automaticamente permissão para o aprovar, eliminar ou exportar os seus anexos. No nosso portal fictício, defina um resultado esperado separado para cada operação relevante para o negócio.

## Saiba que identidade faz a chamada seguinte

O portal pode chamar outra API depois de o cliente iniciar sessão. Isso introduz outra decisão de acesso e, potencialmente, outra identidade.

A Microsoft distingue o **acesso delegado**, em que uma aplicação atua em nome de um utilizador com sessão iniciada, do **acesso apenas da aplicação**, em que a aplicação atua sem um utilizador com sessão iniciada. As permissões delegadas e as permissões de aplicação servem esses cenários diferentes. [Descrição geral das permissões e do consentimento](https://learn.microsoft.com/en-us/entra/identity-platform/permissions-consent-overview).

Para a revisão do portal, acrescente essa chamada ao mapa de dependências. A API que a recebe vê o contexto delegado do cliente ou a identidade da aplicação do portal? Quem é responsável por limitar que registo de cliente pode ser pedido? Não assuma que a restrição ao cliente se mantém automaticamente só porque o primeiro ecrã exigia o início de sessão.

Um token também precisa de ser interpretado corretamente pela API que o recebe. As [orientações da Microsoft sobre validação de declarações](https://learn.microsoft.com/en-us/entra/identity-platform/claims-validation) exigem verificar o destinatário previsto, o inquilino, o sujeito e a aplicação que faz a chamada. A presença de um token é insuficiente como evidência de permissão. Utilize a abordagem de validação suportada para a aplicação, em vez de considerar que descodificar um token conclui a verificação de segurança.

Para o exercício, recolha a configuração e a explicação da equipa da aplicação sobre essa fronteira. Não precisa de copiar tokens em utilização para uma tarefa para a descrever.

## Uma função do Azure responde a uma pergunta de acesso específica

A mesma distinção importa quando alguém diz que consegue ver um recurso do Azure, mas não consegue aceder aos seus dados.

Uma atribuição de função no Azure RBAC combina uma **entidade de segurança, uma definição de função e um âmbito**. Concede permissões para as ações e os recursos abrangidos por essa atribuição. [Descrição geral do Azure RBAC](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview).

No Blob Storage, a Microsoft documenta que o acesso aos dados através do portal do Azure com credenciais do Microsoft Entra exige uma função de dados adequada e, no mínimo, acesso de Leitor do Azure Resource Manager. Ver a conta de armazenamento e consultar os respetivos blobs são, por isso, perguntas diferentes. [Requisitos de acesso aos dados de blobs](https://learn.microsoft.com/en-us/azure/storage/blobs/assign-azure-role-data-access).

Ao investigar essa situação, registe a operação, a identidade, o método de acesso e o âmbito antes de propor uma alteração de função. Uma sessão no portal, uma chamada da aplicação e um processo em segundo plano podem utilizar identidades ou credenciais diferentes. Acrescentar uma função abrangente antes de confirmar esses factos torna o desenho do acesso mais difícil de explicar depois.

No nosso portal, separe a decisão de acesso do cliente ao registo da permissão da aplicação para o armazenamento. A aplicação ter permissão para consultar um contentor não define que cliente deve receber um determinado anexo.

## Registe os casos permitidos e recusados em conjunto

Utilize a tabela sugerida abaixo num ambiente de testes autorizado, com contas e registos sintéticos. Acorde os resultados esperados com o responsável pelo serviço antes de executar as verificações. Estas verificações não foram realizadas para este artigo.

| Cenário | Resultado esperado proposto | Evidência a recolher |
|---|---|---|
| O Cliente A consulta o pedido A | Permitir segundo a regra de titularidade acordada | Identificador do pedido, identidade relevante e decisão no servidor |
| O Cliente A tenta consultar o pedido B | Recusar sem devolver o conteúdo protegido de B | Comportamento da recusa e regra avaliada |
| O Cliente A tenta uma aprovação reservada aos colaboradores | Recusar mesmo após um início de sessão bem-sucedido | Política ao nível da operação e decisão tomada |
| Uma função de colaborador autorizada executa uma ação atribuída | Permitir apenas dentro das responsabilidades acordadas | Função, âmbito do recurso e evento de auditoria associado |

Os casos bem-sucedidos importam tanto como os casos recusados. Um controlo que bloqueie todos os pedidos pode parecer restritivo enquanto impede o serviço de cumprir a sua função. A verificação precisa de demonstrar que o trabalho pretendido continua a funcionar dentro dos limites acordados.

Mantenha distintas, nas notas de revisão, a evidência de autenticação e a de autorização. Um evento de início de sessão pode ajudar a estabelecer o contexto da identidade. A decisão da aplicação e o respetivo registo de auditoria são necessários para perceber por que motivo uma operação sobre um registo foi permitida ou recusada. Defina quem pode investigar cada parte quando um cliente comunica um problema.

## Atribua um responsável à pergunta em aberto

No portal fictício, a equipa de identidades pode explicar a configuração do início de sessão. A equipa da aplicação pode explicar as regras sobre registos e operações. A equipa de plataforma pode explicar o acesso aos recursos subjacentes do Azure. As responsabilidades reais na sua organização podem estar distribuídas de outra forma; registe-as explicitamente.

Nas minhas fases de trabalho, isto começa em **Assess** e **Plan**, dando depois a **Protect** e **Detect** decisões concretas para aplicar e observar. As fases sobrepõem-se, com governação e aprendizagem ao longo do trabalho. São o meu modelo de trabalho prático, e não nomes oficiais de fases da Microsoft.

Antes da próxima sexta-feira, escolha uma ação permitida e uma ação recusada no mesmo serviço. Registe a identidade, o recurso, a operação, a regra e a evidência esperada. **A seguir, vamos desenvolver esta distinção com os fundamentos da gestão de identidades e acessos**, incluindo a forma como o acesso muda quando as pessoas entram, mudam de função e saem.

Até à próxima,  
**Marcos Nogueira**  
[Ligue-se a mim no LinkedIn](https://www.linkedin.com/in/mdnoga/)
