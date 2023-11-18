import { Database } from 'sqlite-async'
import db from './db.js'

import logger from '../logger.js'

function User({user_id, user_name, slack_id, last_updated}) { 
  this.name = user_name
  this.id = user_id   
  this.lastUpdate = last_updated
  this.slackId = slack_id

  this.save = async () => {
    try {      
      var stmt = await db.prepare("INSERT OR REPLACE INTO users(user_id, user_name, slack_id, last_updated) VALUES(?, ?, ?, ?);")
      await stmt.run(this.id, this.name, this.slackId, Date.now())      
      logger.info({userId: this.id, name: this.name}, `Added/Updated User`)  
      return true
    } catch (e) {
      logger.error(Object.assign(e, {userId: this.id}), `Failed: Added/Updated User.`)
      return false
    }
  }

  this.getGames = async () => {
    try {      


      var stmt = await db.prepare("SELECT user_id, game_id,  game_progress, game_last_updated from user_games where user_id = ?")
      var result = await stmt.all(this.id)      
      logger.info({ user: this.id, total_games: result.length},`Games selected from DB`)        
      return result.map(ug => new UserGame(ug))
    } catch (e) {
      log.error(Object.assign(e, {game: this.id}), `Failed: Get Games for User`)
      return []
    }
  } 
}

function Trophy({trophy_id, game_id, trophy_type, trophy_name, trophy_detail, trophy_icon}) { 
  this.id = trophy_id
  this.gameId = game_id     
  this.type = trophy_type
  this.name = trophy_name
  this.detail = trophy_detail
  this.icon = trophy_icon


  this.save = async () => {
    try {      
      var stmt = await db.prepare("INSERT INTO trophies(trophy_id, game_id, trophy_type, trophy_name, trophy_detail, trophy_icon) VALUES(?, ?, ?, ?, ?, ?);")
      var r = await stmt.run(this.id, this.gameId, this.type, this.name, this.detail, this.icon)            
      logger.debug({trophyId: this.id, userId: this.userId, game: this.gameId }, `Added/Updated trophy`)
      return true
    } catch (e) {
      if (e.code != "SQLITE_CONSTRAINT")
        logger.error(Object.assign(e, {game: this.gameId, trophy: this.id}), `Failed: Added/Updated trophy`)
      return false
    }
  }
}

function Game({game_id, game_name, game_icon, service_name}) { 
  this.name = game_name
  this.id = game_id   
  this.icon = game_icon
  this.service = service_name

  this.save = async () => {
    try {      
      var stmt = await db.prepare("INSERT INTO games(game_id, game_name, game_icon, service_name) VALUES(?, ?, ?, ?);")
      await stmt.run(this.id, this.name, this.icon, this.service_name)      
      logger.debug({game: this.name, id: this.id}, `Added/Updated Game`)
      return true
    } catch (e) {
      if (e.code != "SQLITE_CONSTRAINT")
        logger.error(Object.assign(e, {game: this.id}), `Failed: Added/Updated Game`)
      return false
    }
  }


}



function UserTrophy({trophy_id, game_id, user_id, trophy_earned, trophy_rare, trophy_earned_rate}) { 
  this.trophyId = trophy_id
  this.gameId = game_id
  this.userId = user_id
  this.earned = trophy_earned
  this.rarity = trophy_rare
  this.rate = trophy_earned_rate


  this.save = async () => {
    try {      
      const select = await db.prepare("SELECT * FROM user_trophies where trophy_id = ? and  game_id = ? and user_id = ?")
      const result = await select.all(this.trophyId, this.gameId, this.userId)      
      const isNew = result.length == 0

      if (isNew) {
        const stmt = await db.prepare("INSERT OR REPLACE INTO user_trophies(trophy_id, game_id, user_id, trophy_earned, trophy_rare, trophy_earned_rate) VALUES(?, ?, ?, ?, ?, ?);")
        await stmt.run(this.trophyId, this.gameId, this.userId, this.earned, this.rarity, this.rate)      
        logger.debug({user: this.userId, game: this.gameId, trophy: this.trophyId}, `Added/Updated User-Trophy`)  
      }
      return isNew
    } catch (e) {
      logger.error(Object.assign(e, {userId: this.userId, gameId: this.gameId, trophy: this.trophyId}), `Failed: Added/Updated User-trophy (User: ${this.userId} Game: ${this.gameId} -> trophy: ${this.trophyId}) - ${e}`)
      return false
    }
  }
}


function UserGame({user_id, game_id, game_progress, game_last_updated}) {
  this.userId = user_id
  this.gameId = game_id
  this.gameProgress = game_progress
  this.gameLastUpdated = game_last_updated


  this.save = async () => {
    try {      
      var stmt = await db.prepare("INSERT OR REPLACE INTO user_games(user_id, game_id, game_progress, game_last_updated) VALUES(?, ?, ?, ?);")
      await stmt.all(this.userId, this.gameId, this.gameProgress , this.gameLastUpdated)      
      logger.debug({userId: this.userId, gameId: this.gameId}, `Added/Updated User-Game`)  
      return true
    } catch (e) {
      logger.error(Object.assign(e, {userId: this.userId, gameId: this.gameId}), `Failed: Added/Updated User-Game`)
      return false
    }
  }
}







async function getUsers() { 
  try {
    var r = await db.all("SELECT * from Users");
    return r.map(userDb => new User(userDb))
  } catch (e) {
    logger.error(e, `Failed: to Retrieve users`)
    return []
  }
}


  async function getTrophiesForGame(gameId) {
    try {      
      var stmt = await db.prepare("SELECT * from trophies where game_id = ?")
      var result = await stmt.all(gameId)      
      return result.map(t => new Trophy(t))
    } catch (e) {
      log.error(Object.assign(e, {gameId: this.gameId}), `Failed: Get trophies for Game`)
      return []
    }
  } 



export default { getUsers, getTrophiesForGame, Game, User, UserGame, Trophy, UserTrophy }