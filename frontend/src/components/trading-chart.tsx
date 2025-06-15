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
  const lastTradeCountRef = React.useRef(0);
  const [chartData, setChartData] = React.useState<Array<{time: string; price: number; volume: number}>>([]);

  // Only update chart data when new trades are actually added
  React.useEffect(() => {
    if (trades.length === 0) {
      setChartData([]);
      lastTradeCountRef.current = 0;
      return;
    }

    // Only update if we have new trades
    if (trades.length !== lastTradeCountRef.current) {
      const newData = trades
        .slice(0, 25) // Reduced to 25 for even better performance
        .reverse()
        .map((trade) => ({
          time: new Date(trade.timestamp).toLocaleTimeString('en-US', { 
            hour12: false, 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          price: trade.price,
          volume: trade.quantity,
        }));
      
      setChartData(newData);
      lastTradeCountRef.current = trades.length;
    }
  }, [trades.length, trades[0]?.timestamp]); // More specific dependencies

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
              fillOpacity={0.08}
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 