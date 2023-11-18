import { token } from './auth/psnToken.js'
import { setTimeout } from "timers/promises";
import * as fs from 'fs';

import logger from '../logger.js'



async function psnHtppCall(url, file) {
  await setTimeout(1000);
  var t = await token.get() 

  const opts = {
    headers: { 
      "Authorization" : `Bearer ${t}`,   
      "Content-Type": "application/json"
    }        
  };
    
  var response = await fetch(url, opts)
  var astext = await response.text() 
  
  fs.writeFileSync(file, astext)

  var json = JSON.parse(astext)   
  return json
}


async function getGamesForUserPayload(userId, offset) {   
  const url = new URL(`https://m.np.playstation.com/api/trophy/v1/users/${userId}/trophyTitles?offset=${offset}`)  
  logger.info({userId, url}, `Requesting titles for user`)
  const file = `./payloads/getGamesForUserPayload-${userId}-${offset}.txt`

  return await psnHtppCall(url, file)
}


async function userInfoByNamePayload(name) {
  const url = new URL(`https://us-prof.np.community.playstation.net/userProfile/v1/users/${name}/profile2?fields=npId,onlineId,accountId,avatarUrls,plus,aboutMe,languagesUsed,trophySummary(@default,level,progress,earnedTrophies),isOfficiallyVerified,personalDetail(@default,profilePictureUrls),personalDetailSharing,personalDetailSharingRequestMessageFlag,primaryOnlineStatus,presences(@default,@titleInfo,platform,lastOnlineDate,hasBroadcastData),requestMessageFlag,blocking,friendRelation,following,consoleAvailability`);
  logger.info({name, url}, `Requesting INFO for username`)      
  const file = `./payloads/userInfoByNamePayload-${name}.txt`

  return await psnHtppCall(url, file)
}

async function getAllTrophiesForGamePayload(gameId, service) { 
  const url = new URL(`https://m.np.playstation.com/api/trophy/v1/npCommunicationIds/${gameId}/trophyGroups/all/trophies?npServiceName=${service}`)  
  logger.info({gameId, url}, `Requesting all trophies for game`)      
  const file = `./payloads/getAllTrophiesForGamePayload-${gameId}.txt`

  return await psnHtppCall(url, file)
}


async function getTrophiesForUserPayload(gameId, userId, service) {   
  const url = new URL(`https://m.np.playstation.com/api/trophy/v1/users/${userId}/npCommunicationIds/${gameId}/trophyGroups/all/trophies?npServiceName=${service}`)
  logger.info({gameId, userId, url}, `Requesting trophys for specific user and game`)      
  const file = `./payloads/getTrophiesForUserPayload-${userId}-${gameId}.txt`

  return await psnHtppCall(url, file)
}


export default { getTrophiesForUserPayload, getAllTrophiesForGamePayload, getGamesForUserPayload, userInfoByNamePayload }