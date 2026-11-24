package emiteja.teste;

import emiteja.modelo.AliquotaUnica;
import emiteja.modelo.DocumentoFiscal;
import emiteja.modelo.Moto;
import emiteja.modelo.Venda;

public class TesteDocumentoFiscal extends SuiteDeTeste {

    @Override
    public String getNome() {
        return "Documento fiscal (estados de processamento)";
    }

    private static DocumentoFiscal novoDocumento() {
        Venda venda = new Venda("V-0001", Dados.cg160(), Dados.cliente(), Dados.vendedor(), "PIX");
        return new DocumentoFiscal(venda, new AliquotaUnica());
    }

    @Override
    protected void executar() {
        teste("documento novo nasce em Rascunho com o imposto calculado", () -> {
            DocumentoFiscal documento = novoDocumento();
            verificarIgual(DocumentoFiscal.RASCUNHO, documento.getEstado());
            verificarIgual(1599.00, documento.getValorImposto());
        });

        teste("resposta Sucesso autoriza, gera protocolo e marca a moto como vendida", () -> {
            DocumentoFiscal documento = novoDocumento();
            documento.enviar("Sucesso");
            verificarIgual(DocumentoFiscal.AUTORIZADO, documento.getEstado());
            verificar(documento.getProtocolo().startsWith("SIM-"), "protocolo deveria começar com SIM-");
            verificarIgual(Moto.VENDIDA, documento.getVenda().getMoto().getSituacao());
        });

        teste("resposta Rejeição deixa o documento Rejeitado com motivo", () -> {
            DocumentoFiscal documento = novoDocumento();
            documento.enviar("Rejeição");
            verificarIgual(DocumentoFiscal.REJEITADO, documento.getEstado());
            verificar(documento.getMotivoRejeicao() != null, "deveria ter motivo de rejeição");
        });

        teste("autorizador indisponível deixa Pendente e rejeita após 3 tentativas", () -> {
            DocumentoFiscal documento = novoDocumento();
            documento.enviar("Indisponível");
            verificarIgual(DocumentoFiscal.PENDENTE, documento.getEstado());
            documento.enviar("Indisponível");
            documento.enviar("Indisponível");
            verificarIgual(DocumentoFiscal.REJEITADO, documento.getEstado());
            verificarIgual(DocumentoFiscal.MAX_TENTATIVAS, documento.getTentativas());
        });

        teste("pendente pode ser reenviado e autorizado", () -> {
            DocumentoFiscal documento = novoDocumento();
            documento.enviar("Indisponível");
            documento.enviar("Sucesso");
            verificarIgual(DocumentoFiscal.AUTORIZADO, documento.getEstado());
            verificarIgual(2, documento.getTentativas());
        });

        teste("documento autorizado não pode ser enviado de novo", () -> {
            DocumentoFiscal documento = novoDocumento();
            documento.enviar("Sucesso");
            verificarErro(IllegalStateException.class, () -> documento.enviar("Sucesso"));
        });

        teste("histórico guarda cada transição de estado", () -> {
            DocumentoFiscal documento = novoDocumento();
            documento.enviar("Sucesso");
            verificarIgual("Início -> Rascunho", documento.getHistorico().get(0));
            verificarIgual("Processando -> Autorizado", documento.getHistorico().get(2));
        });

        teste("cancelamento exige justificativa com ao menos 15 caracteres", () -> {
            DocumentoFiscal documento = novoDocumento();
            documento.enviar("Sucesso");
            verificarErro(IllegalArgumentException.class, () -> documento.cancelar(Dados.gerente(), "curta"));
            documento.cancelar(Dados.gerente(), Dados.JUSTIFICATIVA);
            verificarIgual(DocumentoFiscal.CANCELADO, documento.getEstado());
        });

        teste("só documento autorizado pode ser cancelado", () ->
                verificarErro(IllegalStateException.class,
                        () -> novoDocumento().cancelar(Dados.gerente(), Dados.JUSTIFICATIVA)));
    }
}
