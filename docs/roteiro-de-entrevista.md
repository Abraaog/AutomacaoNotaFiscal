# Roteiro de Entrevista

> 🗓️ **Etapa 01** · Prazo: 15/10/2026

Perguntas e tópicos abordados na entrevista de elicitação de requisitos com a cliente.

**Cliente:** Rita Mendes, proprietária da Rota Motos (cliente fictícia; entrevista simulada pela equipe) · **Data:** 15/10/2026

**Equipe:** Abraão Gomes da Silva Araújo; Ednaldo Guilherme Lima Cordeiro; Kayk Thierry Araujo Silva

## Roteiro de Entrevista (perguntas)

1. Como funciona hoje uma venda na loja, desde o cliente escolher a moto até a nota fiscal sair?
2. Quais partes desse processo mais dão problema ou tomam tempo?
3. Como vocês controlam o estoque hoje? Já aconteceu de vender uma moto que não estava mais disponível?
4. Quem vai usar o sistema? Todos devem ter o mesmo acesso ou algumas funções ficam só com a gerência?
5. Prefere um sistema instalado em um computador da loja ou um sistema web, acessível de qualquer lugar?
6. Que dados de cada moto precisam ser cadastrados? Como cada moto é identificada?
7. Que dados do comprador são necessários? Vocês vendem também para empresas (CNPJ)?
8. Já aconteceu de a mesma venda gerar duas notas? Como vocês descobriram e resolveram?
9. Quando uma nota é recusada, como o vendedor fica sabendo do motivo? E como sabe se a nota foi enviada, aceita ou precisa ser refeita?
10. Como o imposto da venda é calculado hoje? Gostaria de comparar formas diferentes de cálculo antes de escolher uma?
11. Em que situações uma nota precisa ser cancelada? Quem pode cancelar e em quanto tempo?
12. Quando o serviço que recebe a nota está fora do ar, o que vocês fazem hoje?
13. Que informações gostaria de acompanhar em um painel ou relatório?
14. O contador externo precisa acessar o sistema? O que ele faz com as notas no fim do mês?
15. Como o projeto é acadêmico, a emissão será simulada, sem valor fiscal e sem acesso à SEFAZ. Isso atende ao que a senhora precisa ver na demonstração?

## Resumo da entrevista

Discussão sobre o processo atual de venda e emissão de notas da Rota Motos, que usa uma planilha para o estoque e um programa separado para a nota, com definição do escopo do novo sistema: gestão de venda de motos ligada à emissão simulada do documento fiscal.

- **Problemas no processo atual:** estoque em planilha desatualizada (duas vendas da mesma moto), redigitação dos dados da moto na nota, chassi digitado errado causando rejeição, nota duplicada por clique repetido e nenhuma visibilidade da situação da nota.
- **Requisitos definidos:** sistema web; perfis Vendedor, Gerente e Contador (somente leitura); cadastro de motos por chassi e de clientes por CPF ou CNPJ; a venda confirmada gera o documento automaticamente; estados de processamento visíveis; bloqueio de documento duplicado.
- **Cálculo e controle:** imposto calculado pelo sistema, com duas políticas didáticas para comparação; cancelamento só pela gerente, com prazo e justificativa; painel mensal de vendas e documentos.
- **Escopo acadêmico:** emissão simulada, sem valor fiscal, com um autorizador simulado que responde sucesso, rejeição ou indisponibilidade.

## Decisões / próximas ações da equipe

- Substituir a planilha por um estoque com situação da moto (Disponível, Reservada, Vendida).
- Gerar o documento a partir da venda confirmada, sem redigitação.
- Validar o chassi e o documento do cliente antes do envio.
- Usar o código da venda como chave para impedir emissão duplicada.
- Exibir os estados do documento (Rascunho, Processando, Autorizado, Rejeitado, Pendente, Cancelado) e o motivo de cada rejeição.
- Criar a política de imposto variável: alíquota única (variante A) ou por cilindrada (variante B), configurável pela gerente.
- Definir o contrato de integração com o Autorizador Simulado (sucesso, rejeição e indisponível, com reenvio automático).
- Restringir o cancelamento à gerente, em até 24 horas e com justificativa, devolvendo a moto ao estoque.
- Criar o painel mensal com vendas, documentos por estado e total de imposto.
- Dar ao contador acesso somente de leitura, com download dos documentos do mês em um único arquivo.

## Transcrição (principais trechos)

Transcrição editada de entrevista simulada pela equipe, com a cliente fictícia do projeto.

**Abraão:** Para começar, como funciona hoje uma venda aqui na loja, do cliente escolher a moto até a nota sair?

**Rita:** O cliente escolhe a moto, o vendedor olha na planilha se ela ainda está disponível, anota a venda num papel e depois vai no programa da nota e digita tudo de novo: chassi, modelo, cor, valor. É muito trabalho repetido.

**Abraão:** E quais partes mais dão problema?

**Rita:** A planilha. Já vendemos a mesma moto para duas pessoas porque alguém não atualizou a tempo. E o chassi tem muitos caracteres; quando o vendedor erra um, a nota volta recusada.

**Ednaldo:** Quem vai usar o sistema? Todo mundo com o mesmo acesso?

**Rita:** São três vendedores e uma gerente. Os vendedores vendem e acompanham as notas. Cadastrar moto, cancelar nota e mexer em configuração, só a gerente.

**Ednaldo:** Prefere um sistema instalado num computador da loja ou um site?

**Rita:** Site. Às vezes a gerente precisa olhar alguma coisa de casa.

**Kayk:** Já aconteceu de a mesma venda gerar duas notas?

**Rita:** Já. O programa demorou, o vendedor achou que tinha travado e clicou de novo. Saíram duas notas e o contador teve que resolver depois.

**Kayk:** E quando a nota é recusada, o vendedor sabe o motivo?

**Rita:** Quase nunca. Ele também não sabe se a nota foi enviada, se foi aceita ou se precisa refazer. Fica perguntando para a gerente.

**Ednaldo:** Como o imposto da venda é calculado hoje?

**Rita:** A gerente calcula à mão. A gente queria comparar jeitos diferentes de calcular, uma taxa única ou uma taxa que muda pela cilindrada, antes de padronizar.

**Abraão:** Em que situações uma nota precisa ser cancelada?

**Rita:** Quando o cliente desiste logo depois da compra. Só a gerente deve cancelar, no mesmo dia ou no dia seguinte, e explicando o motivo. Aí a moto tem que voltar para o estoque.

**Kayk:** E quando o serviço da nota está fora do ar?

**Rita:** O vendedor fica tentando de novo até funcionar. Seria bom o sistema tentar sozinho e avisar se não der.

**Ednaldo:** Que informações gostaria de ver num painel?

**Rita:** As vendas do mês, quantas notas estão em cada situação e quanto deu de imposto.

**Kayk:** E o contador externo, precisa entrar no sistema?

**Rita:** Precisa, mas só para ver. Todo fim de mês ele pede as notas, e hoje a gente manda uma por uma por e-mail. Se ele pudesse baixar tudo de uma vez, com um resumo, seria ótimo.

**Abraão:** Por fim: como é um projeto da faculdade, a emissão vai ser simulada, sem valor fiscal e sem ligar na SEFAZ. Isso atende?

**Rita:** Atende. O que eu quero ver é o processo funcionando: a venda gerando a nota, as situações mudando e o sistema impedindo nota repetida.

*Encerramento: a equipe agradeceu a participação da cliente e finalizou a entrevista.*
