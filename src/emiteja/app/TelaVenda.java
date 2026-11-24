package emiteja.app;

import emiteja.modelo.AliquotaUnica;
import emiteja.modelo.Cliente;
import emiteja.modelo.DocumentoFiscal;
import emiteja.modelo.Moto;
import emiteja.modelo.PoliticaImposto;
import emiteja.modelo.PorCilindrada;
import emiteja.modelo.Usuario;
import emiteja.servico.Loja;
import emiteja.singleton.PainelDocumentos;

import javax.swing.JOptionPane;
import java.util.List;

public class TelaVenda {

    private static final String TITULO = "EmiteJá";
    private static final String[] PAGAMENTOS = {"PIX", "Cartão", "Boleto", "Financiamento"};
    private static final String[] CENARIOS = {"Sucesso", "Rejeição", "Indisponível"};

    private final Loja loja;
    private final List<Usuario> usuarios;
    private Usuario usuarioAtual;

    public TelaVenda(Loja loja, List<Usuario> usuarios) {
        if (usuarios == null || usuarios.isEmpty()) {
            throw new IllegalArgumentException("Cadastre ao menos um usuário");
        }
        this.loja = loja;
        this.usuarios = List.copyOf(usuarios);
        this.usuarioAtual = this.usuarios.get(0);
    }

    public void abrir() {
        int opcao;
        do {
            opcao = lerOpcaoDoMenu();
            try {
                executar(opcao);
            } catch (IllegalArgumentException | IllegalStateException e) {
                mostrarErro(e.getMessage());
            }
        } while (opcao != 0);
    }

    private int lerOpcaoDoMenu() {
        String valor = JOptionPane.showInputDialog(null, montarMenu(), TITULO, JOptionPane.QUESTION_MESSAGE);
        if (valor == null) {
            return 0;
        }
        try {
            return Integer.parseInt(valor.trim());
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    private String montarMenu() {
        return "Usuário: " + usuarioAtual + "   |   Autorizador: " + loja.getCenarioAutorizador()
                + "\nImposto: " + loja.getPoliticaAtiva()
                + "\nMotos disponíveis: " + loja.getMotosDisponiveis()
                + "\n\n1 - Ver estoque"
                + "\n2 - Cadastrar moto"
                + "\n3 - Registrar venda"
                + "\n4 - Ver documentos"
                + "\n5 - Reenviar pendentes"
                + "\n6 - Cancelar documento"
                + "\n7 - Trocar cenário do autorizador"
                + "\n8 - Trocar usuário"
                + "\n9 - Trocar política de imposto"
                + "\n10 - Painel de documentos"
                + "\n0 - Sair";
    }

    private void executar(int opcao) {
        switch (opcao) {
            case 1 -> mostrar(listarEstoque());
            case 2 -> cadastrarMoto();
            case 3 -> registrarVenda();
            case 4 -> mostrar(listarDocumentos());
            case 5 -> mostrar(loja.reenviarPendentes() + " documento(s) reenviado(s).\n\n" + listarDocumentos());
            case 6 -> cancelarDocumento();
            case 7 -> trocarCenario();
            case 8 -> usuarioAtual = escolher("Entrar como:", usuarios.toArray(new Usuario[0]));
            case 9 -> trocarPolitica();
            case 10 -> mostrar(PainelDocumentos.getInstancia().montarPainel());
            case 0 -> mostrar("Até logo!");
            default -> mostrarErro("Opção inválida");
        }
    }

    private void cadastrarMoto() {
        String chassi = lerTexto("Chassi (17 caracteres):");
        String marca = lerTexto("Marca:");
        String modelo = lerTexto("Modelo:");
        int cilindrada = lerInteiro("Cilindrada (cc):");
        int ano = lerInteiro("Ano:");
        String cor = lerTexto("Cor:");
        double preco = lerDouble("Preço (R$):");

        Moto moto = new Moto(chassi, marca, modelo, cilindrada, ano, cor, preco);
        loja.cadastrarMoto(moto);
        mostrar("Moto cadastrada:\n" + moto);
    }

    private void registrarVenda() {
        Moto[] disponiveis = loja.getMotos().stream().filter(Moto::estaDisponivel).toArray(Moto[]::new);
        if (disponiveis.length == 0) {
            throw new IllegalStateException("Não há motos disponíveis no estoque");
        }
        Moto moto = escolher("Escolha a moto:", disponiveis);
        Cliente cliente = new Cliente(lerTexto("Nome do cliente:"), lerTexto("CPF ou CNPJ:"),
                lerTexto("Endereço:"), lerTexto("E-mail:"));
        String pagamento = escolher("Forma de pagamento:", PAGAMENTOS);

        DocumentoFiscal documento = loja.vender(moto.getChassi(), cliente, usuarioAtual, pagamento);
        mostrar(documento.getVenda() + "\n\n" + documento);
    }

    private void cancelarDocumento() {
        DocumentoFiscal[] autorizados = loja.getDocumentos().stream()
                .filter(d -> d.getEstado().equals(DocumentoFiscal.AUTORIZADO))
                .toArray(DocumentoFiscal[]::new);
        if (autorizados.length == 0) {
            throw new IllegalStateException("Não há documentos autorizados para cancelar");
        }
        DocumentoFiscal documento = escolher("Documento a cancelar:", autorizados);
        String justificativa = lerTexto("Justificativa (mínimo de 15 caracteres):");
        loja.cancelar(documento, usuarioAtual, justificativa);
        mostrar("Documento cancelado:\n" + documento);
    }

    private void trocarCenario() {
        loja.setCenarioAutorizador(escolher("Resposta do autorizador simulado:", CENARIOS));
    }

    private void trocarPolitica() {
        PoliticaImposto[] politicas = {new AliquotaUnica(), new PorCilindrada()};
        loja.setPoliticaAtiva(escolher("Política de imposto:", politicas));
    }

    private String listarEstoque() {
        StringBuilder texto = new StringBuilder("Estoque:\n");
        for (Moto moto : loja.getMotos()) {
            texto.append("\n").append(moto);
        }
        return texto.toString();
    }

    private String listarDocumentos() {
        if (loja.getDocumentos().isEmpty()) {
            return "Nenhum documento emitido ainda.";
        }
        StringBuilder texto = new StringBuilder("Documentos:\n");
        for (DocumentoFiscal documento : loja.getDocumentos()) {
            texto.append("\n").append(documento);
        }
        return texto.toString();
    }

    private static String lerTexto(String mensagem) {
        String valor = JOptionPane.showInputDialog(null, mensagem, TITULO, JOptionPane.QUESTION_MESSAGE);
        if (valor == null) {
            throw new IllegalStateException("Operação cancelada");
        }
        return valor.trim();
    }

    private static int lerInteiro(String mensagem) {
        try {
            return Integer.parseInt(lerTexto(mensagem));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Digite um número inteiro");
        }
    }

    private static double lerDouble(String mensagem) {
        try {
            return Double.parseDouble(lerTexto(mensagem).replace(",", "."));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Digite um valor numérico, por exemplo 15990,00");
        }
    }

    private static <T> T escolher(String mensagem, T[] opcoes) {
        Object escolhido = JOptionPane.showInputDialog(null, mensagem, TITULO,
                JOptionPane.QUESTION_MESSAGE, null, opcoes, opcoes[0]);
        if (escolhido == null) {
            throw new IllegalStateException("Operação cancelada");
        }
        @SuppressWarnings("unchecked")
        T resultado = (T) escolhido;
        return resultado;
    }

    private static void mostrar(String mensagem) {
        JOptionPane.showMessageDialog(null, mensagem, TITULO, JOptionPane.INFORMATION_MESSAGE);
    }

    private static void mostrarErro(String mensagem) {
        JOptionPane.showMessageDialog(null, mensagem, TITULO, JOptionPane.ERROR_MESSAGE);
    }
}
