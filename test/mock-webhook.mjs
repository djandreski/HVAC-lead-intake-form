import { createServer } from 'node:http';

const server = createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.writeHead(204).end();
    return;
  }

  if (request.method !== 'POST' || request.url !== '/lead') {
    response.writeHead(404).end();
    return;
  }

  let body = '';
  request.setEncoding('utf8');
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', () => {
    console.log(body);
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Accepted');
  });
});

server.listen(4319, '127.0.0.1', () => {
  console.log('Mock Make webhook listening at http://localhost:4319/lead');
});
