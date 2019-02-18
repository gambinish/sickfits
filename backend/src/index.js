const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
// kickstart servers
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// use express middleware to handle cookies (JWT)
server.express.use(cookieParser());
// TODO Use express middleware to populate current user
// decode the JWT token

server.express.use((req, res, next) => {
  // console.log('another test');
  const { token } = req.cookies;
  // console.log(token);
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put the userId onto the req for future request to access
    console.log('userId: ', userId)
    req.userId = userId;
  }
  next();
});


server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  },
},
  details => {
    console.log(`Server is now running on port http://localhost:${details.port}`)
  });
