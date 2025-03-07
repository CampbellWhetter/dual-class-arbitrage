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
import boto3
import os
from mangum import Mangum

app = FastAPI()

# Conditionally load environment variables for local development
if os.getenv("AWS_EXECUTION_ENV") is None:  # AWS_EXECUTION_ENV is present in AWS environments
    load_dotenv()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000",
                   "https://dual-class-arbitrage.vercel.app/"],
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

# Calculate a trading strategy for the given security and investment amount
@app.post("/api/trading-strategy")
async def trading_strategy(request: TradingRequest):
    def fetch_stock_price(ticker):
        stock = yf.Ticker(ticker)
        
        # Try to get the current regular market price
        market_price = stock.info.get('currentPrice')
        
        # If market_price is None, fall back to the most recent close
        if market_price is not None:
            return market_price  # Market is open or price is available
        else:
            # Fetch the most recent historical data (last close price)
            history = stock.history(period="2d")  # Get up to the last two days of data
            if not history.empty:
                most_recent_close = history['Close'].iloc[-1]  # Last row's close
                return most_recent_close
            else:
                return None  # Handle cases where no data is available

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

# Generate headers for QuantConnect API authentication
def generate_api_headers():
    # Fetch environment variables
    ssm = boto3.client("ssm")
    api_token = ssm.get_parameter(Name="API_TOKEN", WithDecryption=True)["Parameter"]["Value"]
    user_id = ssm.get_parameter(Name="USER_ID", WithDecryption=True)["Parameter"]["Value"]

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

# Fetch live trading results
@app.get("/api/live-results")
def get_live_results():
    # Fetch the PROJECT_ID from environment variables
    project_id = os.getenv("PROJECT_ID")

    url = "https://www.quantconnect.com/api/v2/live/read"
    headers = generate_api_headers()
    payload = {"projectId": project_id}

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

# AWS Lambda handler
handler = Mangum(app)