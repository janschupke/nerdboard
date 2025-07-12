interface PriceDisplayProps {
  price: number;
  change?: number;
  changePercentage?: number;
  currency?: string;
  className?: string;
}

export function PriceDisplay({
  price,
  change,
  changePercentage,
  currency = '$',
  className = '',
}: PriceDisplayProps) {
  const formatPrice = (value: number) => {
    return `${currency}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getChangeColor = () => {
    if (!change && !changePercentage) return 'text-theme-muted';
    const value = changePercentage ?? (change ? (change / price) * 100 : 0);
    return value >= 0 ? 'text-success-600' : 'text-error-600';
  };

  const getChangeIcon = () => {
    if (!change && !changePercentage) return null;
    const value = changePercentage ?? (change ? (change / price) * 100 : 0);
    return value >= 0 ? '↗' : '↘';
  };

  return (
    <div className={className}>
      <div className="text-lg font-semibold">{formatPrice(price)}</div>
      {(change !== undefined || changePercentage !== undefined) && (
        <div className={`text-sm flex items-center space-x-1 ${getChangeColor()}`}>
          <span>{getChangeIcon()}</span>
          <span>
            {changePercentage !== undefined
              ? `${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(2)}%`
              : change !== undefined
                ? `${change >= 0 ? '+' : ''}${formatPrice(change)}`
                : ''}
          </span>
        </div>
      )}
    </div>
  );
}
