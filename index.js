const app = require('express')();
const mainRouter = require('./routes/main');

app.use('/api', mainRouter);

const port = process.env.APP_PORT || 3000;
const host = process.env.APP_HOST || '127.0.0.1';

app.listen(port, host);

console.log('Server is listening on http://localhost:' + port);