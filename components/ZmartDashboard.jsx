
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ZmartDashboard() {
  return (
    <div className="grid gap-4 p-6 xl:grid-cols-4 md:grid-cols-2 grid-cols-1">
      <div className="xl:col-span-1 hidden xl:block">
        <div className="space-y-2 p-2">
          <h2 className="text-lg font-bold">Zmart Bot</h2>
          <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
          <Button variant="ghost" className="w-full justify-start">Vault</Button>
          <Button variant="outline" className="w-full justify-start text-green-500">Analytics</Button>
        </div>
      </div>
      <div className="xl:col-span-3 space-y-4">
        <Card><CardContent className="p-4">Trading Signals & Score Breakdown</CardContent></Card>
      </div>
    </div>
  );
}
