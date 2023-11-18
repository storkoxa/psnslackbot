// import apiRequest from './mockRequests.js'
import apiRequest from './psnRequests.js'

import logger from '../logger.js'



async function userInfoByName(name) { 
  const payload = await apiRequest.userInfoByNamePayload(name)
  return payload
  
}




async function getGamesForUser(userId, offset = 0) { 
  const payload = await apiRequest.getGamesForUserPayload(userId, offset)
  if (!payload?.hasOwnProperty("trophyTitles")) {
    logger.error(payload, `Could not find games for user ${userId}`)
    return []
  }

  var previousGames = []
  if (payload?.nextOffset > offset) {   
    previousGames = await getGamesForUser(userId, payload.nextOffset)
  }

  const result = payload?.trophyTitles.map(psnGame => { return { "game_id": psnGame.npCommunicationId, "service_name": psnGame.npServiceName, "game_name": psnGame.trophyTitleName, "game_icon": psnGame.trophyTitleIconUrl, "game_progress": psnGame.progress, "game_last_updated": Date.parse(psnGame.lastUpdatedDateTime)  } })

  return previousGames.concat(result)
  
}


async function getAllTrophiesForGame(gameId, service) {
  const payload = await apiRequest.getAllTrophiesForGamePayload(gameId, service)
  if (!payload?.hasOwnProperty("trophies")) { 
    logger.error(payload, `Could not find trophies for ${gameId}`)
    return []
  }

  return payload.trophies.map(t => {
    return { "game_id": gameId, "trophy_id": t.trophyId, "trophy_type": t.trophyType, "trophy_name": t.trophyName, "trophy_detail": t.trophyDetail, "trophy_icon": t.trophyIconUrl }
  })
}




async function getTrophiesForUser(gameId, userId, service) {  
  const payload = await apiRequest.getTrophiesForUserPayload(gameId, userId, service)
  if (!payload?.hasOwnProperty("trophies")) {
    logger.error(payload, `Could not find trophies for user${userId} game ${gameId}`)
    return []
  }

  const rarest = payload?.rarestTrophies.filter(t => t.earned).map(t => {
    return { "trophy_id": t.trophyId, "trophy_earned": Date.parse(t.earnedDateTime), "trophy_rare": t.trophyRare, "trophy_earned_rate": t.trophyEarnedRate, "user_id": userId, "game_id": gameId }
  })


  var trophies = payload?.trophies.filter(t => t.earned).map(t => {
    return { "trophy_id": t.trophyId, "trophy_earned": Date.parse(t.earnedDateTime), "trophy_rare": t.trophyRare, "trophy_earned_rate": t.trophyEarnedRate, "user_id": userId, "game_id": gameId }
  })

  return rarest.concat(trophies)
}




export default { getTrophiesForUser, getAllTrophiesForGame, getGamesForUser, userInfoByName }