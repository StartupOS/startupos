export $(grep -v '^#' ../.env | xargs)
export $(grep -v '^#' .env | xargs)

npm run debug