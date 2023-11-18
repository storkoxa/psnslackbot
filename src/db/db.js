import { Database } from 'sqlite-async'


const DB_FILE_NAME = "./psnslackbot.db"
var db = await Database.open(DB_FILE_NAME, Database.OPEN_READWRITE)


export default db