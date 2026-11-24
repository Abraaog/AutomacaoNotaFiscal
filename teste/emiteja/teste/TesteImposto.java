package emiteja.teste;

import emiteja.modelo.AliquotaUnica;
import emiteja.modelo.PoliticaImposto;
import emiteja.modelo.PorCilindrada;

public class TesteImposto extends SuiteDeTeste {

    @Override
    public String getNome() {
        return "Política de imposto (variantes A e B)";
    }

    @Override
    protected void executar() {
        teste("variante A cobra 10% sobre qualquer moto", () -> {
            PoliticaImposto politica = new AliquotaUnica();
            verificarIgual(1599.00, politica.calcular(Dados.cg160(), 15990.00));
            verificarIgual(5599.00, politica.calcular(Dados.cb650(), 55990.00));
        });

        teste("variante B cobra 8% até 160cc (limite incluso)", () ->
                verificarIgual(0.08, new PorCilindrada().aliquota(Dados.cg160())));

        teste("variante B cobra 12% de 161cc até 500cc", () -> {
            PoliticaImposto politica = new PorCilindrada();
            verificarIgual(0.12, politica.aliquota(Dados.fazer250()));
            verificarIgual(0.12, politica.aliquota(Dados.cb500()));
        });

        teste("variante B cobra 18% acima de 500cc", () ->
                verificarIgual(10078.20, new PorCilindrada().calcular(Dados.cb650(), 55990.00)));

        teste("as duas variantes são usadas pelo tipo da classe mãe (polimorfismo)", () -> {
            PoliticaImposto[] politicas = {new AliquotaUnica(), new PorCilindrada()};
            verificarIgual(4299.00, politicas[0].calcular(Dados.cb500(), 42990.00));
            verificarIgual(5158.80, politicas[1].calcular(Dados.cb500(), 42990.00));
        });

        teste("valor negativo é recusado", () ->
                verificarErro(IllegalArgumentException.class,
                        () -> new AliquotaUnica().calcular(Dados.cg160(), -1)));
    }
}
