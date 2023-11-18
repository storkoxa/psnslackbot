
import { setTimeout } from "timers/promises";
import * as fs from 'fs';
import stream from "stream";

import logger from '../logger.js'


const errorText = `{"error":{"referenceId":"1a63fac2-85a2-11ee-882b-d3220ea0ba54","code":2240526,"message":"Not permitted by access control"}}`



const readFromFile = async (filename) => {
  return new Promise((resolve, reject) => {  
    let fileStream = fs.createReadStream(filename);

    let fileData = "";

    fileStream.on("data", chunk => { fileData += chunk; });
    fileStream.on("end", () => { resolve(JSON.parse(fileData)); });
    fileStream.on("error", (e) => { 
      resolve(JSON.parse(errorText)) 
    });
  })
}

const getGamesForUserPayload = async (userId, offset) => {
  const file  = `./payloads/getGamesForUserPayload-${userId}-${offset}.txt`
  logger.info({userId, file}, `Requesting titles for user`)
  return await readFromFile(file)
}

const getAllTrophiesForGamePayload = async (gameId, service) => {
  const file = `./payloads/getAllTrophiesForGamePayload-${gameId}.txt`
  logger.info({gameId, file}, `Requesting all trophies for game`)      

  return await readFromFile(file)
}
const getTrophiesForUserPayload = async (gameId, userId, service) => { 
  const file = `./payloads/getTrophiesForUserPayload-${userId}-${gameId}.txt`
  logger.info({gameId, userId, file}, `Requesting trophys for specific user and game`)      
  return await readFromFile(file)
}



const userInfoByNamePayload = async (name) => {
  const file = `./payloads/userInfoByNamePayload-${name}.txt`
  logger.info({name, file}, `Requesting INFO for username`)      
  return await readFromFile(file)
}






export default { getTrophiesForUserPayload, getAllTrophiesForGamePayload, getGamesForUserPayload, userInfoByNamePayload } 