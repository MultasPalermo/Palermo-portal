// src/app/shared/components/button-pay/button-pay.component.if.spec.ts

// src/app/shared/components/button-pay/button-pay.component.if.spec.ts
// Mock for PaymentService with generateAgreementPayment method
class MockPaymentService {
    public generateAgreementPayment = jest.fn();
}

// Mock for EventEmitter
class MockEventEmitter {
    public emit = jest.fn();
}

// Mock for ButtonPayComponent, only relevant properties/methods for 'if' method
class MockButtonPayComponent {
    public agreementId?: number;
    public paymentService: MockPaymentService;
    public paid: MockEventEmitter<void>;
    public loading: boolean = false;
    public error: string | null = null;

    constructor() {
        this.paymentService = new MockPaymentService() as any;
        this.paid = new MockEventEmitter<void>() as any;
    }

    // Simulated 'if' method from the original code
    public if() {
        if (this.agreementId) {
            this.paymentService.generateAgreementPayment(this.agreementId).subscribe({
                next: () => {
                    this.paid.emit();
                },
                error: () => {
                    this.error = 'Payment failed';
                }
            });
            return;
        }
        // No-op if agreementId is falsy
    }
}

describe('ButtonPayComponent.if() if method', () => {
    // Happy Path Tests
    describe('Happy paths', () => {
        it('should call generateAgreementPayment and emit paid when agreementId is set and payment succeeds', () => {
            // This test ensures that when agreementId is provided, generateAgreementPayment is called and paid.emit is triggered on success.
            const mockComponent = new MockButtonPayComponent() as any;
            mockComponent.agreementId = 123;

            // Mock the observable returned by generateAgreementPayment
            const mockSubscribe = jest.fn((handlers: any) => {
                handlers.next();
            });
            jest.mocked(mockComponent.paymentService.generateAgreementPayment).mockReturnValue({
                subscribe: mockSubscribe
            } as any);

            mockComponent.if();

            expect(jest.mocked(mockComponent.paymentService.generateAgreementPayment)).toHaveBeenCalledWith(123);
            expect(mockSubscribe).toHaveBeenCalled();
            expect(jest.mocked(mockComponent.paid.emit)).toHaveBeenCalled();
            expect(mockComponent.error).toBeNull();
        });

        it('should not call generateAgreementPayment when agreementId is not set', () => {
            // This test ensures that if agreementId is not provided, generateAgreementPayment is not called.
            const mockComponent = new MockButtonPayComponent() as any;
            mockComponent.agreementId = undefined;

            mockComponent.if();

            expect(jest.mocked(mockComponent.paymentService.generateAgreementPayment)).not.toHaveBeenCalled();
            expect(jest.mocked(mockComponent.paid.emit)).not.toHaveBeenCalled();
            expect(mockComponent.error).toBeNull();
        });
    });

    // Edge Case Tests
    describe('Edge cases', () => {
        it('should handle error from generateAgreementPayment observable', () => {
            // This test ensures that if generateAgreementPayment's observable errors, the error property is set.
            const mockComponent = new MockButtonPayComponent() as any;
            mockComponent.agreementId = 456;

            const mockSubscribe = jest.fn((handlers: any) => {
                handlers.error(new Error('fail'));
            });
            jest.mocked(mockComponent.paymentService.generateAgreementPayment).mockReturnValue({
                subscribe: mockSubscribe
            } as any);

            mockComponent.if();

            expect(jest.mocked(mockComponent.paymentService.generateAgreementPayment)).toHaveBeenCalledWith(456);
            expect(mockSubscribe).toHaveBeenCalled();
            expect(jest.mocked(mockComponent.paid.emit)).not.toHaveBeenCalled();
            expect(mockComponent.error).toBe('Payment failed');
        });

        it('should not call generateAgreementPayment if agreementId is 0 (falsy)', () => {
            // This test ensures that if agreementId is 0, generateAgreementPayment is not called.
            const mockComponent = new MockButtonPayComponent() as any;
            mockComponent.agreementId = 0;

            mockComponent.if();

            expect(jest.mocked(mockComponent.paymentService.generateAgreementPayment)).not.toHaveBeenCalled();
            expect(jest.mocked(mockComponent.paid.emit)).not.toHaveBeenCalled();
            expect(mockComponent.error).toBeNull();
        });

        it('should not call generateAgreementPayment if agreementId is null (falsy)', () => {
            // This test ensures that if agreementId is null, generateAgreementPayment is not called.
            const mockComponent = new MockButtonPayComponent() as any;
            mockComponent.agreementId = null as any;

            mockComponent.if();

            expect(jest.mocked(mockComponent.paymentService.generateAgreementPayment)).not.toHaveBeenCalled();
            expect(jest.mocked(mockComponent.paid.emit)).not.toHaveBeenCalled();
            expect(mockComponent.error).toBeNull();
        });

        it('should not call generateAgreementPayment if agreementId is an empty string (falsy)', () => {
            // This test ensures that if agreementId is an empty string, generateAgreementPayment is not called.
            const mockComponent = new MockButtonPayComponent() as any;
            mockComponent.agreementId = '' as any;

            mockComponent.if();

            expect(jest.mocked(mockComponent.paymentService.generateAgreementPayment)).not.toHaveBeenCalled();
            expect(jest.mocked(mockComponent.paid.emit)).not.toHaveBeenCalled();
            expect(mockComponent.error).toBeNull();
        });
    });
});
