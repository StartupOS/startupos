import path from 'path'
import { DataSource } from "typeorm"
import { config } from 'dotenv';

config();

let PORT=5432;

console.log("Initializing")
const modelsPath = path.resolve(__dirname, '../models/entities');
console.log(modelsPath);
const str = modelsPath + "/*.ts"
console.log(str);

if(process.env["DB_PORT"]){
    if(isFinite(+process.env["DB_PORT"])){
        PORT = +process.env["DB_PORT"];
    }
}

const dataSource = new DataSource({
    type: "postgres",
    host: process.env["DB_HOST_NAME"],
    port: PORT,
    username: process.env["POSTGRES_USER"],
    password: process.env["POSTGRES_PASSWORD"],
    database: process.env["DB_NAME"],
    entities: [ str ],
    synchronize: false
    // entities: [ "src/models/entities/*.js", "dist/models/entities/*.js"],
});


export default dataSource;