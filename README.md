# Crypto Arbitrage Bot

A production-grade, multi-strategy cryptocurrency arbitrage bot built with TypeScript. It automatically detects and executes profitable opportunities across centralized exchanges (CEX) and decentralized protocols (DEX), incorporating real-world fee modeling, latency risk management, and scalable capital allocation starting from as little as **$10–$50**.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Arbitrage Strategies](#arbitrage-strategies)
- [Decision-Making Logic](#decision-making-logic)
- [Opportunity Detection (BullX / Pump.fun-style)](#opportunity-detection)
- [Security & Risk Management](#security--risk-management)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Running the Bot](#running-the-bot)
- [Testing](#testing)
- [Scalability for Small Capital ($10–$50)](#scalability-for-small-capital)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

---

## Features

| Category | Capability |
|---|---|
| **Arbitrage Methods** | Cross-exchange, Triangular, Flash Loan, Token Sniper, Cross-chain |
| **Exchanges** | Binance, Bybit, Kraken, Poloniex, Gate.io, KuCoin |
| **Fee Modeling** | Per-exchange maker/taker fees + transfer fees baked into every profit calculation |
| **Latency Risk** | Per-exchange latency estimates reduce net profit to prevent phantom profits |
| **Risk Management** | Position sizing, stop-loss, max-risk exposure (10%), front-run protection |
| **Sniper Bot** | New token detection via DappRadar + LiveCoinWatch with security scoring |
| **Flash Loans** | Aave v3-style flash loan orchestration with gas-aware profitability gating |
| **MEV Protection** | Flashbots bundle support to prevent sandwich attacks |
| **Monitoring** | Health checks, alert system, performance dashboard |
| **Reporting** | Real-time profit/gas/performance metrics |

---

## Architecture Overview

```
src/
├── core/                  # Main orchestrator + price scanner
│   ├── arbitrageOrchestrator.ts   # Master loop: kicks off all strategies
│   └── priceScanner.ts            # Cross-exchange price comparison
├── triangular.ts          # Triangular arbitrage (A→B→C→A within one exchange)
├── defi/
│   └── flashLoanManager.ts        # Flash loan opportunity finder
├── sniping/
│   ├── tokenSniper.ts             # New token detection + analysis
│   ├── contractAnalyzer.ts        # On-chain contract security analysis
│   └── apis/                      # LiveCoinWatch, DappRadar, QuillAI connectors
├── exchanges/
│   ├── exchangeManager.ts         # CCXT-based multi-exchange wrapper
│   └── gateio.ts                  # Gate.io native REST implementation
├── profit/
│   └── profitManager.ts           # Fee-aware profitability engine
├── risk/                  # Market risk analysis, position control
├── security/              # Front-run guard, transaction protection
├── monitoring/            # Health checks, alerts, price monitor
├── strategies/            # Entry/exit strategies with multi-chain support
├── crosschain/            # Cross-chain bridge connector + opportunity finder
├── mev/                   # MEV protection (Flashbots bundle)
├── ml/                    # ML price predictor (optional)
└── tests/                 # Jest test suites
```

---

## Arbitrage Strategies

### 1. Cross-Exchange Arbitrage (Singular)
Detects the same trading pair trading at different prices on two exchanges simultaneously.

```
Buy BTC/USDT on Exchange A at $40,000 → Sell on Exchange B at $40,300 → ~0.75% gross profit
```

Implemented in: `src/core/priceScanner.ts`

### 2. Triangular Arbitrage
Exploits price inefficiencies across three currency pairs on the **same exchange**.

```
USDT → BTC → ETH → USDT (profit from circular trade)
```

Implemented in: `src/triangular.ts`  
Supported base assets: `USDT`, `BTC`, `ETH`  
Supported exchanges: Binance, Bybit, Kraken, Poloniex, Gate.io

### 3. Flash Loan Arbitrage
Borrows large amounts of capital (e.g., $100,000 USDT) without collateral, executes an arbitrage cycle, and repays within the same transaction. Zero initial capital required; profit must exceed Aave fee (~0.09%) + gas.

Implemented in: `src/defi/flashLoanManager.ts`  
Smart contracts: `src/contracts/FlashLoanArbitrage.sol`

### 4. Token Sniper Bot
Monitors for newly listed tokens on Uniswap V2/V3 (via factory `PairCreated` events) and token listing APIs. Automatically evaluates security, liquidity, and holder distribution before considering a buy.

```
New PairCreated event → Security analysis (QuillAI) → Liquidity check → Tax check → Buy decision
```

Implemented in: `src/sniping/tokenSniper.ts`  
Data sources: LiveCoinWatch, DappRadar, QuillAI (optional)

### 5. Cross-Chain Arbitrage
Identifies the same token trading at different prices on different blockchains and routes a bridge transaction to capture the spread.

Implemented in: `src/crosschain/`

---

## Decision-Making Logic

Every detected opportunity goes through a **multi-stage profitability gate** before execution:

```
Opportunity Detected
       │
       ▼
[1] Gross profit % calculated from raw price difference
       │
       ▼
[2] Exchange fees deducted (buy-side + sell-side + transfer)
       │
       ▼
[3] Latency risk deducted (each 100 ms ≈ 0.02% price-move risk)
       │
       ▼
[4] Net profit compared against minimum threshold (0.3%)
       │
       ▼
[5] Risk score computed from leverage + latency + margin headroom
    (must be < 0.7 to proceed)
       │
       ▼
[6] Estimated USD profit must be > $0.01 (meaningful for small capital)
       │
       ▼
EXECUTE or SKIP with explanation logged
```

The logic is in `src/profit/profitManager.ts` (`analyzeProfitability`).

**Example output:**
```
EXECUTE: ~1.463% net profit (~$0.3657 on $25)
SKIP: Trade unprofitable after fees (net -0.150%)
SKIP: Risk score 0.73 too high
```

### Fee Table (built-in)

| Exchange | Fee (%) |
|---|---|
| Binance | 0.10% |
| Bybit | 0.10% |
| KuCoin | 0.10% |
| Kraken | 0.20% |
| Poloniex | 0.20% |
| Gate.io | 0.20% |

---

## Opportunity Detection

Inspired by **BullX Neo** and **pump.fun**-style sniping tools, the bot monitors:

- **New token pairs** on Uniswap V2 via factory event listening
- **Trending tokens** via LiveCoinWatch's new listing endpoint
- **DApp rankings / new DApps** via DappRadar API

For every new token:
1. **Contract security check** (honeypot detection, contract verification, liquidity lock)
2. **Tax analysis** (buy tax ≤ 10%, sell tax ≤ 10%)
3. **Holder distribution** (minimum configurable holder count)
4. **Liquidity depth** (minimum $50,000 default)
5. **Security score threshold** (minimum 70/100)

Configured via `SnipingConfig` in `src/sniping/types/interfaces.ts`.

---

## Security & Risk Management

### Transaction-Level
- **Front-run guard** (`src/security/guards/frontRunGuard.ts`): Creates private transaction bundles with Flashbots to prevent MEV bots from sandwiching trades.
- **MEV Protector** (`src/mev/protector.ts`): Wraps outgoing transactions in Flashbots bundles.
- **Slippage protector** (`src/strategy/slippageProtector.ts`): Enforces max 2% slippage limit.

### Portfolio-Level
- **Maximum risk exposure**: 10% of capital per trade (hardcoded in `RiskManager`).
- **Risk score gate**: Trades with risk score ≥ 0.7 are automatically skipped.
- **Position controller**: Calculates stop-loss and take-profit levels dynamically.

### Smart Contract Security
- `FlashLoanArbitrage.sol` tracks consecutive failures; halts after `maxConsecutiveFailures` (3) to prevent runaway gas spend.
- `riskPercentage` limits the flash loan size to 20% of available liquidity by default.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- API keys for at least one supported exchange
- (Optional) Ethereum RPC URL (Alchemy/Infura) for flash loan and sniper features

### Installation

```bash
git clone https://github.com/ezik3/crypto-arbitrage-bot.git
cd crypto-arbitrage-bot
npm install
cp .env.example .env  # then fill in your API keys
```

---

## Configuration

Edit `src/config.ts` to adjust:

| Setting | Default | Description |
|---|---|---|
| `minProfitPercent` | 0.5% | Minimum gross profit % to log an opportunity |
| `tradingPairs` | 100+ pairs | All pairs to scan across exchanges |
| `gateioSettings.maxSlippage` | 0.5% | Max accepted slippage for Gate.io |
| `gateioSettings.retryAttempts` | 3 | Retry count for Gate.io initialization |

Advanced settings (fees, latency, risk thresholds) are in `src/profit/profitManager.ts`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Exchange API keys (add only the exchanges you want to use)
BINANCE_API_KEY=your_binance_key
BINANCE_API_SECRET=your_binance_secret

BYBIT_API_KEY=your_bybit_key
BYBIT_API_SECRET=your_bybit_secret

KRAKEN_API_KEY=your_kraken_key
KRAKEN_API_SECRET=your_kraken_secret

POLONIEX_API_KEY=your_poloniex_key
POLONIEX_API_SECRET=your_poloniex_secret

GATEIO_API_KEY=your_gateio_key
GATEIO_API_SECRET=your_gateio_secret

KUCOIN_API_KEY=your_kucoin_key
KUCOIN_API_SECRET=your_kucoin_secret
KUCOIN_API_PASSPHRASE=your_kucoin_passphrase

# Blockchain / DeFi (required for flash loans and token sniper)
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Data APIs (optional but recommended for token sniping)
LIVECOINWATCH_API_KEY=your_lcw_key
DAPPRADAR_API_KEY=your_dappradar_key
QUILLAI_API_KEY=your_quillai_key   # optional – security scoring
```

---

## Running the Bot

```bash
# Production run
npm start

# Development (auto-restart on file changes)
npm run dev

# Build TypeScript to JavaScript
npm run build
```

On startup the bot will:
1. Test all configured exchange connections
2. Initialize exchange pairs
3. Begin continuous scanning every 1–3 seconds:
   - Cross-exchange price arbitrage
   - Flash loan opportunities
   - Triangular arbitrage (per-exchange)
   - New token sniping

---

## Testing

```bash
npm test
```

The test suite covers:
- **FeeCalculator**: gas/DEX/flash loan fee math
- **ProfitManager**: fee-aware and latency-aware profitability decisions for $10–$50 capital
- **TriangularArbitrage**: instantiation and safe no-price-data handling
- **ExchangeManager**: exchange lookup and initialization
- **PairManager**: pair configuration per exchange

To run a specific test file:
```bash
npx jest src/tests/core.test.ts
```

---

## Scalability for Small Capital

The bot is designed to operate profitably at **$10–$50 starting capital**:

1. **Minimum USD profit gate**: The profitability engine rejects trades where the expected dollar gain is below $0.01, preventing wasted gas/fees on sub-penny opportunities.

2. **Pair selection**: 100+ trading pairs are monitored simultaneously; small capital is best allocated to high-volume stablecoin pairs (USDC/USDT, DAI/USDT) where spreads are more frequent.

3. **Flash loans**: Allow executing on much larger notional positions ($10,000–$1,000,000) with zero upfront capital — profit is taken from the spread and Aave fee is deducted.

4. **Growth path**:
   - **$10–$50**: Focus on cross-exchange stablecoin arbitrage and triangular opportunities on Binance/Bybit (lowest fees, 0.1%).
   - **$50–$500**: Add triangular on Gate.io/KuCoin, start token sniping with small position sizes.
   - **$500+**: Activate flash loan strategies; compound profits back into capital base.

---

## Project Structure

```
src/
├── analytics/          Execution + profit + gas performance metrics
├── apis/               External API connectors
├── arbitrageController.ts  High-level arbitrage controller
├── bot.ts              Legacy bot entry point
├── config/             DEX, exchange, and API configurations
├── config.ts           Main configuration (pairs, exchanges, thresholds)
├── contracts/          Solidity smart contracts (FlashLoanArbitrage, ArbitrageExecutor)
├── core/               Orchestrator + PriceScanner
├── crosschain/         Cross-chain bridges and opportunity finder
├── dashboard/          Performance monitor + profit tracker
├── defi/               Flash loan manager
├── deploy/             Deployment scripts and verifiers
├── dex/                DEX router, path finder, route optimizer
├── error/              Error classification and recovery
├── exchanges/          Exchange manager + Gate.io implementation
├── execution/          Order execution engine
├── fees/               Fee calculator, tracker, and optimizer
├── flashbots/          MEV protection via Flashbots
├── flashloan.ts        Legacy flash loan module
├── flashloan/          Flash loan manager (legacy)
├── index.ts            Main entry point
├── integration/        Profit optimizer + route executor integrations
├── liquidity/          Liquidity aggregation and pool management
├── market/             Market impact + slippage analysis
├── mev/                MEV bundler and protector
├── ml/                 ML-based price prediction
├── monitoring/         Health checks, alerts, price monitor
├── monitors/           DEX + Telegram monitors
├── optimization/       Trade optimizer + real-time optimizer
├── orders/             Order execution and splitting
├── patterns/           Market pattern recognition + signal generation
├── performance/        Caching and execution optimization
├── portfolio/          Portfolio balancer and manager
├── positions/          Position management + hedging
├── profit/             Profit manager with fee-aware calculations
├── reporting/          Report generators
├── risk/               Risk manager + market risk analyzer
├── routing/            Smart router + path and split optimizers
├── security/           Front-run guard + transaction protector
├── simulation/         Mock trial simulator
├── sniper/             Sniper bot (alternate implementation)
├── sniping/            Token sniper with API integrations
├── strategies/         Entry + profit strategies
├── strategy/           Execution strategy + multi-path executor
├── test/               Integration test scripts
├── tests/              Jest test suites
├── triangular.ts       Triangular arbitrage
├── types.ts            Shared TypeScript types
├── types/              Additional type definitions
└── utils/              Pair manager, rate limiter, gas optimizer, blockchain utils
```

---

## Roadmap

- [ ] WebSocket-based price feeds (lower latency than REST polling)
- [ ] Uniswap V3 tick-based arbitrage
- [ ] Multi-hop flash loan routes (Aave → trade → Balancer → repay)
- [ ] Telegram notifications for profitable trades and alerts
- [ ] Backtesting framework against historical price data
- [ ] Docker containerization for production deployment
- [ ] Grafana dashboard for real-time metrics visualization

---

## Disclaimer

This software is for educational purposes. Cryptocurrency trading involves significant financial risk. Always test with small amounts first and never invest more than you can afford to lose. The authors are not responsible for financial losses incurred while using this software.
