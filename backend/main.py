from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
import io
from datetime import datetime, timedelta

from pricing_simulator import PricingSimulator

app = FastAPI(title="Pricing Simulator API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instance
simulator = PricingSimulator()

class SimulationRequest(BaseModel):
    price_changes: Dict[str, float] # product_id -> pct_change (e.g., 0.10)

class OptimizationRequest(BaseModel):
    objective: str = "profit" # profit, revenue, volume
    min_margin: float = 0.10
    max_change: float = 0.20

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Pricing Simulator API is running"}

@app.get("/data/dummy")
def generate_dummy_data():
    """
    Generate and load dummy data for testing.
    """
    # 1. Products
    products = [
        {"product_id": "P001", "product_name": "Premium Coffee Beans", "category": "Coffee", "base_cost": 10.0, "current_price": 18.0},
        {"product_id": "P002", "product_name": "Standard Coffee Ground", "category": "Coffee", "base_cost": 5.0, "current_price": 9.99},
        {"product_id": "P003", "product_name": "Espresso Machine", "category": "Equipment", "base_cost": 150.0, "current_price": 299.0},
        {"product_id": "P004", "product_name": "Coffee Filters (100pk)", "category": "Accessories", "base_cost": 0.50, "current_price": 2.99},
        {"product_id": "P005", "product_name": "Dark Roast Whole Bean", "category": "Coffee", "base_cost": 11.0, "current_price": 19.50},
        {"product_id": "P006", "product_name": "Light Roast Blend", "category": "Coffee", "base_cost": 9.0, "current_price": 16.0},
    ]
    df_products = pd.DataFrame(products)
    simulator.load_product_data(df_products)
    
    # 2. Historical Data (Synthetic)
    # Generate 12 months of weekly data
    dates = pd.date_range(start="2023-01-01", periods=52, freq="W")
    history_rows = []
    
    np.random.seed(42)
    
    base_vols = {"P001": 500, "P002": 1200, "P003": 50, "P004": 2000, "P005": 450, "P006": 600}
    true_elasticities = {"P001": -1.2, "P002": -0.8, "P003": -1.5, "P004": -0.5, "P005": -1.1, "P006": -1.3}
    
    for date in dates:
        for p in products:
            pid = p["product_id"]
            base_price = p["current_price"]
            
            # Random price variation +/- 10%
            price_mult = 1 + np.random.uniform(-0.1, 0.1)
            price = base_price * price_mult
            
            # Volume based on elasticity + noise
            elast = true_elasticities.get(pid, -1.0)
            vol_mult = (price / base_price) ** elast
            noise = np.random.normal(1.0, 0.05) # 5% noise
            volume = int(base_vols[pid] * vol_mult * noise)
            
            history_rows.append({
                "date": date,
                "product_id": pid,
                "price": round(price, 2),
                "volume": max(0, volume)
            })
            
    df_history = pd.DataFrame(history_rows)
    simulator.load_historical_data(df_history)
    
    # 3. Calculate Elasticities
    results = simulator.calculate_elasticity()
    
    return {
        "message": "Dummy data loaded successfully",
        "products_count": len(products),
        "history_rows": len(history_rows),
        "elasticities": results
    }

@app.post("/simulate")
def run_simulation(req: SimulationRequest):
    if simulator.product_data is None:
        raise HTTPException(status_code=400, detail="No data loaded. Call /data/dummy or upload data first.")
    
    try:
        results = simulator.simulate_scenario(req.price_changes)
        # Convert to dict for JSON response
        return results.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize")
def optimize(req: OptimizationRequest):
    if simulator.product_data is None:
        raise HTTPException(status_code=400, detail="No data loaded.")
        
    try:
        recommendations = simulator.optimize_pricing(
            objective=req.objective,
            min_margin=req.min_margin,
            max_change=req.max_change
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products")
def get_products():
    if simulator.product_data is None:
        return []
    # Return product list with calculated elasticities
    df = simulator.product_data.reset_index()
    products = df.to_dict(orient="records")
    for p in products:
        pid = p['product_id']
        if pid in simulator.elasticities:
            p['elasticity'] = simulator.elasticities[pid]['elasticity']
            p['r_squared'] = simulator.elasticities[pid]['r_squared']
        else:
            p['elasticity'] = None
            p['r_squared'] = None
    return products

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
