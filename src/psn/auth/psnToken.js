
import PropertiesReader from 'properties-reader';
import semaphore from 'semaphore'
import logger from '../../logger.js'


const properties = PropertiesReader('psnslackbot.properties');

import fetch from 'node-fetch';

var sem = semaphore(1);
const lock = async () => new Promise((resolve) => { sem.take(() => { resolve(() => { sem.leave() }) }) });

const baseUrl = "https://ca.account.sony.com/api/authz/v3/oauth"



export var token = { 
  accesToken: null,
  expireMoment: 0,


  async get() {    
    const unlock = await lock();
    var token = null;
    
    if (!this.isValid()) {
      const nt = await auth()
      if (nt == null)
        throw new Error("Could not retrieve the token.")
      Object.assign(this, {accesToken: nt.access_token, expireMoment: Date.now() + (nt.expires_in * 1000)})
    }
    unlock();    
    return this.accesToken
  },


  isValid() { 
    return ((this.accesToken != null) && (this.expireMoment > Date.now()))
  }
}




async function auth() { 
  try {
    var key = properties.get("npsso");  
    if (key === null) {
      logger.error("Missing NPSSO Key in psnslackbot.properties")
    } else {       
      const code = await requestCode(key)      
      return await requestToken(code)   
    }
  } catch (error) { 
      logger.error(error, "Fail to retrieve token")
    process.exit(1)
  }
}

async function requestToken(accessCode) {

  const requestUrl = `${baseUrl}/token`;

  const res = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A="
    },
    body: new URLSearchParams({
      code: accessCode,
      redirect_uri: "com.scee.psxandroid.scecompcall://redirect",
      grant_type: "authorization_code",
      token_format: "jwt"
    }).toString()
  });

  const raw = await res.json();

  if (raw == null)
    throw new Error("fail to get token from code")
 
  logger.info("New Token requested")

  return raw
}

async function requestCode(npsso) { 

    const opts = {
        headers: { cookie: `npsso=${npsso}` },
        redirect: "manual"
    };

    const parms =  [
      "access_type=offline", 
      "response_type=code",    
      "client_id=09515159-7237-4370-9b40-3806e67c0891",
      "redirect_uri=com.scee.psxandroid.scecompcall://redirect",
      "scope=psn:mobile.v2.core psn:clientapp"
    ].join("&")

    const url = new URL(`${baseUrl}/authorize`)
    url.search = parms

    var response = await fetch(url, opts)
    var responseHeaders = response.headers
    
    var reg = /[?&]code=(?<code>[^&]+).*$/gm
    
    var matches =  reg.exec(responseHeaders.get('location'))
    const code = matches?.groups?.code
    if (code == null)
      throw new Error("Fail to get code for token")
    
    return code    
}


export default { token }