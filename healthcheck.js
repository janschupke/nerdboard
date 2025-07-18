/* eslint-env node */
/* global process */
// Healthcheck script for dashboard API endpoints
// Usage: node healthcheck.js
// Requires: npm install node-fetch dotenv

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5173';

const endpoints = [
  {
    name: 'CoinGecko Markets',
    url: `${BASE_URL}/api/coingecko/api/v3/coins/markets?vs_currency=usd`,
    key: null,
    required: false,
  },
  {
    name: 'OpenWeatherMap',
    url: `${BASE_URL}/api/openweathermap/data/2.5/onecall?lat=60.1699&lon=24.9384&appid=${process.env.OPENWEATHERMAP_API_KEY}`,
    key: 'OPENWEATHERMAP_API_KEY',
    required: true,
  },
  {
    name: 'Alpha Vantage GDX',
    url: `${BASE_URL}/api/alpha-vantage/query?function=GLOBAL_QUOTE&symbol=GDX&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
    key: 'ALPHA_VANTAGE_API_KEY',
    required: true,
  },
  {
    name: 'FRED Series Observations',
    url: `${BASE_URL}/api/fred/fred/series/observations?series_id=FEDFUNDS&api_key=${process.env.FRED_API_KEY}&file_type=json`,
    key: 'FRED_API_KEY',
    required: true,
  },
  {
    name: 'Gold Spot (XAU/USD, ounce)',
    url: `${BASE_URL}/api/gold-api/XAU?currency=USD&unit=ounce`,
    key: null,
    required: false,
  },
  {
    name: 'Silver Spot (XAG/USD, ounce)',
    url: `${BASE_URL}/api/gold-api/XAG?currency=USD&unit=ounce`,
    key: null,
    required: false,
  },
  {
    name: 'USGS Earthquake',
    url: `${BASE_URL}/api/usgs/fdsnws/event/1/query?format=geojson&starttime=2024-07-01&endtime=2024-07-18`,
    key: null,
    required: false,
  },
  {
    name: 'CWB Typhoon',
    url: `${BASE_URL}/api/cwb/v1/rest/datastore/W-C0034-002?Authorization=${process.env.CWB_API_KEY}&format=JSON`,
    key: 'CWB_API_KEY',
    required: true,
  },
  {
    name: 'WorldTimeAPI',
    url: `${BASE_URL}/api/time/api/timezone/Europe/Helsinki`,
    key: null,
    required: false,
  },
  {
    name: 'ECB Euribor 12M',
    url: 'https://sdw-wsrest.ecb.europa.eu/service/data/BSI.M.U2.EUR.R.IR12MM.R.A?format=json',
    key: null,
    required: false,
  },
];

function pad(str, len) {
  return (str + ' '.repeat(len)).slice(0, len);
}

async function checkEndpoint(ep) {
  if (ep.required && (!ep.key || !process.env[ep.key])) {
    return { name: ep.name, status: '❌', msg: `Missing API key (${ep.key})` };
  }
  try {
    const res = await fetch(ep.url);
    if (!res.ok) {
      return { name: ep.name, status: '❌', msg: `HTTP ${res.status}` };
    }
    const data = await res.json().catch(() => null);
    if (data && (data.error || data['Error Message'])) {
      return { name: ep.name, status: '⚠️', msg: data.error || data['Error Message'] };
    }
    return { name: ep.name, status: '✅', msg: 'OK' };
  } catch (e) {
    return { name: ep.name, status: '❌', msg: e.message };
  }
}

(async () => {
  console.log('\nAPI Endpoint Healthcheck\n------------------------');
  const results = await Promise.all(endpoints.map(checkEndpoint));
  const namePad = Math.max(...endpoints.map((e) => e.name.length)) + 2;
  results.forEach((r) => {
    console.log(`${pad(r.name, namePad)} ... ${r.status}  ${r.msg}`);
  });
  const failed = results.filter((r) => r.status !== '✅');
  if (failed.length) {
    console.log(`\n${failed.length} endpoint(s) need attention.`);
  } else {
    console.log('\nAll endpoints are healthy!');
  }
})();
