#! /bin/bash
# PGPASSWORD=$DB_PASSWORD psql -U postgres -h jason-db.startupos.dev -f db/init/wipe.sql
export $(grep -v '^#' .env | xargs)
psql postgresql://postgres:$DB_PASSWORD@jason-db.startupos.dev -f database/init/wipe.sql