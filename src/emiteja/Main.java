package emiteja;

public class Main {

    public static void main(String[] args) {
        Moto moto = new Moto("9C2KC1670NR000123", "Honda", "CG 160 Fan", 160, 2026, "Vermelha", 15990.00);
        Cliente cliente = new Cliente("Maria Souza", "52998224725", "Rua das Flores, 100 - Rio Tinto/PB", "maria@email.com");
        Usuario vendedor = new Usuario("Marcos Lima", "marcos", "Vendedor");

        Venda venda = new Venda("V-0001", moto, cliente, vendedor, "PIX");

        System.out.println("==== EmiteJá ====");
        System.out.println(venda);

        System.out.println("\n==== Preço inválido ====");
        try {
            moto.setPreco(-10);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}
