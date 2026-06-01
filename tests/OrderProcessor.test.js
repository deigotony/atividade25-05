const OrderProcessor = require('../src/OrderProcessor');

describe('OrderProcessor', () => {
    let paymentGateway;
    let emailService;
    let orderProcessor;

    beforeEach(() => {
        jest.clearAllMocks();

        paymentGateway = {
            charge: jest.fn()
        };

        emailService = {
            sendReceipt: jest.fn(),
            sendFailureNotification: jest.fn()
        };

        orderProcessor = new OrderProcessor(
            paymentGateway,
            emailService
        );
    });

    describe('Validação de Entrada (Guard Clauses)', () => {

        test('deve lançar erro quando o usuário for null', async () => {
            await expect(
                orderProcessor.processOrder(null, 100)
            ).rejects.toThrow('Usuário inválido');

            expect(paymentGateway.charge).not.toHaveBeenCalled();
        });

        test('deve lançar erro quando o usuário não possuir email', async () => {
            const user = {
                id: 1,
                name: 'João'
            };

            await expect(
                orderProcessor.processOrder(user, 100)
            ).rejects.toThrow('Usuário inválido');

            expect(paymentGateway.charge).not.toHaveBeenCalled();
        });

    });

    describe('Interação e Comportamento', () => {

        test('deve processar o pedido com sucesso e enviar recibo', async () => {
            const user = {
                id: 1,
                email: 'teste@email.com'
            };

            paymentGateway.charge.mockResolvedValue(true);

            const result = await orderProcessor.processOrder(user, 100);

            expect(result).toEqual({
                status: 'SUCCESS'
            });

            expect(paymentGateway.charge)
                .toHaveBeenCalledWith(1, 100);

            expect(emailService.sendReceipt)
                .toHaveBeenCalledWith('teste@email.com', 100);

            expect(emailService.sendFailureNotification)
                .not.toHaveBeenCalled();
        });

        test('deve lançar erro quando o pagamento for recusado', async () => {
            const user = {
                id: 1,
                email: 'teste@email.com'
            };

            paymentGateway.charge.mockResolvedValue(false);

            await expect(
                orderProcessor.processOrder(user, 100)
            ).rejects.toThrow('Pagamento recusado');

            expect(paymentGateway.charge)
                .toHaveBeenCalledWith(1, 100);

            expect(emailService.sendFailureNotification)
                .toHaveBeenCalledWith('teste@email.com');

            expect(emailService.sendReceipt)
                .not.toHaveBeenCalled();
        });

    });
});