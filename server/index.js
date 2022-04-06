/**
 * @file The application root. Defines the Express server configuration.
 */
const fs = require('fs');
const https = require('https');

const express = require('express');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const { errorHandler } = require('./middleware');

const {
  loginRouter,
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
  companyRouter,
  mergeRouter,
  employeeRouter,
  messagesRouter
} = require('./routes');

const {
  refreshInstitutions
} = require('./institutions');

// Runs every 60 minutes
function refreshWrapper(){
  refreshInstitutions()
  setTimeout(refreshWrapper, 60*60*1000)
}

refreshWrapper();

const app = express();

const { PORT } = process.env;

const privateKey  = fs.readFileSync('./startupos.dev/privkey1.pem', 'utf8');
const certificate = fs.readFileSync('./startupos.dev/fullchain1.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app);
const { retrieveUserById } = require('./db/queries');

passport.use(
  new JWTstrategy(
    {
      secretOrKey: 'BOTTOM_SECRET',
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    async (token, done) => {
      console.log('authorization');
      console.log(token);
      try {
        const user = token;
        const record = retrieveUserById(user.id);
        return done(null, record);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

httpsServer.listen(PORT)

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

app.use(passport.initialize());

let logOnce= true;

// Set socket.io listeners.
io.on('connection', socket => {
  if(logOnce){
    console.log('SOCKET CONNECTED');
    // console.log(socket);

    socket.on('disconnect', () => {
      console.log('SOCKET DISCONNECTED');
    });
    logOnce = false;
  }
});

app.get('/test', (req, res) => {
  res.send('test response');
});
// I don't know why I have to do this, but NGINX is awful
app.all('/api/*', (req,res,next)=>{
  const newPath = '/'+req.path.slice(5);
  console.log(req.path, 'should have been redirected to ', newPath);
  req.url=newPath;
  return app._router.handle(req,res, next)
})
app.use('/login', loginRouter);
app.use('/users', passport.authenticate('jwt', { session: false }), usersRouter);
app.use('/sessions', passport.authenticate('jwt', { session: false }), sessionsRouter);
app.use('/items', passport.authenticate('jwt', { session: false }), itemsRouter);
app.use('/accounts', passport.authenticate('jwt', { session: false }), accountsRouter);
app.use('/institutions', passport.authenticate('jwt', { session: false }), institutionsRouter);
app.use('/services', serviceRouter);
app.use('/link-event', passport.authenticate('jwt', { session: false }), linkEventsRouter);
app.use('/link-token', passport.authenticate('jwt', { session: false }), linkTokensRouter);
app.use('/assets', passport.authenticate('jwt', { session: false }), assetsRouter);
app.use('/companies', passport.authenticate('jwt', { session: false }), companyRouter);
app.use('/merge', passport.authenticate('jwt', { session: false }), mergeRouter);
app.use('/employees', passport.authenticate('jwt', { session: false }), employeeRouter);
app.use('/messages', passport.authenticate('jwt', { session: false }), messagesRouter);
app.use('*', unhandledRouter);

// Error handling has to sit at the bottom of the stack.
// https://github.com/expressjs/express/issues/2718
app.use(errorHandler);
console.log(`listening on ${PORT}`)
console.log('Right Server');
console.log('updated');
