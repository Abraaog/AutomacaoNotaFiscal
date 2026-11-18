package emiteja.modelo;

public class PorCilindrada extends PoliticaImposto {

    private static final int LIMITE_BAIXA = 160;
    private static final int LIMITE_MEDIA = 500;

    public PorCilindrada() {
        super("Variante B - por cilindrada (8%, 12% ou 18%)");
    }

    @Override
    public double aliquota(Moto moto) {
        if (moto.getCilindrada() <= LIMITE_BAIXA) {
            return 0.08;
        }
        if (moto.getCilindrada() <= LIMITE_MEDIA) {
            return 0.12;
        }
        return 0.18;
    }
}
