import PropertiesReader from 'properties-reader';
const properties = PropertiesReader('psnslackbot.properties');
var webhook = properties.get("webhook");  


function generateFunnyPhrase(rarity, percentage, status, playerName) {
    const phrases = {
        bronze: [
            `Breaking news: ${playerName} achieves bronze – making participation trophies proud everywhere.`,
            `Bronze unlocked! Your gaming skills are officially a step above button-mashing.`,
            `You got bronze! In other news, water is wet, and the sky is blue. Congrats, ${playerName}!`,
            `Bronze status reached! ${playerName}, you're like the Indiana Jones of easy achievements.`,
            `Bronze! Your gaming achievements are as common as finding a four-leaf clover in a field of three-leaf ones, ${playerName}.`,
        ],
        silver: [
            `${playerName}, you're silver-tier! It's like getting a silver medal in a one-person race – still an achievement!`,
            `Silver status reached! Just remember, ${playerName}, second place is just the first loser, but we won't mention that.`,
            `You've earned silver – almost as easy as convincing people that pineapple belongs on pizza, right ${playerName}?`,
            `${playerName}, with silver status, you're like the James Bond of gaming – shaken, not stirred.`,
            `Silver! Your gaming skills are shinier than a disco ball, ${playerName}.`,
            // Add more silver phrases...
        ],
        gold: [
            `Gold achieved! ${playerName}, you're officially fancier than a cat wearing a top hat.`,
            `${playerName}, reaching gold is almost as impressive as teaching cats to do algebra.`,
            `Gold standard unlocked: ${percentage}% of players envy you – the other 50% just pretend they don't.`,
            `Gold status! Your gaming prowess is like finding a needle in a haystack – if the needle was really shiny.`,
            `${playerName}, your gold trophy shines brighter than a supernova in a galaxy of achievements.`,
            // Add more gold phrases...
        ],
        platinum: [
            `Platinum unlocked! ${playerName}, you're so legendary, even Bigfoot is taking notes.`,
            `Platinum status: harder to attain than teaching a parrot Shakespeare, but you did it, ${playerName}!`,
            `Breaking news: ${playerName} enters the gaming hall of fame with a platinum trophy – cue the confetti!`,
            `Platinum! Your gaming achievements are rarer than a unicorn sighting, ${playerName}.`,
            `Platinum status reached! Your gaming skills are the stuff of legends, ${playerName}.`,
            // Add more platinum phrases...
        ],
    };
    const percentageFactor = percentage <= 10 ? 'Achieved by the elite!' : percentage <= 30 ? 'A true feat!' : 'Everyone can do it!';
    const rarityFactor = rarity >= 3 ? 'Piece of cake' : rarity == 2 ? 'Not impressed' : rarity == 1 ? 'Moderate challenge' : 'Epic journey';
    const randomIndex = Math.floor(Math.random() * phrases[status].length);
    const randomPhrase = phrases[status][randomIndex];
    return rarityFactor + "\n" + randomPhrase + " " + percentageFactor
}


const message = (trophy_name, trophy_type, trophy_desc, trophy_icon, percentage, name, game_icon, game_name, trophy_rarity, slackId) => {
  return {
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": `:trophy_${trophy_type}: New trophy for ${name}! :trophy_${trophy_type}:`,
            "emoji": true
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `*Trophy*: ${trophy_name}\n*Desc*: ${trophy_desc}\n*Rarity*: :trophy_${trophy_type}: ${trophy_type} \n\nOnly ${percentage}% got it!`
          },
          "accessory": {
            "type": "image",
            "image_url": `${trophy_icon}`,
            "alt_text": "Trophy"
          }
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": `${generateFunnyPhrase(trophy_rarity, percentage, trophy_type, name)} | Game: ${game_name}`
            },
            {
              "type": "image",
              "image_url": `${game_icon}`,
              "alt_text": "Game Logo"
            }
          ]
        },
        {
          "type": "divider"
        }
      ]
    }
}





async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", 
    body: JSON.stringify(data),
  });
  return response.text();
}




export default async function sendMessage(trophy_name, trophy_type, trophy_desc, trophy_icon, percentage, name, game_icon, game_name, trophy_rarity, slackId) {
  
  return await postData(webhook, message(trophy_name, trophy_type, trophy_desc, trophy_icon, parseFloat(percentage), name, game_icon, game_name, parseFloat(trophy_rarity), slackId))
}
