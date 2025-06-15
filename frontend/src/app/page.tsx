// frontend-nextjs/src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

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
                setTrades(prevTrades => [newTrade, ...prevTrades.slice(0, 49)]); // Keep only last 50 trades
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

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Connected',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Disconnected',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    };

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        
                        {/* Connection Status */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Trading Dashboard</h2>
                            <Badge variant={readyState === ReadyState.OPEN ? "default" : "destructive"}>
                                {connectionStatus[readyState]}
                            </Badge>
                        </div>

                        {/* Market Overview Cards */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Last Price</CardDescription>
                                    <CardTitle className="text-2xl">${lastTradePrice.toFixed(2)}</CardTitle>
                                </CardHeader>
                            </Card>
                            
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Spread</CardDescription>
                                    <CardTitle className="text-2xl">${spread.toFixed(2)}</CardTitle>
                                    <CardDescription>{spreadPercent}%</CardDescription>
                                </CardHeader>
                            </Card>
                            
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Volume</CardDescription>
                                    <CardTitle className="text-2xl">{totalVolume.toLocaleString()}</CardTitle>
                                </CardHeader>
                            </Card>
                            
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Best Bid/Ask</CardDescription>
                                    <CardTitle className="text-xl">${topBid.toFixed(2)} / ${topAsk.toFixed(2)}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Order Book and Trades */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            
                            {/* Order Book - Bids */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bids</CardTitle>
                                    <CardDescription>Buy orders</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Price</TableHead>
                                                <TableHead className="text-right">Size</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bookData.bids.slice(0, 10).map(([price, size], index) => (
                                                <TableRow key={`bid-${price}`}>
                                                    <TableCell className="font-mono">{price}</TableCell>
                                                    <TableCell className="text-right font-mono">{size}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Order Book - Asks */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Asks</CardTitle>
                                    <CardDescription>Sell orders</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Price</TableHead>
                                                <TableHead className="text-right">Size</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bookData.asks.slice(0, 10).map(([price, size], index) => (
                                                <TableRow key={`ask-${price}`}>
                                                    <TableCell className="font-mono">{price}</TableCell>
                                                    <TableCell className="text-right font-mono">{size}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Recent Trades */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Trades</CardTitle>
                                    <CardDescription>Latest executions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead className="text-right">Size</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {trades.slice(0, 10).map((trade) => (
                                                <TableRow key={trade.timestamp}>
                                                    <TableCell className="font-mono">
                                                        {new Date(trade.timestamp).toLocaleTimeString()}
                                                    </TableCell>
                                                    <TableCell className="font-mono">${trade.price.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right font-mono">{trade.quantity}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
