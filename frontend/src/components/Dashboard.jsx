import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ElasticityChart, SimulationResultChart } from './Charts';
import { Controls } from './Controls';
import { LayoutDashboard, TrendingUp, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard() {
    const [products, setProducts] = useState([]);
    const [priceChanges, setPriceChanges] = useState({});
    const [simulationResults, setSimulationResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // API Base URL - adjust if needed
    const API_URL = 'http://localhost:8000';

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            // First ensure dummy data is generated
            await axios.get(`${API_URL}/data/dummy`);

            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data);

            // Initialize changes to 0
            const initialChanges = {};
            response.data.forEach(p => initialChanges[p.product_id] = 0);
            setPriceChanges(initialChanges);

            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to connect to backend. Make sure the Python server is running on port 8000.");
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (productId, value) => {
        setPriceChanges(prev => ({
            ...prev,
            [productId]: value
        }));
    };

    const runSimulation = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/simulate`, {
                price_changes: priceChanges
            });
            setSimulationResults(response.data);
        } catch (err) {
            console.error(err);
            setError("Simulation failed.");
        } finally {
            setLoading(false);
        }
    };

    const runOptimization = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/optimize`, {
                objective: 'profit'
            });
            setPriceChanges(response.data);
            // Automatically run simulation with optimized prices
            const simResponse = await axios.post(`${API_URL}/simulate`, {
                price_changes: response.data
            });
            setSimulationResults(simResponse.data);
        } catch (err) {
            console.error(err);
            setError("Optimization failed.");
        } finally {
            setLoading(false);
        }
    };



    // KPI Calculations
    const currentTotalRevenue = products.reduce((acc, p) => acc + (p.current_price * 1000), 0); // approx
    const projectedRevenue = simulationResults.length > 0
        ? simulationResults.reduce((acc, r) => acc + r.new_revenue, 0)
        : currentTotalRevenue;

    const revenueDelta = projectedRevenue - currentTotalRevenue;
    const revenueDeltaPct = (revenueDelta / currentTotalRevenue) * 100;

    // Selection state
    const [selectedProducts, setSelectedProducts] = useState(new Set());

    const handleToggleProduct = (productId) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
            // Reset price change when unselected
            handlePriceChange(productId, 0);
        } else {
            newSelected.add(productId);
        }
        setSelectedProducts(newSelected);
    };

    const handleReset = () => {
        const initialChanges = {};
        products.forEach(p => initialChanges[p.product_id] = 0);
        setPriceChanges(initialChanges);
        setSimulationResults([]);
        setSelectedProducts(new Set());
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <LayoutDashboard size={24} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Pricing Simulator <span className="text-muted-foreground font-normal ml-2 text-sm">v1.0</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                            loading ? "bg-yellow-100 text-yellow-700" : error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                            <div className={cn("w-2 h-2 rounded-full", loading ? "bg-yellow-500 animate-pulse" : error ? "bg-red-500" : "bg-green-500")} />
                            {loading ? "Processing..." : error ? "System Error" : "System Ready"}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                        <AlertCircle size={20} />
                        <p>{error}</p>
                        <button onClick={fetchInitialData} className="ml-auto text-sm underline hover:text-destructive/80">Retry Connection</button>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card shadow-sm border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue Impact</h3>
                            <DollarSign className="text-green-500" size={20} />
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold tracking-tight">
                                ${Math.abs(revenueDelta).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            <span className={cn(
                                "text-sm font-medium px-2 py-0.5 rounded-full",
                                revenueDelta >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                {revenueDelta >= 0 ? "+" : ""}{revenueDeltaPct.toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Projected change based on current parameters</p>
                    </div>

                    <div className="bg-card shadow-sm border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Active Products</h3>
                            <TrendingUp className="text-blue-500" size={20} />
                        </div>
                        <div className="text-3xl font-bold tracking-tight">{products.length}</div>
                        <p className="text-xs text-muted-foreground mt-2">Across {new Set(products.map(p => p.category)).size} categories</p>
                    </div>

                    <div className="bg-card shadow-sm border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Elasticity Models</h3>
                            <BarChart3 className="text-purple-500" size={20} />
                        </div>
                        <div className="text-3xl font-bold tracking-tight">
                            {products.filter(p => p.elasticity !== null).length} <span className="text-sm text-muted-foreground font-normal">/ {products.length}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Regression models calibrated</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-300px)]">

                    {/* Left Column: Controls */}
                    <div className="lg:col-span-3 h-full">
                        <Controls
                            products={products}
                            priceChanges={priceChanges}
                            selectedProducts={selectedProducts}
                            onToggleProduct={handleToggleProduct}
                            onPriceChange={handlePriceChange}
                            onRunSimulation={runSimulation}
                            onOptimize={runOptimization}
                            onReset={handleReset}
                        />
                    </div>

                    {/* Right Column: Visualization */}
                    <div className="lg:col-span-9 space-y-6 h-full overflow-y-auto pr-1">
                        {/* Simulation Charts */}
                        <div className="bg-card shadow-sm border border-border rounded-xl p-6">
                            <SimulationResultChart data={simulationResults} />
                        </div>

                        {/* Elasticity Chart */}
                        <div className="bg-card shadow-sm border border-border rounded-xl p-6">
                            <ElasticityChart data={products.map(p => ({
                                product_name: p.product_name,
                                elasticity: p.elasticity || 0
                            }))} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
