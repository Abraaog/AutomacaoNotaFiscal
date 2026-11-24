# Automação de Emissão de Nota Fiscal e Gestão de Venda de Motos

**UNIVERSIDADE FEDERAL DA PARAÍBA**
**CENTRO DE CIÊNCIAS APLICADAS E EDUCAÇÃO**
**DEPARTAMENTO DE CIÊNCIAS EXATAS**
**ANÁLISE E PROJETO DE SISTEMAS**

## Visão Geral do Projeto

O **EmiteJá** é um sistema em Java para revendas de motos que une o controle de estoque e de vendas à emissão do documento fiscal da venda. Ao confirmar a venda de uma moto, o sistema gera o documento automaticamente, envia a um autorizador por um contrato de integração, acompanha os estados de processamento e impede que a mesma venda gere dois documentos. A autorização é **simulada**: não há emissão fiscal real nem acesso a serviços governamentais. O cálculo de imposto usa uma política variável e explicitamente didática (alíquota única ou por cilindrada).

O cliente considerado é fictício: a Rota Motos, revenda de motos novas.

## Como executar

Requisito: JDK 17 ou superior.

No Windows, sem IntelliJ, basta dar dois cliques (ou chamar no terminal):

| Script | O que faz |
|---|---|
| `rodar.bat` | abre o sistema com o menu em janelas (JOptionPane) |
| `demonstracao.bat` | roda no console o roteiro completo: venda, duplicidade, pendente, rejeição e cancelamento |
| `testar.bat` | compila e roda todos os testes (`emiteja.teste.ExecutarTestes`) |

Pelo terminal, em qualquer sistema (no Linux/macOS troque `;` por `:` no `-sourcepath`):

```bash
javac -encoding UTF-8 -d out -sourcepath "src;teste" teste/emiteja/teste/ExecutarTestes.java src/emiteja/app/Main.java src/emiteja/app/Demonstracao.java
java -cp out emiteja.app.Main               # menu em janelas (JOptionPane)
java -cp out emiteja.app.Demonstracao       # demonstração no console
java -cp out emiteja.teste.ExecutarTestes   # testes
```

Pelo IntelliJ IDEA: abra a pasta do projeto e rode `emiteja.app.Main`, `emiteja.app.Demonstracao` ou `emiteja.teste.ExecutarTestes`.

Usuários de exemplo: `sandra` (Gerente, pode cancelar), `marcos` (Vendedor) e `fabio` (Contador). A emissão é simulada: nenhum documento tem valor fiscal.

## Estrutura do código

```
src/emiteja/
├── modelo/    Moto, Cliente, Usuario, Pessoa (abstrata), Venda, DocumentoFiscal,
│              PoliticaImposto (abstrata), AliquotaUnica, PorCilindrada
├── servico/   Loja (estoque, vendas, emissão e cancelamento)
└── app/       Main, TelaVenda (JOptionPane), Demonstracao (console)

teste/emiteja/teste/
├── SuiteDeTeste     base abstrata dos testes (Java puro, sem biblioteca)
├── ExecutarTestes   roda todas as suítes; sai com código 1 se algo falhar
├── TestePessoas, TesteMoto, TesteImposto, TesteDocumentoFiscal, TesteLoja
└── Dados            motos, clientes e usuários de exemplo
```

## Testes

São 39 testes em Java puro, sem JUnit, para rodar em qualquer JDK sem configurar nada. Cada suíte herda de `SuiteDeTeste` (classe abstrata, padrão Template Method) e chama `teste("descrição", () -> { ... })` para cada caso. Cobrem as validações de CPF, CNPJ e chassi, as duas políticas de imposto, todos os estados do documento fiscal (Rascunho, Processando, Autorizado, Rejeitado, Pendente e Cancelado), a prevenção de duplicidade, o reenvio de pendentes e a permissão de cancelamento só para a gerência.

## Entregas por partes

| Parte | Conteúdo da disciplina | Onde aparece no EmiteJá |
|---|---|---|
| 1 | Classe, Construtor, Variáveis | `Moto`, `Cliente`, `Usuario` e `Venda` com atributos e construtores; o `Main` monta uma venda |
| 2 | Métodos | `reservar()`, `marcarVendida()`, `liberar()` na `Moto`; `cancelar()` na `Venda`; `enviar()` e `cancelar()` no `DocumentoFiscal` |
| 2 | Incremento e Decremento | `motosDisponiveis++`/`--` e `totalVendas++` na `Loja`; `tentativas++` e `proximoNumero++` no `DocumentoFiscal` |
| 2 | JOptionPane | `TelaVenda`: menu, cadastro, venda, cancelamento e escolhas em janelas |
| 2 | @Override | `toString()` das classes de modelo; `getIdentificacao()` e `aliquota()` nas subclasses |
| 2 | Encapsulamento | atributos `private`, getters e setters que validam (`setPreco`, `setNome`) |
| 2 | Métodos Auxiliares | `cpfValido()`, `cnpjValido()`, `digitoVerificador()` no `Cliente`; `chassiValido()` na `Moto`; `lerTexto()`, `escolher()` na tela |
| Pacotes | Pacotes | `emiteja.modelo`, `emiteja.servico` e `emiteja.app` |
| 3 | Herança, Classe Abstrata, Super | `Pessoa` (abstrata) com `Cliente` e `Usuario`; `PoliticaImposto` (abstrata) com `AliquotaUnica` e `PorCilindrada`; construtores com `super(...)` |

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
