import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { cn } from '../lib/utils';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#9333ea', '#0891b2'];

export const ElasticityChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="text-muted-foreground text-sm">No data available</div>;

    return (
        <div className="h-[300px] w-full">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Elasticity Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                    <YAxis
                        dataKey="product_name"
                        type="category"
                        width={120}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                    />
                    <Bar dataKey="elasticity" fill="#2563eb" radius={[0, 4, 4, 0]}>
                        {
                            data.map((entry, index) => (
                                <cell key={`cell-${index}`} fill={entry.elasticity < -1 ? '#ef4444' : '#3b82f6'} />
                            ))
                        }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const SimulationResultChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="text-muted-foreground text-sm">Run simulation to see results</div>;

    return (
        <div className="h-[400px] w-full mt-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Revenue & Profit Impact</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="product_name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="old_revenue" name="Current Revenue" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="new_revenue" name="Projected Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="new_profit" name="Projected Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
