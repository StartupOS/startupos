/**
 * @file The application root. Defines the Express server configuration.
 */
const fs = require('fs');
const https = require('https');

const express = require('express');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const { errorHandler } = require('./middleware');

const {
  usersRouter,
  sessionsRouter,
  itemsRouter,
  accountsRouter,
  institutionsRouter,
  serviceRouter,
  linkEventsRouter,
  linkTokensRouter,
  unhandledRouter,
  assetsRouter,
} = require('./routes');

const app = express();

const { PORT } = process.env;

const privateKey  = fs.readFileSync('./startupos.dev/privkey1.pem', 'utf8');
const certificate = fs.readFileSync('./startupos.dev/fullchain1.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT)

// const server = app.listen(PORT, () => {
//   console.log(`listening on port ${PORT}`);
// });
const io = socketIo(httpsServer);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// middleware to pass socket to each request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Set socket.io listeners.
io.on('connection', socket => {
  console.log('SOCKET CONNECTED');

  socket.on('disconnect', () => {
    console.log('SOCKET DISCONNECTED');
  });
});

app.get('/test', (req, res) => {
  res.send('test response');
});

app.use('/users', usersRouter);
app.use('/sessions', sessionsRouter);
app.use('/items', itemsRouter);
app.use('/accounts', accountsRouter);
app.use('/institutions', institutionsRouter);
app.use('/services', serviceRouter);
app.use('/link-event', linkEventsRouter);
app.use('/link-token', linkTokensRouter);
app.use('/assets', assetsRouter);
app.use('*', unhandledRouter);

// Error handling has to sit at the bottom of the stack.
// https://github.com/expressjs/express/issues/2718
app.use(errorHandler);
