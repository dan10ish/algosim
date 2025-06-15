"use client"

import React, { useState, useRef, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Trade {
  price: number;
  quantity: number;
  timestamp: number;
}

interface TradingChartProps {
  trades: Trade[];
}

export function TradingChart({ trades }: TradingChartProps) {
  const [chartData, setChartData] = useState<Array<{time: string, price: number, volume: number}>>([]);
  const previousTradesLength = useRef(trades.length);

  // Update chart data when trades change
  useEffect(() => {
    if (trades.length > previousTradesLength.current) {
      // Only update if we have new trades
      const last25Trades = trades.slice(0, 25).reverse();
      const newChartData = last25Trades.map((trade) => ({
        time: new Date(trade.timestamp).toLocaleTimeString('en-US', {
          hour12: false,
          minute: '2-digit',
          second: '2-digit'
        }),
        price: trade.price,
        volume: trade.quantity
      }));
      
      setChartData(newChartData);
      previousTradesLength.current = trades.length;
    }
  }, [trades]);

  const formatTooltip = (value: number | string, name: string) => {
    if (name === 'price') {
      return [`$${Number(value).toFixed(2)}`, 'Price'];
    }
    if (name === 'volume') {
      return [Number(value).toLocaleString(), 'Volume'];
    }
    return [value, name];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Movement</CardTitle>
        <CardDescription>Last 25 trades • Real-time updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              Waiting for trade data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#374151" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#374151" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  domain={['dataMin - 0.01', 'dataMax + 0.01']}
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip
                  formatter={formatTooltip}
                  labelStyle={{ 
                    color: 'hsl(var(--foreground))',
                    backgroundColor: 'hsl(var(--background))'
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#1f2937"
                  strokeWidth={3}
                  fill="url(#colorPrice)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 