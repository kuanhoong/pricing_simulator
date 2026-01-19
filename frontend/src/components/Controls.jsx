import React from 'react';
import { cn } from '../lib/utils';
import { RotateCcw, Play, Zap } from 'lucide-react';

export const Controls = ({ products, priceChanges, selectedProducts, onToggleProduct, onPriceChange, onRunSimulation, onOptimize, onReset }) => {
    return (
        <div className="bg-card text-card-foreground shadow-sm border border-border rounded-xl p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Configuration</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onReset}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Reset"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Price Adjustments</h3>
                    <div className="space-y-4">
                        {products.map((p) => {
                            const isSelected = selectedProducts.has(p.product_id);
                            return (
                                <div key={p.product_id} className={cn("group transition-opacity", !isSelected && "opacity-60")}>
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <input
                                            type="checkbox"
                                            checked={isSelected || false}
                                            onChange={() => onToggleProduct(p.product_id)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                                        />
                                        <div className="flex-1 flex justify-between text-sm">
                                            <span className="font-medium truncate pr-2" title={p.product_name}>{p.product_name}</span>
                                            <span className={cn(
                                                "font-mono",
                                                priceChanges[p.product_id] > 0 ? "text-green-600" : priceChanges[p.product_id] < 0 ? "text-red-600" : "text-muted-foreground",
                                                !isSelected && "invisible"
                                            )}>
                                                {((priceChanges[p.product_id] || 0) * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pl-7">
                                        <span className={cn("text-xs text-muted-foreground w-12 text-right", !isSelected && "invisible")}>
                                            ${(p.current_price * (1 + (priceChanges[p.product_id] || 0))).toFixed(2)}
                                        </span>
                                        <input
                                            type="range"
                                            min="-0.30"
                                            max="0.30"
                                            step="0.01"
                                            disabled={!isSelected}
                                            value={priceChanges[p.product_id] || 0}
                                            onChange={(e) => onPriceChange(p.product_id, parseFloat(e.target.value))}
                                            className={cn(
                                                "flex-1 h-2 bg-secondary rounded-lg appearance-none transition-all",
                                                isSelected ? "cursor-pointer accent-primary hover:accent-primary/90" : "cursor-not-allowed opacity-50"
                                            )}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                    <button
                        onClick={onRunSimulation}
                        className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Play size={18} />
                        Simulate Scenario
                    </button>

                    <button
                        onClick={onOptimize}
                        className="w-full py-2.5 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                    >
                        <Zap size={18} />
                        Auto-Optimize
                    </button>
                </div>
            </div>
        </div>
    );
};
