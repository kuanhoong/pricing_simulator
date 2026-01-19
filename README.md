# RGM Pricing Simulator


<img width="1317" height="1203" alt="01" src="https://github.com/user-attachments/assets/0fdcdb4f-04c8-41c9-b705-c85ee7070220" />


A comprehensive full-stack application for Revenue Growth Management (RGM). This tool allows users to model price elasticities, simulate pricing scenarios, and optimize pricing strategies to maximize revenue and profit.

## 🚀 Key Features

*   **Interactive Simulation**: Pick and choose products to effectively model price changes.
*   **Elasticity Modeling**: Uses historical data to calculate price elasticity (how sensitive demand is to price).
*   **Real-time Visualization**: See the immediate impact of price changes on projected volume and revenue.
*   **Auto-Optimization**: Algorithms to suggest the optimal price points for profit maximization.
*   **Modern Interface**: Clean, responsive UI built with React and Tailwind CSS.

## 🛠️ Tech Stack

### Backend
*   **Language**: Python 3.12+
*   **Framework**: FastAPI
*   **Data Processing**: Pandas, NumPy
*   **Modeling**: Log-log regression for elasticity calculation

### Frontend
*   **Framework**: React 19 (Vite)
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Charts**: Recharts

---

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites
*   Python 3.12 or higher
*   Node.js & npm (v18+ recommended)

### 1. Backend Setup

The backend handles the data logic and simulation engine.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```
*The backend API will start at `http://localhost:8000`*

### 2. Frontend Setup

The frontend provides the user interface.

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*The application will open at `http://localhost:5173`*

---

## 📖 Usage Walkthrough

### 1. The Dashboard
When you open the application, you will see the **Dashboard**.
*   **Top Cards**: Show Key Performance Indicators (Total Revenue Impact, Active Products, Calibrated Models).
*   **Left Panel**: Configuration Controls.
*   **Right Panel**: Visualization Charts.

### 2. running a Simulation
1.  **Select Products**: In the "Configuration" panel, check the box next to the products you want to adjust.
2.  **Adjust Prices**: Use the slider for selected products to increase or decrease the price (range: -30% to +30%).
3.  **Visual Feedback**: As you adjust, you'll see the potential new price calculated immediately.
4.  **Simulate**: Click the **Simulate Scenario** button.
5.  **View Results**: The "Simulation Results" chart will update to show the comparison between Current vs. New Revenue.

### 3. Optimization
If you want the system to recommend prices for you:
1.  Click the **Auto-Optimize** button.
2.  The system will calculate the best price changes to maximize profit based on the elasticity models.
3.  The sliders will automatically move to the recommended positions.

---

## 📂 Project Structure

```
Pricing_Simulator/
├── backend/                # Python FastAPI Server
│   ├── main.py            # API Entry point
│   ├── pricing_simulator.py # Core logical engine
│   └── requirements.txt
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/    # UI Components (Dashboard, Controls)
│   │   └── App.jsx
│   └── package.json
└── README.md              # This file
```

## 🤝 Contributing
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License
Distributed under the MIT License.
