// frontend/src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { TradingChart } from '@/components/trading-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Define types for WebSocket messages
interface BookMessage {
    type: 'book';
    payload: {
        bids: [string, number][];
        asks: [string, number][];
    };
}

interface TradeMessage {
    type: 'trade';
    payload: {
        price: number;
        quantity: number;
    };
}

interface Trade {
  price: number;
  quantity: number;
  timestamp: number;
}

type WebSocketMessage = BookMessage | TradeMessage;

export default function Home() {
    // State for the order book data
    const [bookData, setBookData] = useState<{ bids: [string, number][]; asks: [string, number][] }>({ bids: [], asks: [] });
    // State for the list of trades
    const [trades, setTrades] = useState<Trade[]>([]);

    // The URL of our Python WebSocket bridge
    const WS_URL = 'ws://localhost:8001/ws';

    // The useWebSocket hook from react-use-websocket
    const { lastJsonMessage, readyState } = useWebSocket(WS_URL, {
        shouldReconnect: () => true,
    });

    // Handle WebSocket messages
    useEffect(() => {
        if (lastJsonMessage) {
            const message = lastJsonMessage as WebSocketMessage;

            if (message.type === 'book') {
                setBookData(message.payload);
            } else if (message.type === 'trade') {
                const newTrade = {...message.payload, timestamp: Date.now() };
                setTrades(prevTrades => [newTrade, ...prevTrades.slice(0, 99)]); // Keep only last 100 trades
            }
        }
    }, [lastJsonMessage]);

    // Calculate market stats
    const topBid = bookData.bids.length > 0 ? parseFloat(bookData.bids[0][0]) : 0;
    const topAsk = bookData.asks.length > 0 ? parseFloat(bookData.asks[0][0]) : 0;
    const spread = topAsk - topBid;
    const spreadPercent = topBid > 0 ? ((spread / topBid) * 100).toFixed(3) : '0.000';
    const lastTradePrice = trades.length > 0 ? trades[0].price : 0;
    const totalVolume = trades.reduce((sum, trade) => sum + trade.quantity, 0);
    
    // Calculate session stats
    const sessionHigh = trades.length > 0 ? Math.max(...trades.map(t => t.price)) : 0;
    const sessionLow = trades.length > 0 ? Math.min(...trades.map(t => t.price)) : 0;
    
    // Calculate market depth (sum of top 5 levels)
    const bidDepth = bookData.bids.slice(0, 5).reduce((sum, [, size]) => sum + size, 0);
    const askDepth = bookData.asks.slice(0, 5).reduce((sum, [, size]) => sum + size, 0);

    // Calculate trades per minute (more meaningful than total)
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentTrades = trades.filter(trade => trade.timestamp > oneMinuteAgo);
    const tradesPerMinute = recentTrades.length;

    const isConnected = readyState === ReadyState.OPEN;

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="mx-auto max-w-7xl space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">AlgoSim</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'}`}></div>
                        <Badge 
                            variant={isConnected ? "default" : "destructive"}
                            className={isConnected 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                            }
                        >
                            {isConnected ? 'Live' : 'Offline'}
                        </Badge>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Best Bid/Ask</CardDescription>
                            <CardTitle className="text-lg tabular-nums">${topBid.toFixed(2)} / ${topAsk.toFixed(2)}</CardTitle>
                            <CardDescription className="text-sm">Market depth: {bidDepth.toFixed(0)} / {askDepth.toFixed(0)}</CardDescription>
                        </CardHeader>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Last Price</CardDescription>
                            <CardTitle className="text-2xl tabular-nums">${lastTradePrice.toFixed(2)}</CardTitle>
                            <CardDescription>Session: ${sessionLow.toFixed(2)} - ${sessionHigh.toFixed(2)}</CardDescription>
                        </CardHeader>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Bid-Ask Spread</CardDescription>
                            <CardTitle className="text-2xl tabular-nums">${spread.toFixed(2)}</CardTitle>
                            <CardDescription>{spreadPercent}% of mid price</CardDescription>
                        </CardHeader>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Trading Activity</CardDescription>
                            <CardTitle className="text-2xl tabular-nums">{tradesPerMinute}</CardTitle>
                            <CardDescription>Trades per minute • Total vol: {totalVolume.toLocaleString()}</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Trading Chart */}
                <TradingChart trades={trades} />

                {/* Order Book and Trades Tables */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* Bids Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium">
                                    <span className="text-green-600 dark:text-green-400">Bids</span>
                                </CardTitle>
                                <CardDescription>
                                    {bookData.bids.length} buy orders
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                                {bidDepth.toFixed(0)}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="relative max-h-[350px] overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="sticky top-0 bg-background">Price</TableHead>
                                                <TableHead className="sticky top-0 bg-background text-right">Size</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bookData.bids.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                                        No bid orders
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                bookData.bids.map(([price, size]) => (
                                                    <TableRow key={`bid-${price}`} className="hover:bg-green-50/50 dark:hover:bg-green-950/20">
                                                        <TableCell className="font-mono text-green-600 dark:text-green-400">
                                                            ${price}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono text-green-700 dark:text-green-300">
                                                            {size.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Asks Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium">
                                    <span className="text-red-600 dark:text-red-400">Asks</span>
                                </CardTitle>
                                <CardDescription>
                                    {bookData.asks.length} sell orders
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-red-600 border-red-200 dark:text-red-400 dark:border-red-800">
                                {askDepth.toFixed(0)}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="relative max-h-[350px] overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="sticky top-0 bg-background">Price</TableHead>
                                                <TableHead className="sticky top-0 bg-background text-right">Size</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bookData.asks.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                                        No ask orders
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                bookData.asks.map(([price, size]) => (
                                                    <TableRow key={`ask-${price}`} className="hover:bg-red-50/50 dark:hover:bg-red-950/20">
                                                        <TableCell className="font-mono text-red-600 dark:text-red-400">
                                                            ${price}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono text-red-700 dark:text-red-300">
                                                            {size.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Trades Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium">Recent Trades</CardTitle>
                                <CardDescription>
                                    {trades.length} total executions
                                </CardDescription>
                            </div>
                            <Badge variant="outline">
                                {tradesPerMinute}/min
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="relative max-h-[350px] overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="sticky top-0 bg-background">Time</TableHead>
                                                <TableHead className="sticky top-0 bg-background">Price</TableHead>
                                                <TableHead className="sticky top-0 bg-background text-right">Size</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {trades.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                                        No trades yet
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                trades.map((trade) => (
                                                    <TableRow key={trade.timestamp}>
                                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                                            {new Date(trade.timestamp).toLocaleTimeString()}
                                                        </TableCell>
                                                        <TableCell className="font-mono">
                                                            ${trade.price.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            {trade.quantity.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
