const { createServer } = require('node:http');
const { URL } = require('node:url');

const hostname = '127.0.0.1';
const port = 3000;

let counter = 0;

const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const server = createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json');

    try {
        const url = new URL(request.url, `http://${hostname}:${port}`);

        if (request.method === 'GET' && url.pathname === '/health-check') {
            response.statusCode = 200;
            response.end(JSON.stringify({ success: true, timestamp: new Date().toISOString() }));

        } else if (request.method === 'GET' && url.pathname === '/is-prime-number') {
            const number = parseInt(url.searchParams.get('number'), 10);

            if (isNaN(number) || number < 1) {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: "Invalid input" }));
            } else {
                response.statusCode = 200;
                response.end(JSON.stringify({ isPrime: isPrime(number) }));
            }

        } else if (request.method === 'POST' && url.pathname === '/count') {
            let body = '';

            request.on('data', chunk => {
                body += chunk.toString();
            });

            request.on('end', () => {
                try {
                    const parsedBody = body.length > 0 ? JSON.parse(body) : {};

                    if (typeof parsedBody.incrementBy === 'number' && parsedBody.incrementBy > 0) {
                        counter += parsedBody.incrementBy;
                        response.statusCode = 200;
                        response.end(JSON.stringify({ counter }));
                    } else {
                        response.statusCode = 400;
                        response.end(JSON.stringify({ error: "Invalid input" }));
                    }
                } catch (error) {
                    response.statusCode = 400;
                    response.end(JSON.stringify({ error: "Invalid JSON body" }));
                }
            });

        } else {
            response.statusCode = 404;
            response.end(JSON.stringify({ error: 'Route not found' }));
        }
    } catch (error) {
        console.error(error)
        response.statusCode = 500;
        response.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
