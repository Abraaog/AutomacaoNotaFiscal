package emiteja.teste;

import java.util.ArrayList;
import java.util.List;

/** Roda todas as suítes de teste e mostra o resumo. Sai com código 1 se algo falhar. */
public class ExecutarTestes {

    public static void main(String[] args) {
        List<SuiteDeTeste> suites = List.of(
                new TestePessoas(),
                new TesteMoto(),
                new TesteImposto(),
                new TesteDocumentoFiscal(),
                new TesteLoja());

        int aprovados = 0;
        List<String> falhas = new ArrayList<>();
        for (SuiteDeTeste suite : suites) {
            suite.rodar();
            aprovados += suite.getAprovados();
            falhas.addAll(suite.getFalhas());
        }

        System.out.println();
        System.out.println(aprovados + " teste(s) aprovado(s), " + falhas.size() + " falha(s)");
        for (String falha : falhas) {
            System.out.println("  - " + falha);
        }
        if (!falhas.isEmpty()) {
            System.exit(1);
        }
    }
}
