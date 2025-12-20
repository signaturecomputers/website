declare module '@cashfreepayments/cashfree-js' {
    interface LoadOptions {
        mode: 'sandbox' | 'production';
    }

    interface CheckoutOptions {
        paymentSessionId: string;
        redirectTarget?: '_self' | '_blank' | '_parent' | '_top' | HTMLElement;
        appearance?: {
            width?: string;
            height?: string;
        };
    }

    interface CheckoutResult {
        error?: {
            message: string;
            code?: string;
        };
        redirect?: boolean;
        paymentDetails?: {
            paymentMessage: string;
        };
    }

    interface CashfreeSDK {
        checkout: (options: CheckoutOptions) => Promise<CheckoutResult>;
    }

    export function load(options: LoadOptions): Promise<CashfreeSDK>;
}
