// frontend-nextjs/src/components/trade-log.tsx
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the structure for a single trade.
export interface Trade {
  price: number;
  quantity: number;
  timestamp: number; // Use a simple timestamp for keying
}

interface TradeLogProps {
  trades: Trade;
}

export function TradeLog({ trades }: TradeLogProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Trade Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Render trades in reverse chronological order */}
            {trades
              .slice()
              .reverse()
              .map((trade) => (
                <TableRow key={trade.timestamp} className="font-mono">
                  <TableCell>
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{trade.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{trade.quantity}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
