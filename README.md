# Automação de Emissão de Nota Fiscal e Gestão de Venda de Motos

**UNIVERSIDADE FEDERAL DA PARAÍBA**
**CENTRO DE CIÊNCIAS APLICADAS E EDUCAÇÃO**
**DEPARTAMENTO DE CIÊNCIAS EXATAS**
**ANÁLISE E PROJETO DE SISTEMAS**

## Visão Geral do Projeto

O **EmiteJá** é um sistema web para revendas de motos que une o controle de estoque e de vendas à emissão do documento fiscal da venda. Ao confirmar a venda de uma moto, o sistema gera o documento automaticamente, envia a um autorizador por um contrato de integração, acompanha os estados de processamento e impede que a mesma venda gere dois documentos. A autorização é **simulada**: não há emissão fiscal real nem acesso a serviços governamentais. O cálculo de imposto usa uma política variável e explicitamente didática (alíquota única ou por cilindrada).

O cliente considerado é fictício: a Rota Motos, revenda de motos novas.

## Como executar o protótipo

Requisito: [Node.js](https://nodejs.org) 22.13 ou superior (usa o SQLite embutido do Node).

```bash
npm install
npm start      # abre em http://localhost:3000
npm test       # 24 testes automatizados (domínio e emissão)
```

Na primeira execução o sistema cria o banco em `dados/emiteja.db` com motos, clientes e três vendas de exemplo. Para recomeçar do zero, apague a pasta `dados/`.

### Contas de demonstração

A senha de todas é `emiteja`. A tela de entrada também lista as contas: basta clicar no nome.

| Usuário | Perfil | O que pode fazer |
|---|---|---|
| `marcos`, `paula`, `diego` | Vendedor | Registrar vendas, cadastrar clientes, acompanhar e reenviar documentos |
| `sandra` | Gerente | Tudo do vendedor, mais cadastrar motos, cancelar documentos, trocar a política de imposto e o cenário do autorizador |
| `fabio` | Contador | Consultar documentos, ver o painel do mês e exportar o mês em JSON |

### Roteiro sugerido para a apresentação

1. Entre como `sandra`, faça uma venda em **Nova venda** e veja o documento passar de Processando para Autorizado.
2. No documento, clique em **Pedir emissão de novo**: a mesma venda não gera um segundo documento (RN01).
3. Em **Configurações**, troque o autorizador para **Rejeição** ou **Indisponível** e faça outra venda para ver os estados Rejeitado e Pendente (com reenvio automático).
4. Troque a política para a **Variante B** e compare o imposto de motos de cilindradas diferentes.
5. Cancele um documento autorizado (justificativa com 15 caracteres ou mais) e confira a moto de volta ao estoque.
6. Entre como `fabio` e exporte o mês em **Painel do mês**.

### Variáveis de ambiente (opcionais)

| Variável | Padrão | Uso |
|---|---|---|
| `PORT` | `3000` | Porta HTTP |
| `HOST` | `127.0.0.1` | Endereço de escuta; use `0.0.0.0` em hospedagem |
| `BANCO` | `dados/emiteja.db` | Caminho do arquivo SQLite |
| `SENHA_DEMO` | `emiteja` | Senha das contas de demonstração criadas no primeiro uso |
| `REENVIO_MS` | `60000` | Intervalo entre reenvios automáticos quando o autorizador está indisponível |

### Publicação

O protótipo é um servidor Node contínuo com banco em arquivo. Por isso ele funciona em serviços como Render ou Railway: comando de build `npm install`, comando de início `npm start` e `HOST=0.0.0.0`. Em hospedagem sem disco persistente, o banco volta aos dados de exemplo quando o serviço reinicia. Plataformas serverless (como a Vercel) não mantêm o arquivo do banco entre requisições e exigiriam trocar o SQLite por um banco externo.

## Documentação

- [Roteiro de Entrevista (Etapa 01)](docs/roteiro-de-entrevista.md)
- [Backlog do Produto (Etapa 02)](docs/backlog-do-produto.md)
- [Projeto Preliminar (apresentação parcial)](docs/projeto-preliminar.md)
- [Documento de Requisitos (Etapa 05)](docs/documento-de-requisitos.md)
- [Documento de Requisitos (.docx para entrega)](docs/DocumentoDeRequisitosEmiteJa.docx)

## Identificação da Equipe

- **Equipe:** Grupo 04
- **Projeto:** Automação de Emissão de Nota Fiscal e Gestão de Venda de Motos (EmiteJá)
- **Repositório:** https://github.com/Abraaog/AutomacaoNotaFiscal
- **Branch principal:** `main`

## Integrantes

| Nome completo | E-mail institucional | Usuário GitHub | Link do perfil |
|---|---|---|---|
| Abraão Gomes da Silva Araújo | abraao.silva@dcx.ufpb.br | @Abraaog | https://github.com/Abraaog |
| Ednaldo Guilherme Lima Cordeiro | ednaldo.lima@dcx.ufpb.br | @guigacod55 | https://github.com/guigacod55 |
| Kayk Thierry Araujo Silva | kayk.araujo@dcx.ufpb.br | @kaykaraujo-sys | https://github.com/kaykaraujo-sys |
