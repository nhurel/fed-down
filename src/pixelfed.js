export async function search(postUrl, options) {
  const mastodonClient = await import('./mastodon.js')
  let response = await mastodonClient.search(postUrl, options)
  return response
}

// Adds the note passed as argument to user's favourites
// options is an object with apiUrl and token properties
export async function like(noteId, options) {
  const mastodonClient = await import('./mastodon.js')
  let response = await mastodonClient.like(noteId, options)
  return response
}

// Boosts the note passed as argument 
// options is an object with apiUrl and token properties
export async function boost(noteId, options) {
  const mastodonClient = await import('./mastodon.js')
  let response = await mastodonClient.boost(noteId, options)
  return response
}


// Posts a new status with given message
// options is an object with apiUrl and token properties
export async function post(message, options) {
  const mastodonClient = await import('./mastodon.js')
  let response = await mastodonClient.post(message, options)
  return response
}

export async function refreshToken(account){
  // for pixelfed, account.token contains all information to manage token refresh
  var token = account.token
  //Converting seconds to milliseconds
  var expirationDate = (token.created_at + token.expires_in) *1000 
  if(expirationDate < Date.now() - 60000){
    console.log("token needs to be refreshed")
    var response = await fetch(token.oauth.token_endpoint, {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
        client_id: token.oauth.client_id,
        client_secret: token.oauth.client_secret,
        scope: 'read write'
      })
    })
    if(!response.ok){
      throw new Error("Access token could not be refreshed")
    }
   
    let refreshedToken = await response.json()
    console.log("REFRESHED TOKEN", refreshedToken)
    token.created_at = refreshedToken.created_at
    token.expires_in = refreshedToken.expires_in
    token.access_token = refreshedToken.access_token
    token.refresh_token = refreshedToken.refresh_token
    return true
  }
  return false
}


export async function authenticate(hostname) {
 
  let oauthMetadata = {
    app_registration_endpoint: `https://${hostname}/api/v1/apps`,
    authorization_endpoint: `https://${hostname}/oauth/authorize`,
    token_endpoint: `https://${hostname}/oauth/token`,
  } 
  
 
  let redirectUri = browser.identity.getRedirectURL();
  //register app
   var params = new URLSearchParams()
   params.append("client_name", "fed-down-alpha")
   params.append("redirect_uris", redirectUri)
  var response = await fetch(`${oauthMetadata.app_registration_endpoint}?${params}`,
    {
      method: "POST",
    }
  )
  if (!response.ok) {
    throw new Error("Failed to register the app")
  }
  let oauthInfo = await response.json()

  // create token
  params = new URLSearchParams()
  params.append("response_type", "code")
  params.append("client_id", oauthInfo.client_id)
  params.append("redirect_uri", oauthInfo.redirect_uri)
  params.append("grant_type", "authorization_code")
  params.append("scope", "read write")

  var oauthRedirectUri = await browser.identity.launchWebAuthFlow({
    url: `${oauthMetadata.authorization_endpoint}?${params}`,
    interactive: true,
  })

  params = new URLSearchParams(oauthRedirectUri.split("?").pop())
  let code = params.get("code")

  response = await fetch(oauthMetadata.token_endpoint, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
      },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code: code,
      client_id: oauthInfo.client_id,
      client_secret: oauthInfo.client_secret,
      redirect_uri: redirectUri,
    })
  })
  if(!response.ok){
    throw new Error("Failed to create application token")
  }
  let tokenResponse = await response.json()
  // pixelfed returns expirable token so we must save all the info
  tokenResponse.oauth = oauthInfo
  tokenResponse.oauth.token_endpoint = oauthMetadata.token_endpoint
  return tokenResponse
}