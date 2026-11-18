package emiteja.modelo;

import java.util.ArrayList;
import java.util.List;

public class DocumentoFiscal {

    public static final String RASCUNHO = "Rascunho";
    public static final String PROCESSANDO = "Processando";
    public static final String AUTORIZADO = "Autorizado";
    public static final String REJEITADO = "Rejeitado";
    public static final String PENDENTE = "Pendente";
    public static final String CANCELADO = "Cancelado";

    public static final int MAX_TENTATIVAS = 3;
    private static final int TAMANHO_MINIMO_JUSTIFICATIVA = 15;

    private static int proximoNumero = 1;

    private final int numero;
    private final Venda venda;
    private final double valorImposto;
    private final String politicaAplicada;
    private final List<String> historico = new ArrayList<>();
    private String estado;
    private String protocolo;
    private String motivoRejeicao;
    private int tentativas;

    public DocumentoFiscal(Venda venda, PoliticaImposto politica) {
        if (venda == null || politica == null) {
            throw new IllegalArgumentException("O documento precisa de uma venda e de uma política de imposto");
        }
        this.numero = proximoNumero++;
        this.venda = venda;
        this.valorImposto = politica.calcular(venda.getMoto(), venda.getValor());
        this.politicaAplicada = politica.getNome();
        this.tentativas = 0;
        mudarEstado(RASCUNHO);
    }

    public void enviar(String respostaAutorizador) {
        if (!estado.equals(RASCUNHO) && !estado.equals(PENDENTE)) {
            throw new IllegalStateException("Documento " + numero + " não pode ser enviado no estado " + estado);
        }
        tentativas++;
        mudarEstado(PROCESSANDO);

        switch (respostaAutorizador) {
            case "Sucesso" -> {
                protocolo = gerarProtocolo();
                venda.getMoto().marcarVendida();
                mudarEstado(AUTORIZADO);
            }
            case "Rejeição" -> {
                motivoRejeicao = "Dados do destinatário recusados pelo autorizador";
                mudarEstado(REJEITADO);
            }
            default -> registrarIndisponibilidade();
        }
    }

    public void cancelar(Usuario responsavel, String justificativa) {
        if (!estado.equals(AUTORIZADO)) {
            throw new IllegalStateException("Só um documento autorizado pode ser cancelado");
        }
        if (justificativa == null || justificativa.trim().length() < TAMANHO_MINIMO_JUSTIFICATIVA) {
            throw new IllegalArgumentException("A justificativa precisa ter ao menos "
                    + TAMANHO_MINIMO_JUSTIFICATIVA + " caracteres");
        }
        venda.cancelar(responsavel);
        mudarEstado(CANCELADO);
    }

    public boolean estaPendente() {
        return estado.equals(PENDENTE);
    }

    public int getNumero() {
        return numero;
    }

    public Venda getVenda() {
        return venda;
    }

    public double getValorImposto() {
        return valorImposto;
    }

    public String getPoliticaAplicada() {
        return politicaAplicada;
    }

    public String getEstado() {
        return estado;
    }

    public String getProtocolo() {
        return protocolo;
    }

    public String getMotivoRejeicao() {
        return motivoRejeicao;
    }

    public int getTentativas() {
        return tentativas;
    }

    public List<String> getHistorico() {
        return List.copyOf(historico);
    }

    private void registrarIndisponibilidade() {
        if (tentativas >= MAX_TENTATIVAS) {
            motivoRejeicao = "Autorizador indisponível após " + MAX_TENTATIVAS + " tentativas";
            mudarEstado(REJEITADO);
        } else {
            mudarEstado(PENDENTE);
        }
    }

    private void mudarEstado(String novoEstado) {
        String anterior = (estado == null) ? "Início" : estado;
        historico.add(anterior + " -> " + novoEstado);
        estado = novoEstado;
    }

    private String gerarProtocolo() {
        return String.format("SIM-%06d-%s", numero, venda.getCodigo());
    }

    @Override
    public String toString() {
        String texto = "Documento nº " + numero + " da venda " + venda.getCodigo() + " - " + estado
                + String.format(" - imposto R$ %.2f", valorImposto) + " [" + politicaAplicada + "]"
                + " - tentativas: " + tentativas;
        if (protocolo != null) {
            texto += " - protocolo " + protocolo;
        }
        if (estado.equals(REJEITADO)) {
            texto += " - motivo: " + motivoRejeicao;
        }
        return texto + " (SEM VALOR FISCAL)";
    }
}
