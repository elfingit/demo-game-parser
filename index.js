const app = require('express')();
const mainRouter = require('./routes/main');

app.use('/api', mainRouter);

const port = process.env.APP_PORT || 3000;

app.listen(port);

console.log('Server is listening on http://localhost:' + port);