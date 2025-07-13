# Nerdboard Data Tiles Planning

## Overview

This planning document outlines the addition of new data tiles to the Nerdboard dashboard, focusing on financial indicators, weather data, and timezone information. Each tile will provide real-time data with interactive charts and historical trends to enhance the user's dashboard experience.

## User-Facing Feature Descriptions

### 1. Federal Funds Rate Monitoring

Users will have access to real-time Federal Funds interest rate data with interactive charts showing historical trends. The tile will display current rates and allow users to view historical data patterns to understand monetary policy trends and their impact on financial markets.

### 2. Euribor Rate Tracking

Users will monitor 12-month Euribor rates with detailed charts showing rate movements over time. This provides insight into European interbank lending rates and their influence on European financial markets and borrowing costs.

### 3. Multi-City Weather Dashboard

Users will view current weather conditions and forecasts for Helsinki, Prague, and Taipei in dedicated weather tiles. Each tile will display temperature, conditions, and key weather metrics, helping users stay informed about weather patterns across these important global cities.

### 4. GDX ETF Stock Monitoring

Users will track the GDX (VanEck Vectors Gold Miners ETF) stock price with real-time charts and data. This provides insight into the performance of gold mining companies and serves as a proxy for gold market sentiment and mining sector health.

### 5. Global Time and Timezone Display

Users will see current time and timezone information for Finland, Czech Republic, and Taiwan in dedicated time tiles. This helps users coordinate activities across different time zones and stay aware of business hours and market opening times in these regions.

### 6. Uranium Price Tracking

Users will monitor uranium prices with interactive charts showing price trends and historical data. This provides insight into nuclear energy market dynamics and commodity trading opportunities in the uranium sector.

## Data Sources and API Research Requirements

**IMPORTANT CONSTRAINT**: Only free APIs can be used for data retrieval. If a data source only offers paid APIs, a direct page parsing system must be implemented to scrape data from the public website.

### Research Tasks Required

1. **Federal Funds Rate Research**
   - Investigate FRED (Federal Reserve Economic Data) API free tier limits
   - Research alternative free APIs for Federal Funds rate data
   - If no free API available: Implement web scraping from https://fred.stlouisfed.org/series/FEDFUNDS
   - **Data Format**: Time series data with dates and rates
   - **Update Frequency**: Daily

2. **Euribor Rates Research**
   - Research European Money Markets Institute (EMMI) API availability and pricing
   - Investigate ECB (European Central Bank) data portal free access
   - If no free API available: Implement web scraping from Euribor rate websites
   - **Data Format**: Time series with 12-month rates
   - **Update Frequency**: Daily

3. **Weather Data Research**
   - Research OpenWeatherMap API free tier limits (1000 calls/day)
   - Investigate WeatherAPI.com free tier (1M calls/month)
   - Research AccuWeather API free tier availability
   - **Cities**: Helsinki (Finland), Prague (Czech Republic), Taipei (Taiwan)
   - **Data Format**: Current conditions, forecasts, temperature, humidity, wind
   - **Update Frequency**: Real-time with 5-minute refresh

4. **GDX ETF Stock Data Research**
   - Research Alpha Vantage API free tier (5 API calls per minute, 500 per day)
   - Investigate Yahoo Finance API free access options
   - Research IEX Cloud API free tier limits
   - If no free API available: Implement web scraping from Yahoo Finance or similar
   - **Symbol**: GDX (VanEck Vectors Gold Miners ETF)
   - **Data Format**: Real-time price, volume, historical charts
   - **Update Frequency**: Real-time during market hours

5. **Time and Timezone Data Research**
   - **Implementation**: Client-side JavaScript with Intl API (no external API needed)
   - **Cities**: Helsinki (Europe/Helsinki), Prague (Europe/Prague), Taipei (Asia/Taipei)
   - **Data Format**: Current time, timezone offset, local time display
   - **Update Frequency**: Real-time (client-side)

6. **Uranium Price Data Research**
   - Research Trading Economics API free tier availability
   - Investigate Quandl API free tier limits
   - Research UxC Consulting public data availability
   - If no free API available: Implement web scraping from uranium price websites
   - **Data Format**: Historical price charts and current spot prices
   - **Update Frequency**: Weekly to monthly updates

## Implementation Considerations

### Free API Research and Web Scraping Strategy
- **Primary Approach**: Research and implement free API solutions for all data sources
- **Fallback Strategy**: If only paid APIs are available, implement web scraping from public websites
- **Web Scraping Requirements**: 
  - Use server-side scraping to avoid CORS issues
  - Implement robust error handling for website changes
  - Add rate limiting to respect website terms of service
  - Cache scraped data to minimize server load
- **API Rate Limits**: Research and respect free tier limits for all APIs
- **Cost Management**: Implement caching to minimize API calls and stay within free limits

### Data Visualization
- Use consistent charting library (Chart.js, D3.js, or Recharts)
- Implement responsive charts for mobile devices
- Add interactive features like zoom and time range selection
- Ensure accessibility for screen readers

### Performance Optimization
- Implement data caching strategies for both API and scraped data
- Use lazy loading for chart components
- Optimize bundle size with code splitting
- Consider server-side rendering for initial data
- Implement efficient web scraping with proper caching

### Error Handling and Fallbacks
- Graceful degradation when APIs are unavailable
- User-friendly error messages for both API and scraping failures
- Retry mechanisms for failed requests
- Offline data display when possible
- Fallback to cached data when live data is unavailable
- Handle website structure changes for scraped data sources
