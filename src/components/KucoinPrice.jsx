import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KucoinPrice = ({ symbol = 'XBTUSDTM' }) => {
  const [price, setPrice] = useState(null);
  const [previousPrice, setPreviousPrice] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/kucoin/price/${symbol}`, {
          withCredentials: true
        });
        setPreviousPrice(price);
        setPrice(response.data.price);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch price');
        setPrice(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  const getPriceChange = () => {
    if (!price || !previousPrice) return null;
    const change = parseFloat(price) - parseFloat(previousPrice);
    const percentChange = (change / parseFloat(previousPrice)) * 100;
    return {
      value: change,
      percent: percentChange,
      isPositive: change > 0
    };
  };

  const priceChange = getPriceChange();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 font-medium mb-2">Connection Error</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Price Display */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">₿</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{symbol.replace('USDTM', '/USDT')}</h3>
        </div>
        
        <div className="text-5xl font-bold text-white mb-2">
          ${price ? parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
        </div>
        
        {priceChange && (
          <div className={`flex items-center justify-center gap-2 text-lg font-semibold ${
            priceChange.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            <span>{priceChange.isPositive ? '↗' : '↘'}</span>
            <span>${Math.abs(priceChange.value).toFixed(2)}</span>
            <span>({priceChange.isPositive ? '+' : ''}{priceChange.percent.toFixed(2)}%)</span>
          </div>
        )}
      </div>

      {/* Price Chart Placeholder */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">Price Chart</h4>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm">Live</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Simple chart visualization */}
        <div className="h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-white/10 flex items-end justify-center p-4">
          <div className="flex items-end gap-1 h-full">
            {[20, 35, 25, 45, 30, 50, 40, 60, 55, 70, 65, 80].map((height, index) => (
              <div
                key={index}
                className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-sm transition-all duration-300 hover:scale-y-110"
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>24h Low: $42,150</span>
          <span>24h High: $43,850</span>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Volume (24h)</p>
          <p className="text-white font-semibold">$2.4B</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-gray-400 text-xs mb-1">Market Cap</p>
          <p className="text-white font-semibold">$856.2B</p>
        </div>
      </div>
    </div>
  );
};

export default KucoinPrice; 