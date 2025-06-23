import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Symbols = () => {
  const [activeTab, setActiveTab] = useState('kucoin');
  const [kucoinSymbols, setKucoinSymbols] = useState([]);
  const [mySymbols, setMySymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symbolPrices, setSymbolPrices] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [error, setError] = useState('');
  const [marketStats, setMarketStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('symbol');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true
  });

  useEffect(() => {
    loadSymbols();
    loadMySymbols();
    loadMarketStats();
  }, []);

  useEffect(() => {
    if (mySymbols.length > 0) {
      fetchSymbolPrices();
      const interval = setInterval(fetchSymbolPrices, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [mySymbols]);

  const loadSymbols = async () => {
    try {
      setLoading(true);
      const response = await api.get('/kucoin/contracts');
      if (response.data.contracts) {
        setKucoinSymbols(response.data.contracts);
      } else {
        // Fallback to predefined list if API fails
        const commonFuturesSymbols = [
          'XBTUSDTM', 'ETHUSDTM', 'SOLUSDTM', 'BNBUSDTM', 'ADAUSDTM',
          'DOTUSDTM', 'LINKUSDTM', 'UNIUSDTM', 'LTCUSDTM', 'BCHUSDTM',
          'XRPUSDTM', 'EOSUSDTM', 'TRXUSDTM', 'FILUSDTM', 'NEARUSDTM',
          'AVAXUSDTM', 'MATICUSDTM', 'ATOMUSDTM', 'FTMUSDTM', 'ALGOUSDTM',
          'ICPUSDTM', 'VETUSDTM', 'THETAUSDTM', 'XTZUSDTM', 'HBARUSDTM',
          'MANAUSDTM', 'SANDUSDTM', 'AXSUSDTM', 'GALAUSDTM', 'CHZUSDTM',
          'ENJUSDTM', 'BATUSDTM', 'ZILUSDTM', 'IOTAUSDTM', 'NEOUSDTM',
          'QTUMUSDTM', 'ONTUSDTM', 'ZECUSDTM', 'DASHUSDTM', 'XMRUSDTM'
        ];
        setKucoinSymbols(commonFuturesSymbols.map(symbol => ({ symbol, status: 'Open' })));
      }
    } catch (error) {
      console.error('Error loading symbols:', error);
      setError('Failed to load KuCoin symbols');
    } finally {
      setLoading(false);
    }
  };

  const loadMarketStats = async () => {
    try {
      const response = await api.get('/kucoin/market-stats');
      if (response.data) {
        setMarketStats(response.data);
      }
    } catch (error) {
      console.error('Error loading market stats:', error);
    }
  };

  const loadMySymbols = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem('mySymbols');
    if (saved) {
      setMySymbols(JSON.parse(saved));
    }
  };

  const saveMySymbols = (symbols) => {
    localStorage.setItem('mySymbols', JSON.stringify(symbols));
    setMySymbols(symbols);
  };

  const fetchSymbolPrices = async () => {
    try {
      const prices = {};
      for (const symbol of mySymbols) {
        try {
          const response = await api.get(`/kucoin/price/${symbol}`);
          prices[symbol] = response.data;
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          // Use mock data for demo
          prices[symbol] = {
            price: (Math.random() * 50000 + 1000).toFixed(2),
            mark_price: (Math.random() * 50000 + 1000).toFixed(2),
            high_24h: (Math.random() * 55000 + 1000).toFixed(2),
            low_24h: (Math.random() * 45000 + 1000).toFixed(2),
            volume_24h: (Math.random() * 1000000 + 100000).toFixed(0),
            price_change_pct_24h: (Math.random() * 20 - 10).toFixed(2),
            funding_rate: (Math.random() * 0.002 - 0.001).toFixed(6),
            timestamp: new Date().toISOString()
          };
        }
      }
      setSymbolPrices(prices);
    } catch (error) {
      console.error('Error fetching symbol prices:', error);
    }
  };

  const addSymbol = (symbol) => {
    if (mySymbols.includes(symbol)) {
      setError('Symbol already in your list');
      return;
    }

    if (mySymbols.length >= 10) {
      setError('Maximum 10 symbols allowed. Please remove one first.');
      return;
    }

    const newSymbols = [...mySymbols, symbol];
    saveMySymbols(newSymbols);
    setSelectedSymbol('');
    setError('');
  };

  const removeSymbol = (symbolToRemove) => {
    const newSymbols = mySymbols.filter(symbol => symbol !== symbolToRemove);
    saveMySymbols(newSymbols);
  };

  const replaceSymbol = (oldSymbol, newSymbol) => {
    if (mySymbols.includes(newSymbol)) {
      setError('Symbol already in your list');
      return;
    }

    const newSymbols = mySymbols.map(symbol => 
      symbol === oldSymbol ? newSymbol : symbol
    );
    saveMySymbols(newSymbols);
    setError('');
  };

  const getMarketCondition = (priceChangePct) => {
    if (priceChangePct > 2) return 'bullish';
    if (priceChangePct < -2) return 'bearish';
    return 'neutral';
  };

  const getTrendArrow = (condition) => {
    switch (condition) {
      case 'bullish':
        return '↗️';
      case 'bearish':
        return '↘️';
      default:
        return '→';
    }
  };

  const getTrendColor = (condition) => {
    switch (condition) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatSymbol = (symbol) => {
    return symbol.replace('USDTM', '/USDT');
  };

  const formatNumber = (num, decimals = 2) => {
    if (!num) return '0';
    return parseFloat(num).toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatVolume = (volume) => {
    if (!volume) return '0';
    const num = parseFloat(volume);
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(0);
  };

  const getFilteredAndSortedSymbols = () => {
    let filtered = kucoinSymbols.filter(symbol => {
      const symbolStr = typeof symbol === 'string' ? symbol : symbol.symbol;
      const status = typeof symbol === 'string' ? 'Open' : symbol.status;
      
      const matchesSearch = symbolStr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sort symbols
    filtered.sort((a, b) => {
      const aVal = typeof a === 'string' ? a : a[sortBy];
      const bVal = typeof b === 'string' ? b : b[sortBy];
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  const getFundingRateColor = (rate) => {
    if (!rate) return 'text-gray-400';
    const numRate = parseFloat(rate);
    if (numRate > 0.0001) return 'text-green-400';
    if (numRate < -0.0001) return 'text-red-400';
    return 'text-gray-400';
  };

  const refreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadSymbols(),
        loadMarketStats(),
        fetchSymbolPrices()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading symbols...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#181A20] rounded-2xl p-6 border border-[#23272F]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Symbols Management</h1>
            <p className="text-[#b0b8c1]">Manage your trading symbols and monitor market data</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="bg-[#00FF94] hover:bg-[#00cc74] disabled:bg-[#23272F] text-[#181A20] px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="w-12 h-12 bg-[#00FF94] rounded-xl flex items-center justify-center">
              <span className="text-[#181A20] font-semibold text-lg">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* My Symbols Card */}
      <div className="bg-[#181A20] rounded-2xl p-6 border border-[#23272F]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">My Symbols</h2>
            <p className="text-[#b0b8c1]">Your selected trading symbols ({mySymbols.length}/10)</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00FF94] rounded-full animate-pulse"></div>
            <span className="text-[#00FF94] text-sm font-medium">Live</span>
          </div>
        </div>

        {mySymbols.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#23272F] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#b0b8c1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-[#b0b8c1] mb-2">No symbols added yet</p>
            <p className="text-[#b0b8c1] text-sm">Go to KuCoin Symbols tab to add your first symbol</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {mySymbols.map((symbol) => {
              const priceData = symbolPrices[symbol];
              const condition = priceData ? getMarketCondition(parseFloat(priceData.price_change_pct_24h || 0)) : 'neutral';
              
              return (
                <div key={symbol} className="bg-[#181A20] rounded-xl p-4 border border-[#23272F] hover:border-[#00FF94] transition-all duration-300 group">
                  {/* Symbol Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#23272F] rounded-lg flex items-center justify-center">
                        <span className="text-[#00FF94] font-semibold text-xs">
                          {symbol.replace('USDTM', '').substring(0, 3)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{formatSymbol(symbol)}</h3>
                        <p className="text-[#b0b8c1] text-xs">Futures</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSymbol(symbol)}
                      className="text-[#00FF94] hover:text-[#181A20] p-1 rounded-lg hover:bg-[#00FF94]/20 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove symbol"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Price Display */}
                  <div className="mb-3">
                    <div className="text-lg font-bold text-[#00FF94] mb-1">
                      ${priceData ? formatNumber(priceData.price) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm ${condition === 'bullish' ? 'text-[#00FF94]' : condition === 'bearish' ? 'text-red-400' : 'text-[#b0b8c1]'}`}> {getTrendArrow(condition)} </span>
                      <span className={`text-xs font-medium ${condition === 'bullish' ? 'text-[#00FF94]' : condition === 'bearish' ? 'text-red-400' : 'text-[#b0b8c1]'}`}> {parseFloat(priceData?.price_change_pct_24h || 0).toFixed(2)}% </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  {priceData && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#b0b8c1]">Vol:</span>
                        <span className="text-white">{formatVolume(priceData.volume_24h)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#b0b8c1]">24h High:</span>
                        <span className="text-[#00FF94] font-medium">${formatNumber(priceData.high_24h)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#b0b8c1]">24h Low:</span>
                        <span className="text-red-400 font-medium">${formatNumber(priceData.low_24h)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#b0b8c1]">Funding:</span>
                        <span className={`font-medium ${parseFloat(priceData.funding_rate || 0) > 0 ? 'text-[#00FF94]' : parseFloat(priceData.funding_rate || 0) < 0 ? 'text-red-400' : 'text-[#b0b8c1]'}`}> {(parseFloat(priceData.funding_rate || 0) * 100).toFixed(3)}% </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#b0b8c1]">Mark:</span>
                        <span className="text-white">${formatNumber(priceData.mark_price)}</span>
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="mt-3 pt-2 border-t border-[#23272F]">
                    <p className="text-[#b0b8c1] text-xs">
                      {priceData?.timestamp ? new Date(priceData.timestamp).toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {mySymbols.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#23272F]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#23272F] rounded-lg p-3">
                <p className="text-[#b0b8c1] text-xs mb-1">Total Symbols</p>
                <p className="text-white text-lg font-bold">{mySymbols.length}/10</p>
              </div>
              <div className="bg-[#23272F] rounded-lg p-3">
                <p className="text-[#b0b8c1] text-xs mb-1">Avg Change 24h</p>
                <p className="text-white text-lg font-bold">
                  {(() => {
                    const changes = Object.values(symbolPrices).map(data => parseFloat(data?.price_change_pct_24h || 0));
                    const avg = changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;
                    return `${avg >= 0 ? '+' : ''}${avg.toFixed(2)}%`;
                  })()}
                </p>
              </div>
              <div className="bg-[#23272F] rounded-lg p-3">
                <p className="text-[#b0b8c1] text-xs mb-1">Total Volume</p>
                <p className="text-white text-lg font-bold">
                  {formatVolume(Object.values(symbolPrices).reduce((sum, data) => sum + parseFloat(data?.volume_24h || 0), 0))}
                </p>
              </div>
              <div className="bg-[#23272F] rounded-lg p-3">
                <p className="text-[#b0b8c1] text-xs mb-1">Status</p>
                <p className="text-[#00FF94] text-lg font-bold">Live</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Bar */}
      {marketStats && (
        <div className="bg-[#181A20] rounded-xl p-4 border border-[#23272F]">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[#00FF94]">📈</span>
                <span className="text-[#b0b8c1]">Bullish: {marketStats.top_gainers?.filter(c => parseFloat(c.priceChgPct || 0) > 2).length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">📉</span>
                <span className="text-[#b0b8c1]">Bearish: {marketStats.top_losers?.filter(c => parseFloat(c.priceChgPct || 0) < -2).length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#b0b8c1]">➡️</span>
                <span className="text-[#b0b8c1]">Neutral: {marketStats.total_contracts - (marketStats.top_gainers?.filter(c => parseFloat(c.priceChgPct || 0) > 2).length || 0) - (marketStats.top_losers?.filter(c => parseFloat(c.priceChgPct || 0) < -2).length || 0)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[#b0b8c1] text-xs">Last Updated</p>
                <p className="text-white font-medium">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="w-2 h-2 bg-[#00FF94] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Market Statistics */}
      {marketStats && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Market Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Total Contracts</p>
                <p className="text-white text-2xl font-bold">{marketStats.total_contracts}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">24h Volume</p>
                <p className="text-white text-2xl font-bold">{formatVolume(marketStats.total_volume_24h)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">24h Turnover</p>
                <p className="text-white text-2xl font-bold">${formatVolume(marketStats.total_turnover_24h)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Open Interest</p>
                <p className="text-white text-2xl font-bold">{formatVolume(marketStats.total_open_interest)}</p>
              </div>
            </div>
          </div>

          {/* Market Movers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Gainers */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-green-400">📈</span>
                Top Gainers (24h)
              </h4>
              <div className="space-y-3">
                {marketStats.top_gainers?.slice(0, 5).map((contract, index) => (
                  <div key={contract.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-green-400 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{formatSymbol(contract.symbol)}</p>
                        <p className="text-gray-400 text-xs">Vol: {formatVolume(contract.volumeOf24h)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">+{parseFloat(contract.priceChgPct || 0).toFixed(2)}%</p>
                      <p className="text-gray-400 text-xs">${formatNumber(contract.lastTradePrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl p-6 border border-red-500/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-red-400">📉</span>
                Top Losers (24h)
              </h4>
              <div className="space-y-3">
                {marketStats.top_losers?.slice(0, 5).map((contract, index) => (
                  <div key={contract.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-red-400 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{formatSymbol(contract.symbol)}</p>
                        <p className="text-gray-400 text-xs">Vol: {formatVolume(contract.volumeOf24h)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-semibold">{parseFloat(contract.priceChgPct || 0).toFixed(2)}%</p>
                      <p className="text-gray-400 text-xs">${formatNumber(contract.lastTradePrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Add Section */}
          {marketStats && mySymbols.length < 10 && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-yellow-400">⚡</span>
                Quick Add Trending Symbols
              </h4>
              <div className="flex flex-wrap gap-2">
                {marketStats.top_gainers?.slice(0, 3).map((contract) => {
                  const symbolStr = contract.symbol;
                  const isInMyList = mySymbols.includes(symbolStr);
                  
                  return (
                    <button
                      key={symbolStr}
                      onClick={() => !isInMyList && addSymbol(symbolStr)}
                      disabled={isInMyList}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        isInMyList
                          ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20 hover:border-yellow-500/30 border border-white/20'
                      }`}
                    >
                      <span>{formatSymbol(symbolStr)}</span>
                      <span className={parseFloat(contract.priceChgPct || 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {parseFloat(contract.priceChgPct || 0).toFixed(1)}%
                      </span>
                      {isInMyList && <span className="text-green-400">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex border-b border-[#23272F]">
          <button
            onClick={() => setActiveTab('kucoin')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
              ${activeTab === 'kucoin'
                ? 'bg-[#181A20] text-[#00FF94] border-b-2 border-[#00FF94] border-l-2 border-r-2 border-t-2 border-[#00FF94] rounded-t-lg'
                : 'bg-[#181A20] text-white border-b-2 border-transparent hover:bg-[#00FF94] hover:text-white hover:border-[#00FF94]'}
            `}
          >
            <span className={`text-lg ${activeTab === 'kucoin' ? 'text-[#00FF94]' : ''}`}>📈</span>
            KuCoin Symbols ({kucoinSymbols.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
              ${activeTab === 'my'
                ? 'bg-[#181A20] text-[#00FF94] border-b-2 border-[#00FF94] border-l-2 border-r-2 border-t-2 border-[#00FF94] rounded-t-lg'
                : 'bg-[#181A20] text-white border-b-2 border-transparent hover:bg-[#00FF94] hover:text-white hover:border-[#00FF94]'}
            `}
          >
            <span className={`text-lg ${activeTab === 'my' ? 'text-[#00FF94]' : ''}`}>⭐</span>
            My Symbols ({mySymbols.length})
          </button>
        </div>

        <div className="p-6">
          {/* KuCoin Symbols Tab */}
          {activeTab === 'kucoin' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Add Symbol to My List</h3>
                <p className="text-gray-300 mb-6">
                  Select a symbol from the available KuCoin futures symbols to add to your trading list.
                </p>
                
                <div className="flex gap-4">
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a symbol...</option>
                    {kucoinSymbols.map((symbol) => {
                      const symbolStr = typeof symbol === 'string' ? symbol : symbol.symbol;
                      return (
                        <option key={symbolStr} value={symbolStr}>
                          {formatSymbol(symbolStr)}
                        </option>
                      );
                    })}
                  </select>
                  <button
                    onClick={() => addSymbol(selectedSymbol)}
                    disabled={!selectedSymbol || mySymbols.length >= 10}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Add Symbol
                  </button>
                </div>
                
                {mySymbols.length >= 10 && (
                  <p className="text-yellow-400 text-sm mt-2">
                    ⚠️ Maximum 10 symbols reached. Remove one to add another.
                  </p>
                )}
              </div>

              {/* Search and Filter Controls */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search symbols..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="symbol">Symbol</option>
                      <option value="volumeOf24h">Volume</option>
                      <option value="priceChgPct">Change %</option>
                      <option value="openInterest">Open Interest</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
                  <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Symbols Grid */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-xl font-semibold text-white">Available KuCoin Futures Symbols</h3>
                  <p className="text-gray-400 text-sm mt-1">Showing {getFilteredAndSortedSymbols().length} of {kucoinSymbols.length} symbols</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {getFilteredAndSortedSymbols().map((symbol) => {
                      const symbolStr = typeof symbol === 'string' ? symbol : symbol.symbol;
                      const status = typeof symbol === 'string' ? 'Open' : symbol.status;
                      const isInMyList = mySymbols.includes(symbolStr);
                      
                      return (
                        <div
                          key={symbolStr}
                          className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                            isInMyList
                              ? 'bg-green-500/20 border-green-500/30 text-green-400'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-blue-500/30'
                          }`}
                          onClick={() => !isInMyList && setSelectedSymbol(symbolStr)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{formatSymbol(symbolStr)}</span>
                            {isInMyList && (
                              <span className="text-green-400">✓</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            Status: {status}
                          </div>
                          {typeof symbol !== 'string' && (
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Volume:</span>
                                <span>{formatVolume(symbol.volumeOf24h)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Change:</span>
                                <span className={parseFloat(symbol.priceChgPct || 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                                  {parseFloat(symbol.priceChgPct || 0).toFixed(2)}%
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Leverage:</span>
                                <span className="text-blue-400">{symbol.maxLeverage}x</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Type:</span>
                                <span className="text-purple-400">{symbol.isInverse ? 'Inverse' : 'Linear'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Symbols Tab */}
          {activeTab === 'my' && (
            <div className="space-y-6">
              {mySymbols.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4">No symbols added yet</p>
                  <p className="text-gray-500 text-sm">Go to KuCoin Symbols tab to add your first symbol</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mySymbols.map((symbol) => {
                    const priceData = symbolPrices[symbol];
                    const condition = priceData ? getMarketCondition(parseFloat(priceData.price_change_pct_24h || 0)) : 'neutral';
                    
                    return (
                      <div key={symbol} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                        {/* Symbol Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {symbol.replace('USDTM', '').substring(0, 3)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{formatSymbol(symbol)}</h3>
                              <p className="text-gray-400 text-sm">Futures</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSymbol(symbol)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Remove symbol"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Price Display */}
                        <div className="mb-4">
                          <div className="text-3xl font-bold text-white mb-1">
                            ${priceData ? formatNumber(priceData.price) : 'N/A'}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg ${condition === 'bullish' ? 'text-[#00FF94]' : condition === 'bearish' ? 'text-red-400' : 'text-[#b0b8c1]'}`}>
                              {getTrendArrow(condition)}
                            </span>
                            <span className={`text-sm font-medium ${condition === 'bullish' ? 'text-[#00FF94]' : condition === 'bearish' ? 'text-red-400' : 'text-[#b0b8c1]'}`}>
                              {condition.charAt(0).toUpperCase() + condition.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Market Data */}
                        {priceData && (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">24h Change</span>
                              <span className={`font-medium ${parseFloat(priceData.price_change_pct_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {parseFloat(priceData.price_change_pct_24h || 0).toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">24h High</span>
                              <span className="text-green-400 font-medium">${formatNumber(priceData.high_24h)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">24h Low</span>
                              <span className="text-red-400 font-medium">${formatNumber(priceData.low_24h)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">Volume</span>
                              <span className="text-white font-medium">{formatVolume(priceData.volume_24h)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">Funding Rate</span>
                              <span className={`font-medium ${parseFloat(priceData.funding_rate || 0) > 0 ? 'text-[#00FF94]' : parseFloat(priceData.funding_rate || 0) < 0 ? 'text-red-400' : 'text-[#b0b8c1]'}`}>
                                {(parseFloat(priceData.funding_rate || 0) * 100).toFixed(4)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">Mark Price</span>
                              <span className="text-white font-medium">${formatNumber(priceData.mark_price)}</span>
                            </div>
                          </div>
                        )}

                        {/* Last Updated */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-gray-500 text-xs">
                            Last updated: {priceData?.timestamp ? new Date(priceData.timestamp).toLocaleTimeString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Summary Stats */}
              {mySymbols.length > 0 && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">Portfolio Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Total Symbols</p>
                      <p className="text-white text-2xl font-bold">{mySymbols.length}/10</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Avg Change 24h</p>
                      <p className="text-white text-2xl font-bold">
                        {(() => {
                          const changes = Object.values(symbolPrices).map(data => parseFloat(data?.price_change_pct_24h || 0));
                          const avg = changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;
                          return `${avg >= 0 ? '+' : ''}${avg.toFixed(2)}%`;
                        })()}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Total Volume</p>
                      <p className="text-white text-2xl font-bold">
                        {formatVolume(Object.values(symbolPrices).reduce((sum, data) => sum + parseFloat(data?.volume_24h || 0), 0))}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Market Status</p>
                      <p className="text-white text-2xl font-bold">Live</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Symbols; 