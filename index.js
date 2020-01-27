const app = require('express')();
const mainRouter = require('./routes/main');

app.use('/api', mainRouter);

const PORT = process.env.APP_PORT || 3000;
const HOST = process.env.APP_HOST || '127.0.0.1';

app.listen(PORT, HOST);

console.log(`Server is listening on ${HOST}:${PORT}`);