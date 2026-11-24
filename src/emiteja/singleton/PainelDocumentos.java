package emiteja.singleton;

import emiteja.modelo.DocumentoFiscal;
import emiteja.observer.ObservadorDocumento;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Singleton: existe um único painel de documentos no sistema.
 * Também é um observador: a Loja avisa e o painel atualiza a linha do documento.
 */
public class PainelDocumentos implements ObservadorDocumento {

    private static final PainelDocumentos instancia = new PainelDocumentos();

    private final Map<Integer, String> linhas = new LinkedHashMap<>();

    private PainelDocumentos() {
    }

    public static PainelDocumentos getInstancia() {
        return instancia;
    }

    @Override
    public void documentoAtualizado(DocumentoFiscal documento) {
        linhas.put(documento.getNumero(), "Documento nº " + documento.getNumero() + " - venda "
                + documento.getVenda().getCodigo() + " - " + documento.getEstado());
    }

    public String montarPainel() {
        if (linhas.isEmpty()) {
            return "Painel de documentos: nenhum documento emitido ainda.";
        }
        return "Painel de documentos:\n" + String.join("\n", linhas.values());
    }

    public void exibirPainel() {
        System.out.println(montarPainel());
    }

    public List<String> getLinhas() {
        return List.copyOf(linhas.values());
    }

    public void limpar() {
        linhas.clear();
    }
}
