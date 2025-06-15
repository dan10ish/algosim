// frontend-nextjs/src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { OrderBook } from '@/components/order-book';
import { TradeLog, Trade } from '@/components/trade-log';

export default function Home() {
    // State for the order book data.
    const [bookData, setBookData] = useState({ bids: [], asks: [] });
    // State for the list of trades.
    const [trades, setTrades] = useState<Trade[]>([]);

    // The URL of our Python WebSocket bridge.
    // Note: We use 8001 because that's the port we mapped in docker-compose.yml.
    const WS_URL = 'ws://localhost:8001/ws';

    // The useWebSocket hook from react-use-websocket.
    const { lastJsonMessage, readyState } = useWebSocket(WS_URL, {
        shouldReconnect: (closeEvent) => true, // Automatically reconnect on close.
    });

    // This useEffect hook runs whenever a new JSON message is received from the WebSocket.
    useEffect(() => {
        if (lastJsonMessage) {
            const message = lastJsonMessage as any; // Cast to 'any' for simplicity

            // Check the 'type' field of the message to decide how to update state.
            if (message.type === 'book') {
                setBookData(message.payload);
            } else if (message.type === 'trade') {
                // Add the new trade to the beginning of the trades array.
                // Also add a timestamp for unique keying and display.
                const newTrade = {...message.payload, timestamp: Date.now() };
                setTrades(prevTrades => [newTrade, ...prevTrades]);
            }
        }
    }, [lastJsonMessage]); // The dependency array ensures this hook only runs when lastJsonMessage changes.

    // A mapping from ReadyState enum to human-readable strings.
    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    };

    return (
        <main className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">AlgoSim Real-Time Dashboard</h1>
                <p>Connection: <span className={readyState === ReadyState.OPEN ? 'text-green-500' : 'text-red-500'}>{connectionStatus[readyState]}</span></p>
            </div>

            <OrderBook data={bookData} />
            <TradeLog trades={trades} />
        </main>
    );
}
