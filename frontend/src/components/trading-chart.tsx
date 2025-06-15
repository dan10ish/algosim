"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface Trade {
  price: number;
  quantity: number;
  timestamp: number;
}

interface TradingChartProps {
  trades: Trade[];
}

const chartConfig = {
  price: {
    label: "Price",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function TradingChart({ trades }: TradingChartProps) {
  // Convert trades to chart data format with memoization for performance
  const chartData = React.useMemo(() => {
    if (trades.length === 0) return [];
    
    // Take last 30 trades for better performance and format for chart
    return trades
      .slice(0, 30)
      .reverse()
      .map((trade, index) => ({
        time: new Date(trade.timestamp).toLocaleTimeString('en-US', { 
          hour12: false, 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        price: trade.price,
        volume: trade.quantity,
      }));
  }, [trades.slice(0, 30).map(t => `${t.timestamp}-${t.price}`).join(',')]);

  const currentPrice = trades.length > 0 ? trades[0].price : 0;
  const priceChange = chartData.length > 1 ? 
    ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Price Chart</CardTitle>
        <CardDescription>
          Current: ${currentPrice.toFixed(2)}
          {priceChange !== 0 && (
            <span className={`ml-2 ${priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 8,
              right: 8,
              top: 8,
              bottom: 8,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              interval="preserveStartEnd"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey="price"
              type="monotone"
              fill="var(--color-primary)"
              fillOpacity={0.1}
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 