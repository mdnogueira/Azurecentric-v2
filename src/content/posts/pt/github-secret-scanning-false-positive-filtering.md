---
title: "Análise de segredos do GitHub: reveja os novos filtros e o procedimento de rotação"
description: "Reveja as melhorias dos detetores do GitHub e a parceria com a SpaceX, distinguindo validade, ação do fornecedor e recuperação da aplicação."
pubDate: "2026-11-05T20:27:08+00:00"
language: "pt-PT"
category: "cloud-security"
tags: ["github-advanced-security", "secret-scanning", "github-secret-protection", "devsecops", "credential-security"]
translationKey: "github-secret-scanning-false-positive-filtering"
draft: false
---

Um alerta de análise de segredos precisa de um próximo passo claro: quem consegue identificar a credencial, desativá-la e confirmar que a aplicação continua a funcionar depois?

A [atualização do GitHub de 5 de novembro](https://github.blog/changelog/2026-11-05-secret-scanning-upgrades-detectors-adds-spacex-as-partner/) altera parte desse processo de deteção. Determinados detetores da Alibaba, da AWS e da Google suprimem correspondências sem par quando a filtragem por dicionário elimina todos os valores complementares elegíveis. A atualização acrescenta também a SpaceX como parceira e o detetor `starlink_public_api_v2_secret`. São bons motivos para rever em conjunto a cobertura e o procedimento de resposta.

[![Imagem original do anúncio do GitHub sobre atualizações da análise de segredos.](/images/news/github-secret-scanning-20261105.jpg)](https://github.blog/changelog/2026-11-05-secret-scanning-upgrades-detectors-adds-spacex-as-partner/)

A oportunidade prática é gastar menos esforço a investigar correspondências inadequadas, mantendo uma resposta fiável para uma credencial realmente exposta. O anúncio não demonstra que a sua equipa terá uma redução específica nos alertas ou que alguma credencial já foi revogada.

## A filtragem e a validade respondem a perguntas diferentes

Considere um repositório hipotético com dados de teste que incluem um valor com o formato de um identificador de credencial da cloud. Saber se esse texto corresponde às regras de um detetor é uma pergunta. Saber se uma credencial ainda permite a autenticação junto do fornecedor é outra.

O GitHub documenta separadamente as **verificações de validade**: para os segredos suportados, estas verificações contactam o serviço emissor e podem apresentar um estado ativo, inativo ou desconhecido. O suporte depende do tipo de segredo. [Documentação das verificações de validade](https://docs.github.com/en/code-security/concepts/secret-security/validity-checks).

Mantenha essas observações separadas durante a triagem. Uma melhoria na filtragem pode alterar as potenciais correspondências apresentadas. Isso não transforma todos os alertas restantes em credenciais ativas confirmadas, e a ausência de alertas não demonstra que o repositório não contém segredos.

Para os dados de teste hipotéticos, pergunte ao responsável pela aplicação o que representa o valor e por que motivo existe. Registe a explicação sem copiar valores de credenciais para uma tarefa de acesso generalizado. Se a origem for incerta, mantenha essa dúvida visível enquanto a equipa responsável a investiga.

Evite transformar uma atualização de um detetor numa decisão generalizada de descartar constatações antigas. Reveja a evidência para cada encerramento, incluindo se a credencial subjacente era real e o que lhe aconteceu.

## Uma notificação ao parceiro continua a precisar de um responsável pela resposta

A [documentação do programa de parceiros do GitHub](https://docs.github.com/en/code-security/tutorials/secret-scanning-partner-program) descreve o envio das correspondências encontradas em fontes públicas para um endpoint do fornecedor. O fornecedor implementa a resposta, incluindo a revogação e a notificação ao utilizador. É um percurso de resposta, não evidência de que uma credencial específica foi desativada com sucesso.

Para uma equipa que utilize as APIs da Starlink, o passo útil é identificar o responsável pela credencial e a forma de confirmar a ação do fornecedor. Que aplicação utiliza a credencial? Quem pode substituí-la? Como saberá a equipa de operações que a substituição funciona e que a credencial exposta deixou de ser utilizável?

Estas perguntas também importam quando o fornecedor atua rapidamente. Desativar uma credencial pode interromper uma integração legítima. O plano de resposta deve relacionar a decisão de segurança com a dependência da aplicação, garantindo que as pessoas certas conseguem restabelecer o funcionamento autorizado.

Mantenha a confirmação do fornecedor e a verificação da aplicação no mesmo registo de incidente. A entrega de uma notificação, a desativação de uma chave e a recuperação de um serviço são acontecimentos distintos que precisam de evidência.

## Confirme que proteção está efetivamente ativa

A análise de segredos e a proteção de envio atuam em momentos diferentes do fluxo de trabalho. O GitHub descreve a **proteção de envio** como o bloqueio de tipos de segredos suportados durante uma tentativa de envio; tem a sua própria ativação, padrões suportados e comportamento de exceção. [Orientações sobre proteção de envio](https://docs.github.com/en/code-security/concepts/secret-security/push-protection).

Para o seu repositório, registe que capacidades estão ativas e quem é responsável pelas exceções. O anúncio de um detetor, por si só, não demonstra que um envio foi bloqueado, que uma exceção foi revista ou que uma verificação de CI foi executada. Utilize a configuração e os eventos reais para explicar o controlo à restante equipa.

Nos repositórios privados e internos pertencentes a organizações em GitHub.com, confirme os requisitos do GitHub Team ou Enterprise Cloud e se o **GitHub Secret Protection** está ativo. [Disponibilidade](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning). A proteção de repositórios privados envolve licenciamento pago baseado em contribuidores ativos que efetuam commits, pelo que deve confirmar o âmbito dos repositórios e dos contribuidores antes de alargar a cobertura. [Licenciamento e faturação](https://docs.github.com/en/billing/concepts/product-billing/github-advanced-security).

## Dê ao procedimento uma lista de evidência útil

A tabela seguinte é uma ferramenta de revisão sugerida. Não foi aplicada a um repositório ou a uma conta de fornecedor para este artigo.

| Ponto de revisão | Evidência a recolher | Responsável a identificar |
|---|---|---|
| Compreender a constatação | Detetor, repositório afetado e explicação da finalidade da credencial | Responsável pela aplicação ou pela credencial |
| Estabelecer a exposição e o estado | Localizações relevantes, informação de validade disponível e dúvidas por resolver | Responsável pela investigação de segurança |
| Desativar ou substituir a credencial | Confirmação do fornecedor e plano de substituição acordado | Pessoa autorizada a gerir a credencial |
| Verificar o serviço dependente | Uma operação legítima da aplicação com a substituição aprovada | Responsável pela aplicação ou pelas operações |
| Encerrar a resposta | Resultado registado, exposição restante e trabalho de seguimento | Coordenador do incidente |

Para uma carga de trabalho do Azure que utilize credenciais armazenadas, as [orientações da Microsoft sobre segredos do Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/secrets/secure-secrets) recomendam a rotação planeada e a atualização dos valores em cache quando os segredos mudam. Aplique essa atenção às dependências ao procedimento de resposta. Guardar um valor novo num cofre e confirmar que o emissor desativou uma credencial exposta são verificações separadas.

Comece por uma integração cujo responsável pela credencial seja conhecido. Percorra a tabela com essa pessoa, identifique a evidência em falta e acorde quem atuaria perante uma exposição. Uma filtragem melhor ajuda a equipa a encontrar trabalho útil; uma resposta clara e verificável permite concluí-lo.

Até à próxima,  
**Marcos Nogueira**  
[Ligue-se a mim no LinkedIn](https://www.linkedin.com/in/mdnoga/)
