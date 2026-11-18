package emiteja;

public class Main {

    public static void main(String[] args) {
        Moto moto = new Moto("9C2KC1670NR000123", "Honda", "CG 160 Fan", 160, 2026, "Vermelha", 15990.00);
        Cliente cliente = new Cliente("Maria Souza", "52998224725", "Rua das Flores, 100 - Rio Tinto/PB", "maria@email.com");
        Usuario vendedor = new Usuario("Marcos Lima", "marcos", "Vendedor");
        Usuario gerente = new Usuario("Sandra Melo", "sandra", "Gerente");

        Venda venda = new Venda("V-0001", moto, cliente, vendedor, "PIX");

        System.out.println("==== EmiteJá ====");
        System.out.println(venda);

        System.out.println("\n==== Mesma moto em outra venda ====");
        try {
            new Venda("V-0002", moto, cliente, vendedor, "Cartão");
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }

        System.out.println("\n==== Vendedor tenta cancelar ====");
        try {
            venda.cancelar(vendedor);
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }

        System.out.println("\n==== Gerente cancela ====");
        venda.cancelar(gerente);
        System.out.println(venda);

        System.out.println("\n==== CPF inválido ====");
        try {
            new Cliente("João", "123.456.789-00", "Rua A", "joao@email.com");
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }

        System.out.println("\n==== Cliente com CNPJ ====");
        System.out.println(new Cliente("Auto Peças Rio Tinto LTDA", "11.222.333/0001-81", "Av. Brasil, 50", "contato@autopecas.com"));

        System.out.println("\n==== Chassi inválido ====");
        try {
            new Moto("ABC", "Yamaha", "Fazer 250", 250, 2026, "Azul", 22990.00);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }

        System.out.println("\n==== Preço inválido ====");
        try {
            moto.setPreco(-10);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}
