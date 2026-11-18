package emiteja.modelo;

public class AliquotaUnica extends PoliticaImposto {

    private static final double ALIQUOTA = 0.10;

    public AliquotaUnica() {
        super("Variante A - alíquota única de 10%");
    }

    @Override
    public double aliquota(Moto moto) {
        return ALIQUOTA;
    }
}
