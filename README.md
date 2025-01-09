# Dual-Class Arbitrage

## Overview
The Dual-Class Arbitrage Application is a full-stack web application designed to analyze dual-listed securities and generate clear trading strategies that exploit price discrepancies. The `Analyze Securities` page integrates real-time market data through the yfinance API, enabling users to input custom investment amounts and receive hedged trading strategies. The `Live Results` page showcases key performance metrics for a dual-class arbitrage strategy that I developed and backtested on QuantConnect, using Alphabet’s Class A (NASDAQ: GOOGL) and Class C (NASDAQ: GOOG) shares as a case study for pairs trading.

## Live Demo
[https://dual-class-arbitrage.vercel.app](https://dual-class-arbitrage.vercel.app)

## How It Works

1. **Choose a Dual-Listed Security**
   - Enter and select one of the following dual-listed securities to analyze and generate actionable trading strategies:
     - Alphabet
     - American Homes 4 Rent
     - Berkshire Hathaway
     - Crawford & Company
     - Gray Television
     - Haverty Furniture Companies
     - Moog

2. **Enter Investment Amount**
   - Click `Calculate Strategy` and enter a custom investment amount.

3. **View Trading Strategies**
   - The application will analyze real-time market data, calculate hedge ratios, and generate strategies to exploit price discrepancies between the selected security pair.

## Technologies Used

### Backend
- **Python**: Core programming language for backend logic.
- **FastAPI**: Framework for building RESTful APIs.
- **yfinance**: Library for integrating real-time stock market data.
- **QuantConnect**: Platform for strategy development and backtesting.

### Frontend
- **React.js**: For creating a dynamic and responsive user interface.

### Deployment
- **AWS**: Hosting backend services.
- **Vercel**: Deploying frontend with custom API rewrites to resolve HTTP/HTTPS compatibility.