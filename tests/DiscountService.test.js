const DiscountService = require('../src/DiscountService')

describe('DiscountService - Regras de Negócio e Limites', () => {
    let discountService;

    beforeEach(() =>{
        discountService = new DiscountService();
    });

    describe('caminho feliz básico', () => {

        test('cliente nao cadastrado retorna 0', () => {
            const amount = 1000;
            const customerType = 'NOVO';

            const result = discountService.calculate(amount, customerType);

            expect(result).toBe(0);
        });
    });

    describe('o limite de 0', () => {

        test('compra de 0 reais sem excecoes', () => {
            const amount = 0;
            const customerType = 'REGULAR';

            expect(() => {
                discountService.calculate(amount, customerType);
            }).not.toThrow();
        });
    });

    describe('teste de falsy e tipagem', () => {

        test('função lança erro se valor for nullo', () => {
            const amount = null;
            const customerType = 'REGULAR';

            expect(() => {
                discountService.calculate(amount, customerType);
            }).toThrow();
        });
    });

    describe('desafio de engenharia test.each', () => {

        test.each([
            ['VIP', 999.99, 99.999],
            ['VIP', 1000.00, 200.00],
            ['REGULAR', 499.99, 0],
            ['REGULAR', 500.00, 25.00]
        ])(
            'deve calcular corretamente o desconto para %s com compra de R$ %f', (customerType, amount, expectedDiscount) => {
                const result = discountService.calculate(amount, customerType);

                expect(result).toBeCloseTo(expectedDiscount, 3);
            }
        )
    });
});