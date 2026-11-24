package emiteja.teste;

import emiteja.modelo.Cliente;
import emiteja.modelo.Moto;
import emiteja.modelo.Usuario;

/** Dados de exemplo reaproveitados pelas suítes de teste. */
public final class Dados {

    public static final String CPF_VALIDO = "529.982.247-25";
    public static final String CNPJ_VALIDO = "11.222.333/0001-81";
    public static final String CHASSI_160 = "9C2KC1670NR000123";
    public static final String CHASSI_250 = "9C6RG3150P0004567";
    public static final String CHASSI_471 = "9C2PC4000R0007890";
    public static final String CHASSI_650 = "9C2RC6500S0001234";
    public static final String JUSTIFICATIVA = "Cliente desistiu da compra no mesmo dia";

    private Dados() {
    }

    public static Moto cg160() {
        return new Moto(CHASSI_160, "Honda", "CG 160 Fan", 160, 2026, "Vermelha", 15990.00);
    }

    public static Moto fazer250() {
        return new Moto(CHASSI_250, "Yamaha", "Fazer 250", 250, 2026, "Azul", 22990.00);
    }

    public static Moto cb500() {
        return new Moto(CHASSI_471, "Honda", "CB 500F", 471, 2026, "Preta", 42990.00);
    }

    public static Moto cb650() {
        return new Moto(CHASSI_650, "Honda", "CB 650R", 649, 2026, "Cinza", 55990.00);
    }

    public static Cliente cliente() {
        return new Cliente("Joana Souza", CPF_VALIDO, "Rua das Flores, 10", "joana@email.com");
    }

    public static Usuario gerente() {
        return new Usuario("Sandra Melo", "sandra", "Gerente");
    }

    public static Usuario vendedor() {
        return new Usuario("Marcos Lima", "marcos", "Vendedor");
    }
}
