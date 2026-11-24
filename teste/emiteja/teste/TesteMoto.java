package emiteja.teste;

import emiteja.modelo.Moto;

public class TesteMoto extends SuiteDeTeste {

    @Override
    public String getNome() {
        return "Moto (chassi, preço e situação)";
    }

    @Override
    protected void executar() {
        teste("moto nova fica Disponível e o chassi vai para maiúsculas", () -> {
            Moto moto = new Moto("9c2kc1670nr000123", "Honda", "CG 160 Fan", 160, 2026, "Vermelha", 15990.00);
            verificarIgual(Moto.DISPONIVEL, moto.getSituacao());
            verificarIgual(Dados.CHASSI_160, moto.getChassi());
        });

        teste("recusa chassi com tamanho diferente de 17", () ->
                verificarErro(IllegalArgumentException.class,
                        () -> new Moto("9C2KC1670", "Honda", "CG", 160, 2026, "Preta", 15990.00)));

        teste("recusa chassi com as letras I, O ou Q", () ->
                verificarErro(IllegalArgumentException.class,
                        () -> new Moto("9C2KC1670NR00O123", "Honda", "CG", 160, 2026, "Preta", 15990.00)));

        teste("recusa preço zero ou negativo, também pelo setter", () -> {
            verificarErro(IllegalArgumentException.class,
                    () -> new Moto(Dados.CHASSI_160, "Honda", "CG", 160, 2026, "Preta", 0));
            Moto moto = Dados.cg160();
            verificarErro(IllegalArgumentException.class, () -> moto.setPreco(-10));
            verificarIgual(15990.00, moto.getPreco());
        });

        teste("segue Disponível -> Reservada -> Vendida", () -> {
            Moto moto = Dados.cg160();
            moto.reservar();
            verificarIgual(Moto.RESERVADA, moto.getSituacao());
            moto.marcarVendida();
            verificarIgual(Moto.VENDIDA, moto.getSituacao());
        });

        teste("não reserva moto que já está reservada", () -> {
            Moto moto = Dados.cg160();
            moto.reservar();
            verificarErro(IllegalStateException.class, moto::reservar);
        });

        teste("não marca como vendida sem reservar antes", () ->
                verificarErro(IllegalStateException.class, () -> Dados.cg160().marcarVendida()));
    }
}
