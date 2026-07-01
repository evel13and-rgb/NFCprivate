import http from 'node:http';
import { URL } from 'node:url';
import { getSafeFallbackWeatherState } from './weatherProvider.js';
import { getGlobalWeatherState } from './weatherStateStore.js';

const HOST = process.env.PARAMO_WEATHER_HOST || '127.0.0.1';
const PORT = Number.parseInt(process.env.PARAMO_WEATHER_PORT || process.env.PORT || '3030', 10);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
  response.end(`${JSON.stringify(payload)}\n`);
}

function sendNotFound(response) {
  sendJson(response, 404, {
    error: 'not_found',
  });
}

async function handleWeatherState(response) {
  try {
    const state = await getGlobalWeatherState();
    sendJson(response, 200, state);
  } catch (error) {
    console.error('weather-state fallback:', error);
    sendJson(response, 200, getSafeFallbackWeatherState());
  }
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/api/weather-state') {
    handleWeatherState(response);
    return;
  }

  sendNotFound(response);
});

server.listen(PORT, HOST, () => {
  console.log(`Paramo weather backend listening on http://${HOST}:${PORT}`);
});
