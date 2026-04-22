export const exchangeConfig = {
    gateio: {
        defaultPairs: [
            'BTC/USDT',
            'ETH/USDT',
            'BNB/USDT',
            'SOL/USDT',
            'XRP/USDT'
        ],
        options: {
            enforceMarketValidation: false,
            retryOnEmpty: true,
            timeout: 30000
        }
    }
};
