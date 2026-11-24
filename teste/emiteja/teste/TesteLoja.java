package emiteja.teste;

import emiteja.modelo.DocumentoFiscal;
import emiteja.modelo.Moto;
import emiteja.modelo.PorCilindrada;
import emiteja.servico.Loja;

public class TesteLoja extends SuiteDeTeste {

    @Override
    public String getNome() {
        return "Loja (venda, duplicidade, reenvio e cancelamento)";
    }

    private static Loja lojaComTresMotos() {
        Loja loja = new Loja();
        loja.cadastrarMoto(Dados.cg160());
        loja.cadastrarMoto(Dados.fazer250());
        loja.cadastrarMoto(Dados.cb500());
        return loja;
    }

    private static DocumentoFiscal venderCg160(Loja loja) {
        return loja.vender(Dados.CHASSI_160, Dados.cliente(), Dados.vendedor(), "PIX");
    }

    @Override
    protected void executar() {
        teste("cadastro conta as motos disponíveis e recusa chassi repetido", () -> {
            Loja loja = lojaComTresMotos();
            verificarIgual(3, loja.getMotosDisponiveis());
            verificarErro(IllegalArgumentException.class, () -> loja.cadastrarMoto(Dados.cg160()));
        });

        teste("venda gera código V-0001 e documento autorizado", () -> {
            Loja loja = lojaComTresMotos();
            DocumentoFiscal documento = venderCg160(loja);
            verificarIgual("V-0001", documento.getVenda().getCodigo());
            verificarIgual(DocumentoFiscal.AUTORIZADO, documento.getEstado());
            verificarIgual(2, loja.getMotosDisponiveis());
        });

        teste("emitir de novo a mesma venda devolve o mesmo documento (sem duplicidade)", () -> {
            Loja loja = lojaComTresMotos();
            DocumentoFiscal primeiro = venderCg160(loja);
            DocumentoFiscal segundo = loja.emitir(primeiro.getVenda());
            verificar(primeiro == segundo, "deveria devolver o mesmo documento");
            verificarIgual(1, loja.getDocumentos().size());
        });

        teste("não vende a mesma moto duas vezes", () -> {
            Loja loja = lojaComTresMotos();
            venderCg160(loja);
            verificarErro(IllegalStateException.class, () -> venderCg160(loja));
            verificarIgual(1, loja.getTotalVendas());
        });

        teste("recusa venda de chassi que não existe", () ->
                verificarErro(IllegalArgumentException.class,
                        () -> lojaComTresMotos().vender(Dados.CHASSI_650, Dados.cliente(), Dados.vendedor(), "PIX")));

        teste("autorizador fora do ar deixa Pendente e o reenvio autoriza depois", () -> {
            Loja loja = lojaComTresMotos();
            loja.setCenarioAutorizador("Indisponível");
            DocumentoFiscal documento = venderCg160(loja);
            verificarIgual(DocumentoFiscal.PENDENTE, documento.getEstado());
            loja.setCenarioAutorizador("Sucesso");
            verificarIgual(1, loja.reenviarPendentes());
            verificarIgual(DocumentoFiscal.AUTORIZADO, documento.getEstado());
        });

        teste("trocar a política para a variante B muda o imposto das próximas vendas", () -> {
            Loja loja = lojaComTresMotos();
            loja.setPoliticaAtiva(new PorCilindrada());
            DocumentoFiscal documento = venderCg160(loja);
            verificarIgual(1279.20, documento.getValorImposto());
            verificar(documento.getPoliticaAplicada().startsWith("Variante B"), "deveria usar a variante B");
        });

        teste("gerente cancela a venda e a moto volta a ficar disponível", () -> {
            Loja loja = lojaComTresMotos();
            DocumentoFiscal documento = venderCg160(loja);
            loja.cancelar(documento, Dados.gerente(), Dados.JUSTIFICATIVA);
            verificarIgual(DocumentoFiscal.CANCELADO, documento.getEstado());
            verificarIgual(Moto.DISPONIVEL, documento.getVenda().getMoto().getSituacao());
            verificarIgual(3, loja.getMotosDisponiveis());
        });

        teste("vendedor não pode cancelar", () -> {
            Loja loja = lojaComTresMotos();
            DocumentoFiscal documento = venderCg160(loja);
            verificarErro(IllegalStateException.class,
                    () -> loja.cancelar(documento, Dados.vendedor(), Dados.JUSTIFICATIVA));
            verificarIgual(DocumentoFiscal.AUTORIZADO, documento.getEstado());
        });

        teste("recusa cenário de autorizador desconhecido e política nula", () -> {
            Loja loja = new Loja();
            verificarErro(IllegalArgumentException.class, () -> loja.setCenarioAutorizador("Talvez"));
            verificarErro(IllegalArgumentException.class, () -> loja.setPoliticaAtiva(null));
        });
    }
}
