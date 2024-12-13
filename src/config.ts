import dotenv from 'dotenv';
dotenv.config();

export const config = {
    exchanges: [
        {
            name: 'binance',
            apiKey: process.env.BINANCE_API_KEY || '',
            apiSecret: process.env.BINANCE_API_SECRET || ''
        },
        {
            name: 'kucoin',
            apiKey: process.env.KUCOIN_API_KEY || '',
            apiSecret: process.env.KUCOIN_API_SECRET || '',
            passphrase: process.env.KUCOIN_API_PASSPHRASE || ''
        },
        {
            name: 'bybit',
            apiKey: process.env.BYBIT_API_KEY || '',
            apiSecret: process.env.BYBIT_API_SECRET || ''
        },
    ],    tradingPairs: [
        'BTC/USDT',
        'ETH/USDT',
        'SOL/USDT',
        'XRP/USDT',
        'ADA/USDT',
        'DOGE/USDT',
        'DOT/USDT',
        'MATIC/USDT',
        'LINK/USDT',
        'AVAX/USDT',
        'SHIB/USDT',
        'UNI/USDT',
        'ATOM/USDT',
        'LTC/USDT',
        'OP/USDT',
        'ARB/USDT',
        'NEAR/USDT',
        'FTM/USDT',
        'AAVE/USDT',
        'SUI/USDT',
        'APT/USDT',
        'INJ/USDT',
        'TRX/USDT',
        'SAND/USDT',
        'MANA/USDT',
        'CRV/USDT',
        'GRT/USDT',
        'ALGO/USDT',
        'IMX/USDT',
        'SEI/USDT',
        'BLUR/USDT',
        'GALA/USDT',
        'FET/USDT',
        'EGLD/USDT',
        'ROSE/USDT',
        'CHZ/USDT',
        'GMT/USDT',
        'THETA/USDT',
        'SNX/USDT',
        'FIL/USDT',
        'EOS/USDT',
        'VET/USDT',
        'WAVES/USDT',
        'ZIL/USDT',
        'ENJ/USDT',
        'ONE/USDT',
        'COMP/USDT',
        'BAT/USDT',
        'OCEAN/USDT',
        'CAKE/USDT'
    ],    
    minProfitPercent: 0.5
};