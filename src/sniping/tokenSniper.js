"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenSniper = void 0;
const ethers_1 = require("ethers");
const liveCoinWatch_1 = require("./apis/liveCoinWatch");
const dappRadar_1 = require("./apis/dappRadar");
const quillai_1 = require("./apis/quillai");
const contractAnalyzer_1 = require("./contractAnalyzer");
const profitManager_1 = require("../profit/profitManager");
class TokenSniper {
    constructor(rpcUrl, liveCoinWatchApiKey, dappRadarApiKey, quillaiApiKey, config) {
        this.provider = new ethers_1.providers.JsonRpcProvider(rpcUrl);
        this.liveCoinWatch = new liveCoinWatch_1.LiveCoinWatchAPI(liveCoinWatchApiKey);
        this.dappRadar = new dappRadar_1.DappRadarAPI();
        this.quillai = new quillai_1.QuillAIAPI(quillaiApiKey);
        this.contractAnalyzer = new contractAnalyzer_1.ContractAnalyzer(rpcUrl, quillaiApiKey);
        this.profitManager = new profitManager_1.ProfitManager();
        this.config = config;
    }
    async startSniper() {
        console.log('🎯 Starting token sniper...');
        // Listen to DEX events for new pairs
        this.listenToNewPairs();
        // Also periodically check LiveCoinWatch for new tokens
        setInterval(async () => {
            const newTokens = await this.liveCoinWatch.getNewTokens();
            for (const token of newTokens) {
                await this.analyzeToken(token);
            }
        }, 2000); // Check every 2 seconds
    }
    async analyzeToken(token) {
        var _a, _b, _c;
        try {
            const security = await this.quillai.analyzeContract(token.address);
            const metrics = await this.quillai.getTokenMetrics(token.address);
            if (this.isTokenSafe(security, metrics) && this.meetsVolumeCriteria(token)) {
                console.log(`\n🎯 Found potential token: ${token.symbol || token.address}`);
                console.log(`📊 Market Cap: $${((_a = token.marketCap) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || 'Unknown'}`);
                console.log(`💧 Liquidity: $${((_b = token.liquidityAmount) === null || _b === void 0 ? void 0 : _b.toLocaleString()) || 'Unknown'}`);
                console.log(`📈 24h Volume: $${((_c = token.volume24h) === null || _c === void 0 ? void 0 : _c.toLocaleString()) || 'Unknown'}`);
                console.log(`🔒 Security Score: ${security.score}`);
                if (this.shouldBuy(token, security, metrics)) {
                    await this.executeBuy(token);
                }
            }
        }
        catch (error) {
            console.error('Error analyzing token:', error);
        }
    }
    async testApiConnection() {
        try {
            const response = await this.liveCoinWatch.getNewTokens();
            console.log('LiveCoinWatch API connection successful!');
            console.log(`Found ${response.length} new tokens`);
            return true;
        }
        catch (error) {
            console.error('LiveCoinWatch API connection failed:', error);
            return false;
        }
    }
    async listenToNewPairs() {
        const uniswapV2Factory = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
        const factory = new ethers_1.Contract(uniswapV2Factory, ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'], this.provider);
        factory.on('PairCreated', async (token0, token1, pair) => {
            console.log(`\n🔍 New pair detected: ${token0} - ${token1}`);
            await this.analyzeToken({ address: token0 });
            await this.analyzeToken({ address: token1 });
        });
    }
    isTokenSafe(security, metrics) {
        return (!security.isHoneypot &&
            security.score >= this.config.minSecurityScore &&
            security.liquidityLocked &&
            security.contractVerified &&
            metrics.buyTax <= this.config.maxBuyTax &&
            metrics.sellTax <= this.config.maxSellTax);
    }
    meetsVolumeCriteria(token) {
        var _a;
        const minLiquidity = this.config.minLiquidity;
        const minHolders = this.config.minHolders;
        return (((_a = token.liquidityAmount) !== null && _a !== void 0 ? _a : 0) >= minLiquidity &&
            (token.holders === undefined || token.holders >= minHolders));
    }
    shouldBuy(token, security, metrics) {
        return (this.isTokenSafe(security, metrics) &&
            this.meetsVolumeCriteria(token) &&
            metrics.riskLevel !== 'HIGH');
    }
    async executeBuy(token) {
        try {
            console.log(`\n Executing buy for token: ${token.symbol || token.address}`);
            console.log(`Would execute buy for ${token.address}`);
        }
        catch (error) {
            console.error(`Error executing buy for token ${token.address}:`, error);
        }
    }
    async scanForNewTokens() {
        try {
            const tokens = await this.dappRadar.getNewTokens();
            return tokens.map(token => {
                const baseToken = {
                    address: token.address || '',
                    chain: 'ETH',
                    creationTime: Date.now(),
                    source: 'dappradar',
                    liquidityAmount: token.liquidity,
                    securityScore: token.securityScore,
                    buyTax: token.buyTax,
                    sellTax: token.sellTax,
                    holders: token.holders,
                    symbol: token.symbol,
                    name: token.name,
                    marketCap: token.marketCap,
                    volume24h: token.volume24h,
                    pair: token.pair,
                    rate: token.rate
                };
                return baseToken;
            });
        }
        catch (error) {
            console.error('Token scanning error:', error);
            return [];
        }
    }
}
exports.TokenSniper = TokenSniper;
