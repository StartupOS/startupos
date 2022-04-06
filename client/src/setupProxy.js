const { createProxyMiddleware } = require('http-proxy-middleware');

const portMap = {
    alpha: 5001,
    jason: 5001,
    beta : 5002,
    prod: 5003
}
const env = process.env.REACT_APP_ENV||'alpha'
const port = portMap[env]
console.log(`Running in env: ${env}`)
console.log(`Server should be listening on ${port}`)

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `https://${env}.startupos.dev:${port}`,
      changeOrigin: false,
    })
  );
};