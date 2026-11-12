---
title: "Gestão de identidades e acessos: acompanhar o acesso até à remoção"
description: "Acompanhe entradas, mudanças e saídas com um registo de acesso: âmbito das funções, sessões das aplicações, licenciamento e uma ficha de verificação sugerida."
pubDate: "2026-11-20T11:00:00-05:00"
language: "pt-PT"
category: "identity-access"
tags: ["cybersecurity", "identity-access", "microsoft-entra-id", "rbac", "identity-governance"]
translationKey: "cybersecurity-in-practice-04-identity-access-lifecycle"
draft: false
---

*Episódio 4 da série Cibersegurança na Prática*

[Ver a série](/pt/series/cybersecurity-in-practice)

Uma decisão de acesso precisa de um responsável e de uma condição de término. Criar uma conta e atribuir um grupo permite começar a trabalhar; manter esse acesso adequado à medida que o trabalho da pessoa muda é a responsabilidade a longo prazo.

O Episódio 3 seguiu a autenticação e a autorização através de um portal de clientes fictício. Esta semana, vamos seguir as pessoas que suportam esse portal: um novo analista, um analista que muda para outro cargo e um colega que sai. Os nomes, as regras de acesso e a ficha são ilustrativos. Nenhuma conta foi criada, as permissões não foram alteradas nem foram realizados testes de revogação.

![Um ciclo de vida de acesso sugerido para uma equipa de suporte a um portal fictício: entrar com acesso mínimo aprovado, mover-se removendo acesso obsoleto e concedendo novo acesso justificado, sair removendo acesso e verificando sessões de aplicação. A responsabilidade e a evidência abrangem todas as etapas.](/images/series/cybersecurity-in-practice/episode-04-access-lifecycle.pt.svg)

## Dê a cada via de acesso um objetivo de negócio

Os [fundamentos de identidade](https://learn.microsoft.com/en-us/entra/fundamentals/identity-fundamental-concepts) da Microsoft fornecem o vocabulário para identidades, autenticação e acesso. Para uma revisão prática, comece com uma identidade, um recurso e uma ação específicos. “Acesso ao portal” é demasiado genérico para explicar se um analista pode ler um pedido, exportar registos de clientes ou alterar a configuração da aplicação.

Considere um perfil de suporte proposto. O analista precisa de ler os pedidos atribuídos e atualizar o respetivo estado de suporte. Exportar os dados de todos os clientes ou administrar a subscrição do Azure está fora desse perfil proposto. O proprietário da aplicação deve confirmar essas regras; um nome de grupo conveniente não as torna verdadeiras.

Registe como o acesso é concedido. O portal pode usar uma função de aplicação mapeada a partir de um grupo. A plataforma de alojamento pode usar o RBAC do Azure. A [visão geral do RBAC do Azure](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview) explica uma atribuição de função como uma entidade de segurança, uma definição de função e um âmbito; as atribuições herdadas de âmbitos mais amplos também podem ser relevantes. Uma função de diretório Entra, uma função de recurso Azure e uma regra de autorização própria do portal são responsabilidades diferentes. Uma aplicação pode ainda necessitar das suas próprias verificações ao nível dos registos após o início de sessão do utilizador.

| Identidade ou via | Necessidade proposta | Responsável e evidência para estabelecer |
| --- | --- | --- |
| Analista de suporte | Ler pedidos atribuídos e atualizar estado de suporte | O proprietário da aplicação confirma as operações e os casos permitidos/negados. |
| Administrador da plataforma | Realizar uma alteração de alojamento aprovada | O proprietário da plataforma identifica a função Azure, o âmbito e a autoridade de alteração. |
| Identidade de carga de trabalho do portal | Aceder a um recurso a jusante necessário | O proprietário da carga de trabalho regista as permissões e o ciclo de vida independente da aplicação. |
| Colaborador externo | Concluir uma tarefa de suporte limitada | O patrocinador regista o propósito, a expiração e como a remoção é verificada. |

A linha da carga de trabalho é importante porque remover o acesso de uma pessoa não responde automaticamente ao que a identidade da aplicação pode fazer. Mantenha o acesso humano, as permissões da aplicação e quaisquer contas de aplicação geridas diretamente no inventário.

## Siga entradas, mudanças e saídas através do mesmo registo

As [orientações do ciclo de vida dos colaboradores](https://learn.microsoft.com/en-us/entra/architecture/governance-deployment-employee-lifecycle) da Microsoft distinguem a entrada, a mudança e a saída. Utilize esses eventos para perguntar quem autoriza o acesso, quais as alterações e como o resultado se torna visível.

Para uma **entrada**, obtenha a função profissional aprovada e a data de início. Identifique o sinal fidedigno de vínculo profissional ou patrocínio, em seguida, conceda o acesso acordado através da via pretendida. Verifique que a pessoa consegue realizar a tarefa necessária e não consegue realizar uma tarefa fora desse cargo. A criação bem-sucedida da conta, por si só, não demonstra nenhum dos resultados.

Para uma **mudança**, compare explicitamente as responsabilidades antigas e novas. Suponha que o nosso analista muda de suporte para relatórios. Adicionar um grupo de relatórios, deixando as permissões de suporte antigas ativas, cria um problema de acumulação. Liste o que deve ser removido, bem como o que deve ser adicionado, incluindo atribuições de aplicação diretas e acesso herdado através de outros grupos ou âmbitos. Uma exceção temporária de transição deve ter um aprovador nomeado, uma data de fim e uma ação de acompanhamento.

Para uma **saída**, acorde a hora efetiva, o sistema responsável pelo sinal e as equipas responsáveis por cada via de acesso. Considere identidades na cloud e on-premises, acesso local à aplicação, acesso delegado e sessões ativas. Reatribua a propriedade operacional de aplicações ou tarefas agendadas, se necessário; não preserve o início de sessão desnecessário de um colaborador simplesmente porque um serviço não tem um proprietário substituto.

## Verifique a remoção no limite da aplicação

As [orientações de revogação de acesso](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access) da Microsoft explicam que a revogação pode demorar e que uma aplicação controla o seu próprio token de sessão. O Entra ID não pode invalidar diretamente um cookie de sessão emitido por outra aplicação. Bloquear uma conta ou revogar tokens de atualização não é, portanto, prova de que todas as sessões de aplicação existentes terminaram.

O proprietário do portal deve definir o que invalida as suas sessões e quando as suas permissões são reavaliadas. Inclua uma sessão de navegador ainda aberta num plano de teste autorizado, em vez de verificar apenas se um novo início de sessão falha. Diferentes aplicações e protocolos podem comportar-se de forma diferente. Este artigo não fornece um prazo universal de revogação e não recomenda ações destrutivas na conta como um exercício casual.

Um registo de remoção útil identifica a alteração solicitada, a sua hora efetiva, a evidência de conclusão de cada sistema e a incerteza restante. Se uma aplicação não puder fornecer evidência, nomeie essa lacuna e o seu proprietário. Uma tarefa de workflow bem-sucedida é evidência útil sobre a tarefa; não é automaticamente uma evidência sobre todo o acesso a jusante.

## Automatize um processo definido, com as permissões e a licença adequadas

O [Entra ID Governance](https://learn.microsoft.com/en-us/entra/id-governance/identity-governance-overview) oferece capacidades para ciclos de vida de identidade e acesso, incluindo provisionamento, gestão de direitos e revisões de acesso. Estas resolvem problemas relacionados, mas não são equivalentes: criar uma conta, atribuir acesso e decidir periodicamente se este continua justificado são resultados separados.

Os [Lifecycle Workflows](https://learn.microsoft.com/en-us/entra/id-governance/understanding-lifecycle-workflows) adicionam tarefas e condições de execução em torno de eventos de ciclo de vida. O provisionamento orientado pelos RH lida com a criação de contas e atualizações de atributos; um lifecycle workflow adiciona automatização em torno desse processo. Acorde atributos fiáveis, âmbito e datas efetivas antes da automatização. Um sinal de origem errado pode, caso contrário, repetir uma decisão errada de forma consistente.

Para um piloto autorizado, a [experiência de criação](https://learn.microsoft.com/en-us/entra/id-governance/create-lifecycle-workflow) documentada começa no centro de administração do Entra em **ID Governance → Lifecycle workflows**. Um Lifecycle Workflows Administrator pode criar a partir de um modelo ou clonar um workflow existente. Reveja os utilizadores selecionados, o acionador, as tarefas e o horário antes de ativar a execução. Esta é uma referência de implementação, não um registo de um workflow implementado para este artigo.

Verifique a [matriz de licenciamento de Governance](https://learn.microsoft.com/en-us/entra/id-governance/licensing-fundamentals) atual. Os Lifecycle Workflows requerem um direito de utilização de Governance ou Suite aplicável, com pré-requisitos de licenciamento; o P2, por si só, não o inclui. As funcionalidades de revisão de acesso e de acesso privilegiado têm as suas próprias regras de licenciamento. Uma revisão manual documentada pode ser um processo inicial útil, mas não confere direitos de produtos premium. Valide quem precisa de licenciamento e quaisquer serviços adicionais antes de aprovar os custos de automatização.

## Complete um ciclo de vida de acesso antes de o expandir

Escolha uma função profissional e uma aplicação para uma revisão sugerida. Utilize identidades sintéticas apenas num ambiente de teste aprovado, com a permissão do proprietário da aplicação e um plano de recuperação. Prepare os resultados esperados antes de realizar quaisquer alterações.

| Evento | Resultado esperado a definir | Evidência a reter |
| --- | --- | --- |
| Entrada | A tarefa necessária funciona; uma tarefa privilegiada não relacionada é recusada. | Aprovação, via de atribuição, âmbito efetivo e ambos os resultados. |
| Mudança | A nova tarefa funciona; o acesso obsoleto termina ou tem uma exceção limitada. | Direitos antes/depois, resultado da remoção e expiração da exceção. |
| Saída | O acesso é removido através de cada via; o comportamento da sessão é compreendido. | Registos de conclusão de identidade e aplicação, tempos e lacunas não resolvidas. |

No modelo de trabalho utilizado ao longo desta série, Avaliar, Planear, Proteger, Detetar, Responder e Recuperar são atividades sobrepostas baseadas na experiência de Marcos, com governação e aprendizagem em todas elas. Não são nomes oficiais das fases do SAF da Microsoft. Um ciclo de vida de acesso atravessa essas atividades: uma remoção falhada pode expor uma lacuna de planeamento, uma lacuna de proteção e uma necessidade de deteção ao mesmo tempo.

Até à próxima sexta-feira, procure ter um registo de acesso que outro proprietário possa seguir desde a aprovação até à remoção. Esse registo é a base para uma automatização e revisão úteis. O resultado prático é saber por que razão o acesso existe, quem é responsável por alterá-lo e o que demonstraria que a alteração teve efeito.

Até à próxima,  
**Marcos Nogueira**  
[Ligue-se a mim no LinkedIn](https://www.linkedin.com/in/mdnoga/)
