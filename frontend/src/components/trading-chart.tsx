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
  // Convert trades to chart data format
  const chartData = React.useMemo(() => {
    if (trades.length === 0) return [];
    
    // Take last 50 trades and format for chart
    return trades
      .slice(0, 50)
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
  }, [trades]);

  const currentPrice = trades.length > 0 ? trades[0].price : 0;
  const priceChange = chartData.length > 1 ? 
    ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
        <CardDescription>
          Real-time price movement • Current: ${currentPrice.toFixed(2)}
          {priceChange !== 0 && (
            <span className={`ml-2 ${priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey="price"
              type="linear"
              fill="var(--color-primary)"
              fillOpacity={0.1}
              stroke="var(--color-primary)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 