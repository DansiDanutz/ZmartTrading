import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KucoinPrice = ({ symbol = 'XBTUSDTM' }) => {
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/kucoin/price/${symbol}`, {
          withCredentials: true
        });
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

  if (loading) {
    return <div className="text-gray-500">Loading price...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="text-lg font-semibold">
      {symbol}: ${price ? parseFloat(price).toFixed(2) : 'N/A'}
    </div>
  );
};

export default KucoinPrice; 