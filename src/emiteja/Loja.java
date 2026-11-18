package emiteja;

import java.util.ArrayList;
import java.util.List;

public class Loja {

    private final List<Moto> motos = new ArrayList<>();
    private final List<DocumentoFiscal> documentos = new ArrayList<>();
    private int motosDisponiveis;
    private int totalVendas;
    private String cenarioAutorizador = "Sucesso";

    public void cadastrarMoto(Moto moto) {
        if (buscarMoto(moto.getChassi()) != null) {
            throw new IllegalArgumentException("Já existe moto com o chassi " + moto.getChassi());
        }
        motos.add(moto);
        motosDisponiveis++;
    }

    public Moto buscarMoto(String chassi) {
        for (Moto moto : motos) {
            if (moto.getChassi().equalsIgnoreCase(chassi)) {
                return moto;
            }
        }
        return null;
    }

    public DocumentoFiscal vender(String chassi, Cliente cliente, Usuario vendedor, String formaPagamento) {
        Moto moto = buscarMoto(chassi);
        if (moto == null) {
            throw new IllegalArgumentException("Moto não encontrada: " + chassi);
        }
        Venda venda = new Venda(gerarCodigoVenda(), moto, cliente, vendedor, formaPagamento);
        totalVendas++;
        motosDisponiveis--;
        return emitir(venda);
    }

    public DocumentoFiscal emitir(Venda venda) {
        DocumentoFiscal existente = buscarDocumento(venda.getCodigo());
        if (existente != null) {
            return existente;
        }
        DocumentoFiscal documento = new DocumentoFiscal(venda);
        documentos.add(documento);
        documento.enviar(cenarioAutorizador);
        return documento;
    }

    public int reenviarPendentes() {
        int reenviados = 0;
        for (DocumentoFiscal documento : documentos) {
            if (documento.estaPendente()) {
                documento.enviar(cenarioAutorizador);
                reenviados++;
            }
        }
        return reenviados;
    }

    public void cancelar(DocumentoFiscal documento, Usuario responsavel, String justificativa) {
        documento.cancelar(responsavel, justificativa);
        motosDisponiveis++;
    }

    public DocumentoFiscal buscarDocumento(String codigoVenda) {
        for (DocumentoFiscal documento : documentos) {
            if (documento.getVenda().getCodigo().equals(codigoVenda)) {
                return documento;
            }
        }
        return null;
    }

    public List<Moto> getMotos() {
        return List.copyOf(motos);
    }

    public List<DocumentoFiscal> getDocumentos() {
        return List.copyOf(documentos);
    }

    public int getMotosDisponiveis() {
        return motosDisponiveis;
    }

    public int getTotalVendas() {
        return totalVendas;
    }

    public String getCenarioAutorizador() {
        return cenarioAutorizador;
    }

    public void setCenarioAutorizador(String cenarioAutorizador) {
        if (!cenarioAutorizador.equals("Sucesso") && !cenarioAutorizador.equals("Rejeição")
                && !cenarioAutorizador.equals("Indisponível")) {
            throw new IllegalArgumentException("Cenário inválido: " + cenarioAutorizador);
        }
        this.cenarioAutorizador = cenarioAutorizador;
    }

    private String gerarCodigoVenda() {
        return String.format("V-%04d", totalVendas + 1);
    }
}
