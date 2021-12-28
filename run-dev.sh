export $(grep -v '^#' server/.env | xargs)
export $(grep -v '^#' client/.env | xargs)
export $(grep -v '^#' .env | xargs)

nohup npm start --prefix server > server.log 2>server.err < /dev/null &
npm run --prefix client  sL > client.log 2>client.err < /dev/null &