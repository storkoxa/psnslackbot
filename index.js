console.log('\x1b[33m Welcome to the app! \x1b[0m');

import userDb from './src/db/userDb.js'
import psn from './src/psn/psnApi.js'
import sendMessage from './src/slack/slackApi.js'
import logger from './src/logger.js'


try {

  // console.log(await psn.userInfoByName("rapharum"))
  // console.log(await psn.userInfoByName("cfcluan"))
  // console.log(await psn.userInfoByName("ZinhoLindoo"))
  // console.log(await psn.userInfoByName("TheSagui"))
  // console.log(await psn.getGamesForUser("7660671830798233026"))


  // const allTrophiesForGame = (await psn.getAllTrophiesForGame('NPWR09525_00', 'trophy')).map(t => new userDb.Trophy(t))
  // console.log(allTrophiesForGame)

  // await sendMessage("Test - Kill Freeza!", "gold", "Test - Kill Freeza without taken damage", "https://i.pinimg.com/236x/81/51/2f/81512fd2b054e870d7861083d8aaffb9.jpg", 0.2, "Danilo", "https://upload.wikimedia.org/wikipedia/en/c/cb/Dbzbox.jpg", "DBZ", 0, 'U0GTETFSP')
  

  // throw new Error("aaa")

  var users = await userDb.getUsers()  
  for (const [userIndex, user] of users.entries()) {
    logger.info("-----")
    var messagesToSend = []

    var currentGames = await user.getGames()    
    var currentGamesMap = new Map(currentGames.map((ug) => [ug.gameId, ug]))

    var psnResponseGames = await psn.getGamesForUser(user.id)
    var gameIdMap = new Map(psnResponseGames.map(game => [game.game_id, new userDb.Game(game)]))
    


    //Register new games
    var gamesToRegister = psnResponseGames.filter(game => !currentGamesMap.has(game.game_id)).map(game => new userDb.Game(game) )    
    for (const game of gamesToRegister)
      await game.save()
  


    //Update User/Games
    var gamesToUpdate = psnResponseGames.filter(game => { 
      const t = currentGamesMap.get(game.game_id)?.gameLastUpdated ? currentGamesMap.get(game.game_id)?.gameLastUpdated : 0
      return (t < game.game_last_updated)
     }).map(userGame => { 
      userGame["user_id"] = user.id
      return new userDb.UserGame(userGame) 
    })

    logger.info({user: user.id, total: gamesToUpdate.length}, "Getting new trophies for games")

    for (const [userGameIndex, userGame] of gamesToUpdate.entries()) {
      
      if (userGameIndex % 20 == 0)
        logger.info({userId: user.userId, processing: userGameIndex, total: gamesToUpdate.length}, `PROCESSING`)
      
      var currentGame = gameIdMap.get(userGame.gameId)

      const allTrophiesForGame = (await psn.getAllTrophiesForGame(userGame.gameId, currentGame.service)).map(t => new userDb.Trophy(t))
      const trophiesMap = new Map(allTrophiesForGame.map(trophy => [trophy.id, trophy]))
      for (const trophy of allTrophiesForGame)
        await trophy.save()


      const userTrophies = (await psn.getTrophiesForUser(userGame.gameId, user.id, currentGame.service)).map(ut => new userDb.UserTrophy(ut))

      for (const ut of userTrophies) {
        const isNewTrophy = await ut.save()
        if (isNewTrophy) {
          messagesToSend.push({user: user, game: currentGame, trophy: trophiesMap.get(ut.trophyId), ut: ut})

        }
      }



      await userGame.save()
    }
    await user.save()

    for (const msg of messagesToSend.slice(0, 3)) {
      logger.info({name: msg.user.name, trophy: msg.trophy.name}, "Sending slack message")
      const a = await sendMessage(msg.trophy.name, msg.trophy.type, msg.trophy.detail, msg.trophy.icon, msg.ut.rate, msg.user.name, msg.game.icon, msg.game.name, msg.ut.rarity, msg.user.slackId)
    }

    
  }

  
  
} catch (e) { 
  logger.error(e, "Fail to run")
}
