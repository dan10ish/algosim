// frontend-nextjs/src/components/order-book.tsx
'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the structure for a single price level (an array of [price, quantity]).
type OrderLevel = [string, number];

// Define the structure for the entire order book data.
interface OrderBookData {
    bids: OrderLevel;
    asks: OrderLevel;
}

// Define the props for our component.
interface OrderBookProps {
    data: OrderBookData;
}

// The OrderBook component.
export function OrderBook({ data }: OrderBookProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader><CardTitle className="text-green-500">Bids (Buy Orders)</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Size</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Map over the bids array to render a row for each price level. */}
                            {data.bids.map(([price, size]) => (
                                <TableRow key={`bid-${price}`} className="text-green-500 font-mono">
                                    <TableCell>{price}</TableCell>
                                    <TableCell className="text-right">{size}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-red-500">Asks (Sell Orders)</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Size</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Map over the asks array to render a row for each price level. */}
                            {data.asks.map(([price, size]) => (
                                <TableRow key={`ask-${price}`} className="text-red-500 font-mono">
                                    <TableCell>{price}</TableCell>
                                    <TableCell className="text-right">{size}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}