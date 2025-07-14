import React, { useMemo } from 'react';

interface PriceDisplayProps {
  price: number;
  currency?: string;
  className?: string;
  showChange?: boolean;
  changeValue?: number;
  changePercent?: number;
}

export const PriceDisplay = React.memo<PriceDisplayProps>(
  ({
    price,
    currency = 'USD',
    className = '',
    showChange = false,
    changeValue = 0,
    changePercent = 0,
  }) => {
    // Memoize formatted price
    const formattedPrice = useMemo(() => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    }, [price, currency]);

    // Memoize change display
    const changeDisplay = useMemo(() => {
      if (!showChange) return null;

      const isPositive = changeValue >= 0;
      const changeClass = isPositive ? 'text-success-600' : 'text-error-600';
      const changeSymbol = isPositive ? '+' : '';

      return (
        <span className={`text-sm ${changeClass}`}>
          {changeSymbol}
          {changeValue.toFixed(2)} ({changeSymbol}
          {changePercent.toFixed(2)}%)
        </span>
      );
    }, [showChange, changeValue, changePercent]);

    return (
      <div className={`flex flex-col ${className}`}>
        <span className="font-mono text-lg font-semibold">{formattedPrice}</span>
        {changeDisplay}
      </div>
    );
  },
);
