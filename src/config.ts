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
        {
            name: 'kraken',
            apiKey: process.env.KRAKEN_API_KEY || '',
            apiSecret: process.env.KRAKEN_API_SECRET || ''
        },
        {
            name: 'poloniex',
            apiKey: process.env.POLONIEX_API_KEY || '',
            apiSecret: process.env.POLONIEX_API_SECRET || ''
        }
    ],    
    tradingPairs: [
        'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'ADA/USDT',
        'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'LINK/USDT', 'AVAX/USDT',
        'SHIB/USDT', 'UNI/USDT', 'ATOM/USDT', 'LTC/USDT', 'OP/USDT',
        'ARB/USDT', 'NEAR/USDT', 'FTM/USDT', 'AAVE/USDT', 'SUI/USDT',
        'APT/USDT', 'INJ/USDT', 'TRX/USDT', 'SAND/USDT', 'MANA/USDT',
        'CRV/USDT', 'GRT/USDT', 'ALGO/USDT', 'IMX/USDT', 'SEI/USDT',
        'BLUR/USDT', 'GALA/USDT', 'FET/USDT', 'EGLD/USDT', 'ROSE/USDT',
        'CHZ/USDT', 'GMT/USDT', 'THETA/USDT', 'SNX/USDT', 'FIL/USDT',
        'EOS/USDT', 'VET/USDT', 'WAVES/USDT', 'ZIL/USDT', 'ENJ/USDT',
        'ONE/USDT', 'COMP/USDT', 'BAT/USDT', 'OCEAN/USDT', 'CAKE/USDT',

        'ETH/BTC', 'XRP/BTC', 'SOL/BTC', 'ADA/BTC', 'DOGE/BTC',
        'DOT/BTC', 'MATIC/BTC', 'LINK/BTC', 'AVAX/BTC', 'UNI/BTC',
        'ATOM/BTC', 'LTC/BTC', 'AAVE/BTC', 'FTM/BTC', 'NEAR/BTC',
        
        'LINK/ETH', 'UNI/ETH', 'AAVE/ETH', 'MATIC/ETH', 'SOL/ETH',
        'DOT/ETH', 'AVAX/ETH', 'ATOM/ETH', 'FTM/ETH', 'NEAR/ETH',
        'CRV/ETH', 'SNX/ETH', 'COMP/ETH', 'YFI/ETH', 'SUSHI/ETH',
        
        'XRP/ETH', 'DOGE/ETH', 'ADA/ETH', 'DOT/XRP', 'MATIC/XRP',
        'LINK/XRP', 'SOL/XRP', 'AVAX/XRP', 'ATOM/XRP', 'UNI/XRP',
        
        'BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'XRP/USDC', 'BTC/BUSD',
        'ETH/BUSD', 'SOL/BUSD', 'XRP/BUSD', 'BTC/DAI', 'ETH/DAI',
        
        'BTC/EUR', 'ETH/EUR', 'SOL/EUR', 'XRP/EUR', 'BTC/GBP',
        'ETH/GBP', 'SOL/GBP', 'XRP/GBP',
        
        'SNX/BTC', 'CAKE/BTC', 'ALGO/BTC', 'VET/BTC', 'EOS/BTC',
        'TRX/BTC', 'DOT/BTC', 'ADA/BTC', 'MATIC/BTC', 'LINK/BTC',
        'SAND/BTC', 'MANA/BTC', 'APE/BTC', 'GALA/BTC', 'IMX/BTC',
        
        'SHIB/ETH', 'SAND/ETH', 'MANA/ETH', 'APE/ETH', 'LRC/ETH',
        'IMX/ETH', 'GALA/ETH', 'CHZ/ETH', 'BAT/ETH', 'ENJ/ETH',
        'ZRX/ETH', '1INCH/ETH', 'PERP/ETH', 'DYDX/ETH', 'RPL/ETH',
        
        'ADA/XRP', 'MATIC/XRP', 'DOT/XRP', 'SOL/XRP', 'LINK/XRP',
        'UNI/XRP', 'ATOM/XRP', 'LTC/XRP', 'DOGE/XRP', 'TRX/XRP',
        
        'RAY/SOL', 'SRM/SOL', 'MATIC/SOL', 'AVAX/SOL', 'FTM/SOL',
        'NEAR/SOL', 'APT/SOL', 'OP/SOL', 'ARB/SOL', 'SUI/SOL',
        
        'USDC/USDT', 'BUSD/USDT', 'DAI/USDT', 'USDT/BUSD', 'USDC/BUSD',
        'DAI/BUSD', 'USDT/DAI', 'USDC/DAI', 'TUSD/USDT', 'USDP/USDT',
        
        'BTC/JPY', 'ETH/JPY', 'SOL/JPY', 'XRP/JPY', 'BTC/AUD',
        'ETH/AUD', 'SOL/AUD', 'XRP/AUD', 'BTC/CAD', 'ETH/CAD',
        
        'UNI/AAVE', 'SUSHI/UNI', 'CRV/UNI', 'BAL/UNI', 'COMP/AAVE',
        'YFI/AAVE', 'SNX/AAVE', '1INCH/UNI', 'CAKE/UNI', 'SRM/UNI'
    ],

    minVolumeThreshold: {
        BTC: 0.01,
        ETH: 0.1,
        USDT: 1000,
        USDC: 1000,
        EUR: 1000,
        GBP: 1000,
        JPY: 100000,
        AUD: 1000,
        CAD: 1000,
        BUSD: 1000,
        DAI: 1000,
        SOL: 1,
        XRP: 1000,
        UNI: 10,
        AAVE: 0.5,
        MATIC: 1000
    },

    minProfitThreshold: {
        BTC: 0.0001,
        ETH: 0.001,
        USDT: 10,
        USDC: 10,
        EUR: 10,
        GBP: 10,
        JPY: 1000,
        AUD: 10,
        CAD: 10,
        BUSD: 10,
        DAI: 10,
        SOL: 0.1,
        XRP: 100,
        UNI: 1,
        AAVE: 0.05,
        MATIC: 100
    },

    pairConfig: {
        'BTC/USDT': { minSpread: 0.001, maxSlippage: 0.002 },
        'ETH/USDT': { minSpread: 0.002, maxSlippage: 0.003 },
        'SOL/USDT': { minSpread: 0.003, maxSlippage: 0.004 }
    }
};