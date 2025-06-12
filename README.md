# ZmartTrading – AI-Driven Crypto Bot Strategy 🚀

ZmartBot is a next-gen trading bot designed for high-precision crypto trades, combining technical strategy, multi-source scoring, vault-based risk control, and full transparency.

---

## 📦 Project Structure

| Folder         | Description                                     |
|----------------|-------------------------------------------------|
| `components/`  | React-based UI components for Dashboard & Panels |
| `data/`        | Trade logs, scoring results, vault data         |
| `docs/`        | Strategy PDFs, API scoring guides, risk formulas|

---

## 🧠 Core Logic

- **5-Step Doubling Strategy**: 1% → 2% → 4% → 8% → 12%
- **Reserve Margin**: +20% vault reserve injected at step 5 if needed
- **TP1–TP4 Profit System**:
  - TP1: +75% → sell 30%
  - TP2: 2% trailing → sell 25%
  - TP3: 3% trailing → sell 25%
  - TP4: 4% trailing → sell 20%
- **No stop loss** (liquidation protection via scaling logic)

---

## 🧮 Scoring Formula (100%)

```
TotalScore = 0.5 * CryptoMeter + 0.3 * KingFisher + 0.2 * RiskMetric
```

- 📈 **CryptoMeter**: 17 endpoints (tier-weighted)
- 🔥 **KingFisher**: Liquidation walls, TOF, long/short ratios
- 📊 **RiskMetric**: Band system and signal volatility history
- 📉 **RSI/ATR filters**: Used to qualify entry signals

---

## 🗂 Uploads per Trade Cycle

| Type               | Required per symbol |
|--------------------|---------------------|
| KingFisher Cluster | ✅ Yes              |
| Toxic Order Flow   | ✅ Yes              |
| Long/Short Ratio   | ✅ One for all      |

---

## 🛠 How to Use

1. Fork/clone this repo
2. Connect API keys via `.env`:
```env
CRYPTOMETER_API_KEY=your_key
KUCOIN_API_KEY=your_key
KUCOIN_API_SECRET=your_secret
```
3. Use `ZmartDashboard.jsx` to build the UI in Cursor or Vercel
4. Upload images for KingFisher cycles (manual or automation)
5. Add your backend logic to the `/api` folder to score + trade

---

## 🧩 Tools

- [Cryptometer.io API](https://cryptometer.io/)
- [KingFisher](https://thekingfisher.io/)
- [KuCoin Futures](https://futures.kucoin.com/)

---

## 👤 Author

> [@DansiDanutz](https://github.com/DansiDanutz) – Founder of ZmartBot  
> AI at the next level of trading.

---

## 🧠 Cursor AI Developers

Please follow the logic defined in `/docs/`, preserve file structure, and reuse components unless instructed otherwise. Reach out if real-time scoring automation or vault injection logic is unclear.
