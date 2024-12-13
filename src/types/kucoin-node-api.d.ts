declare module 'kucoin-node-api' {
    export function init(config: {
        apiKey: string;
        secretKey: string;
        passphrase: string;
    }): void;

    export function getAllTickers(): Promise<{
        data: {
            ticker: Array<{
                symbol: string;
                last: string;
            }>;
        };
    }>;
}
