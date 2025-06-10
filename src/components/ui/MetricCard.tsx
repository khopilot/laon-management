import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Progress } from './progress';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  progress?: {
    value: number;
    max?: number;
    color?: 'default' | 'destructive' | 'secondary';
  };
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  borderColor?: string;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
  badge,
  borderColor = 'border-l-blue-500',
  className = '',
  onClick
}) => {
  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card 
      className={`border-l-4 ${borderColor} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main Value */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {badge && (
            <Badge variant={badge.variant} className="text-xs">
              {badge.text}
            </Badge>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className="text-sm text-gray-600 font-medium">
            {subtitle}
          </div>
        )}

        {/* Trend */}
        {trend && (
          <div className={`flex items-center space-x-2 text-xs ${getTrendColor(trend.direction)}`}>
            <span className="font-medium">
              {getTrendIcon(trend.direction)} {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-gray-500">{trend.label}</span>
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div className="space-y-1">
            <Progress 
              value={progress.value} 
              max={progress.max} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{progress.value.toFixed(1)}%</span>
              {progress.max && <span>of {progress.max}</span>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 