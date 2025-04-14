const isProduction = window.location.hostname !== 'localhost';

export const API_URL = isProduction
    ? 'https://requena-backend-production.up.railway.app'
    : 'http://localhost:3001';