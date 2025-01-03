from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
from typing import Optional
import requests
import time
import base64
import hashlib
from dotenv import load_dotenv
import os

app = FastAPI()

# Load environment variables from private.env
load_dotenv()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://campbellwhetter.github.io/dual-class-arbitrage.github.io/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define dual-class stocks
dual_class_stocks = {
    'Alphabet': ['GOOGL', 'GOOG'],
    'American Homes 4 Rent': ['AMH', 'AMH-PG'],
    'Berkshire Hathaway': ['BRK-B', 'BRK-A'],
    'Crawford & Company': ['CRD-A', 'CRD-B'],
    'Gray Television': ['GTN', 'GTN-A'],
    'Haverty Furniture Companies': ['HVT', 'HVT-A'],
    'Moog': ['MOG-A', 'MOG-B']
}

class TradingRequest(BaseModel):
    security_name: str
    investment_amount: int

@app.get("/get-stock-data")
async def get_stock_data(ticker: str, period: str = "1mo", interval: str = "1d"):
    """Fetch stock price history for a given ticker."""
    try:
        stock = yf.Ticker(ticker)
        data = stock.history(period=period, interval=interval)
        if data.empty:
            raise HTTPException(status_code=404, detail="No data found for the ticker.")
        return data[['Close']].reset_index().to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")

@app.post("/api/trading-strategy")
async def trading_strategy(request: TradingRequest):
    """Calculate a trading strategy for the given security and investment amount."""
    def fetch_stock_price(ticker):
        stock = yf.Ticker(ticker)
        info = stock.info
        return info.get('regularMarketPrice') or info.get('previousClose')

    def calculate_spread(price_a, price_b):
        return max(price_a, price_b) - min(price_a, price_b)

    security_name = request.security_name
    investment_amount = request.investment_amount

    tickers = dual_class_stocks.get(security_name)
    if not tickers:
        raise HTTPException(status_code=404, detail="Security not found")

    ticker_a, ticker_b = tickers[0], tickers[1]

    price_a = fetch_stock_price(ticker_a)
    price_b = fetch_stock_price(ticker_b)

    if price_a is None or price_b is None:
        raise HTTPException(status_code=404, detail="Unable to fetch stock prices")

    # Calculate hedge ratio and adjust shares for equal exposure
    hedge_ratio = min(price_a, price_b) / max(price_a, price_b)

    if price_b <= price_a:
        shares_b = investment_amount / (price_b + hedge_ratio * price_a)
        shares_a = shares_b * hedge_ratio
    else:
        shares_a = investment_amount / (price_a + hedge_ratio * price_b)
        shares_b = shares_a * hedge_ratio

    shares_a = int(shares_a)
    shares_b = int(shares_b)

    total_long_value = shares_a * price_a
    total_short_value = shares_b * price_b

    spread = calculate_spread(price_a, price_b)

    if price_b <= price_a:
        strategy = {
            "action": "Short",
            "ticker_short": ticker_b,
            "shares_short": shares_b,
            "price_short": price_b,
            "ticker_long": ticker_a,
            "shares_long": shares_a,
            "price_long": price_a,
            "total_long_value": total_long_value,
            "total_short_value": total_short_value,
            "hedge_ratio": hedge_ratio
        }
    else:
        strategy = {
            "action": "Short",
            "ticker_short": ticker_a,
            "shares_short": shares_a,
            "price_short": price_a,
            "ticker_long": ticker_b,
            "shares_long": shares_b,
            "price_long": price_b,
            "total_long_value": total_long_value,
            "total_short_value": total_short_value,
            "hedge_ratio": hedge_ratio
        }

    return {
        "spread": round(spread, 2),
        "strategy": strategy
    }

def generate_api_headers():
    """Generate headers for QuantConnect API authentication."""
    # Fetch environment variables
    api_token = os.getenv("API_TOKEN")
    user_id = os.getenv("USER_ID")

    # Generate a timestamp for the request
    timestamp = str(int(time.time()))
    
    # Create a time-stamped token
    time_stamped_token = f"{api_token}:{timestamp}"
    
    # Hash the token using SHA-256
    hashed_token = hashlib.sha256(time_stamped_token.encode("utf-8")).hexdigest()
    
    # Combine user ID and hashed token for authentication
    authentication = f"{user_id}:{hashed_token}"
    
    # Encode authentication string to Base64
    encoded_auth = base64.b64encode(authentication.encode("utf-8")).decode("ascii")
    
    # Return headers with the generated authorization token and timestamp
    return {
        "Authorization": f"Basic {encoded_auth}",
        "Timestamp": timestamp,
    }

@app.get("/api/live-results")
def get_live_results():
    """Fetch live trading results."""
    # Fetch the PROJECT_ID from environment variables
    project_id = os.getenv("PROJECT_ID")

    url = "https://www.quantconnect.com/api/v2/live/read"  # Adjusted endpoint
    headers = generate_api_headers()
    payload = {"projectId": project_id}  # Include projectId as a query parameter

    try:
        # Make the GET request to QuantConnect's API
        response = requests.get(url, headers=headers, params=payload)

        # Check for successful response
        if response.status_code == 200:
            return response.json()
        else:
            # Log the error response for debugging
            error_details = response.json().get("errors", ["Unknown error"])
            print(f"Error fetching live results: {error_details}")
            return {
                "errors": error_details,
                "status_code": response.status_code,
                "success": False,
            }
    except Exception as e:
        # Catch and log unexpected errors
        print(f"Exception occurred while fetching live results: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch live trading results.")

@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "API is running!"}
