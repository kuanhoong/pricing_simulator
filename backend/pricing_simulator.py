import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from typing import Dict, List, Optional, Tuple, Union

class PricingSimulator:
    def __init__(self):
        self.product_data = None
        self.historical_data = None
        self.elasticities = {}
        self.models = {}
        
    def load_product_data(self, df: pd.DataFrame):
        """
        Load product reference data.
        Expected columns: product_id, product_name, category, base_cost, current_price
        """
        required_cols = ['product_id', 'product_name', 'category', 'base_cost', 'current_price']
        if not all(col in df.columns for col in required_cols):
            raise ValueError(f"Product data missing required columns. Need: {required_cols}")
        self.product_data = df.set_index('product_id')
        
    def load_historical_data(self, df: pd.DataFrame):
        """
        Load historical transaction/sales data for modeling.
        Expected columns: date, product_id, price, volume
        """
        required_cols = ['date', 'product_id', 'price', 'volume']
        if not all(col in df.columns for col in required_cols):
            raise ValueError(f"Historical data missing required columns. Need: {required_cols}")
        
        self.historical_data = df.copy()
        self.historical_data['date'] = pd.to_datetime(self.historical_data['date'])
        
    def calculate_elasticity(self, method='log_log'):
        """
        Calculate price elasticity for each product using log-log regression.
        ln(Volume) = alpha + beta * ln(Price)
        """
        if self.historical_data is None:
            raise ValueError("Historical data not loaded")
            
        results = {}
        
        for product_id in self.historical_data['product_id'].unique():
            product_df = self.historical_data[self.historical_data['product_id'] == product_id].copy()
            
            # Remove invalid data
            product_df = product_df[(product_df['price'] > 0) & (product_df['volume'] > 0)]
            
            if len(product_df) < 5:
                # Not enough data, assume unit elasticity or skip
                results[product_id] = {
                    'elasticity': -1.0,
                    'r_squared': 0.0,
                    'is_modeled': False
                }
                continue
                
            X = np.log(product_df[['price']])
            y = np.log(product_df['volume'])
            
            model = LinearRegression()
            model.fit(X, y)
            
            elasticity = model.coef_[0]
            r_squared = model.score(X, y)
            
            results[product_id] = {
                'elasticity': elasticity,
                'r_squared': r_squared,
                'is_modeled': True
            }
            self.models[product_id] = model
            
        self.elasticities = results
        return results

    def simulate_scenario(self, price_changes: Dict[str, float]) -> pd.DataFrame:
        """
        Simulate a pricing scenario.
        price_changes: Dict mapping product_id to percentage change (e.g., {'P1': 0.10} for +10%)
        """
        if self.product_data is None:
            raise ValueError("Product data not loaded")
            
        simulation_results = []
        
        for product_id, row in self.product_data.iterrows():
            current_price = row['current_price']
            base_cost = row['base_cost']
            
            # Get elasticity (default to -1.0 if not calculated)
            elasticity = self.elasticities.get(product_id, {}).get('elasticity', -1.0)
            
            # Apply price change if specified
            pct_change = price_changes.get(product_id, 0.0)
            new_price = current_price * (1 + pct_change)
            
            # Calculate volume impact
            # % Change in Volume = Elasticity * % Change in Price
            # New Volume = Base Volume * (1 + % Volume Change)
            # Need a base volume. Let's assume 'current' volume is derived from recent history or passed in.
            # For simplicity here, we'll estimate base volume from historical avg or 1000 if missing.
            
            base_volume = 1000 # Default fallback
            if self.historical_data is not None:
                hist_prod = self.historical_data[self.historical_data['product_id'] == product_id]
                if not hist_prod.empty:
                    base_volume = hist_prod['volume'].mean()

            volume_change_pct = elasticity * pct_change
            new_volume = base_volume * (1 + volume_change_pct)
            
            # Financials
            old_revenue = current_price * base_volume
            new_revenue = new_price * new_volume
            
            old_profit = (current_price - base_cost) * base_volume
            new_profit = (new_price - base_cost) * new_volume
            
            simulation_results.append({
                'product_id': product_id,
                'product_name': row['product_name'],
                'category': row['category'],
                'old_price': current_price,
                'new_price': new_price,
                'price_change_pct': pct_change,
                'elasticity': elasticity,
                'old_volume': base_volume,
                'new_volume': new_volume,
                'volume_change_pct': volume_change_pct,
                'old_revenue': old_revenue,
                'new_revenue': new_revenue,
                'revenue_change_pct': (new_revenue - old_revenue) / old_revenue if old_revenue else 0,
                'old_profit': old_profit,
                'new_profit': new_profit,
                'profit_change_pct': (new_profit - old_profit) / old_profit if old_profit else 0
            })
            
        return pd.DataFrame(simulation_results)

    def optimize_pricing(self, objective='profit', min_margin=0.10, max_change=0.20):
        """
        Simple grid search optimization. (Placeholder for more complex logic)
        """
        # This is a simplified version. A real one would use scipy.optimize or comprehensive grid search.
        # For the demo, we'll test 3 points: -10%, 0%, +10% for each product independently (naïve).
        
        recommendations = {}
        test_points = np.linspace(-max_change, max_change, 5) # 5 points
        
        for product_id, row in self.product_data.iterrows():
            best_val = -float('inf')
            best_change = 0.0
            
            current_price = row['current_price']
            base_cost = row['base_cost']
            
            # Recalc base volume
            base_volume = 1000
            if self.historical_data is not None:
                hist_prod = self.historical_data[self.historical_data['product_id'] == product_id]
                if not hist_prod.empty:
                    base_volume = hist_prod['volume'].mean()

            elasticity = self.elasticities.get(product_id, {}).get('elasticity', -1.0)
            
            for change in test_points:
                new_price = current_price * (1 + change)
                
                # Margin constraint
                margin = (new_price - base_cost) / new_price
                if margin < min_margin:
                    continue
                    
                vol_change = elasticity * change
                new_vol = base_volume * (1 + vol_change)
                
                profit = (new_price - base_cost) * new_vol
                revenue = new_price * new_vol
                volume = new_vol
                
                target = 0
                if objective == 'profit':
                    target = profit
                elif objective == 'revenue':
                    target = revenue
                elif objective == 'volume':
                    target = volume
                    
                if target > best_val:
                    best_val = target
                    best_change = change
            
            recommendations[product_id] = best_change
            
        return recommendations
