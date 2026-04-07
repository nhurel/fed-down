//Search a status agains misskey-compatible instance
// options is an obect with apiUrl and token properties
export async function search(postUrl, options) {
  var status
  var statusResponse = await fetch(options.apiUrl + '/ap/show', {
    method: "POST",
    body: JSON.stringify({
      uri: postUrl,
      limit: 10
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${options.token}`
    }
  })
  if (statusResponse.ok) {
    status = await statusResponse.json()
    console.log("STATUS", status)
    // status id is under object key
    status.id = status.object.id
    return status
  }

  //FALLBACK : the AP resource wasn't found. Trying with a search
  statusResponse = await fetch(options.apiUrl + '/notes/search', {
    method: "POST",
    body: JSON.stringify({
      query: postUrl,
      limit: 10
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${options.token}`
    }
  })

  var statuses
  if (statusResponse.ok) {
    statuses = await statusResponse.json()
    console.log("STATUS", statuses.length)
  }

  if (statuses && statuses.length > 0) {
    // fixme : compare by removing trailing / ?
    status = statuses.find((s) => s.uri === postUrl || s.url === postUrl)
  }
  return status
}

// Adds a :heart: reaction to the status passed as argument
// options is an object with apiUrl and token properties
export async function like(statusId, options) {
  console.log("MISSKEY LIKE", statusId)
  let response = await fetch(options.apiUrl + '/notes/reactions/create', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${options.token}`
    },
    body: JSON.stringify({
      noteId: statusId,
      reaction: ":heart:"
    })
  })
  return response
}

// Boosts the status passed as argument
// options is an object with apiUrl and token properties
export async function boost(statusId, options) {
  console.log("MISSKEY BOOST", statusId)
  let response = await fetch(options.apiUrl + '/notes/create', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${options.token}`
    },
    body: JSON.stringify({
      renoteId: statusId,
    })
  })
  return response
}

// Posts a new note with given message
// options is an object with apiUrl and token properties
export async function post(message, options) {
  var response = await fetch(`${options.apiUrl}/notes/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${options.token}`
    },
    body: JSON.stringify({
      text: message
    },
    )
  })
  return response
}


export async function authenticate(hostname) {
  let redirectUri = browser.identity.getRedirectURL();
  const uuid = self.crypto.randomUUID()
  var params = new URLSearchParams()
  params.append("name", "fed-down-alpha")
  params.append("callback", redirectUri)
  params.append("permission", "read:account,write:notes,write:favorites,write:reactions")

  var response = await browser.identity.launchWebAuthFlow({
    url: `https://${hostname}/miauth/${uuid}?${params}`,
    interactive: true
  })

  response = await fetch(`https://${hostname}/api/miauth/${uuid}/check`, {
      method:"POST",
      headers: {
      "Content-Type": "application/json",
      },
      body:  JSON.stringify({})
    })
  if(!response.ok){
    throw new Error("Failed to check permissions")
  }

  var tokenJson = await response.json()
  return tokenJson.token
}

/*export async function authenticate(hostname){
  var response = await fetch(`https://${hostname}/.well-known/oauth-authorization-server`)
  if (!response.ok) {
    throw new Error("Failed to fetch oauth settings")
  }
  let oauthMetadata = await response.json()
  let redirectUri = browser.identity.getRedirectURL();


  //TODO regenerate on every call
  const pkce_verifier = 'P5ZoKHU6Zlvs8-EHgHLVTlQM5V3Gz-86u0M3rFeExFRCVpDerrbj4ozAqI-OtYkbUShO8QQxd1el2xruk_Yth89_49TvXel_gNSVgM4GQIAhXD2DvH0NvTer_5JfhGCN'
  const pkce_challenge = 'dLHKvBshu-0zI5Ee3lUlcfH67-qhbVcxZg-TRDTqGm4'
  const pkce_method = 'S256'
  const state = "e9iXxJl0s7gy1neZc3CydeQ9Fa0="

  const clientId = redirectUri//"https://fed-down-alpha.com"
  const scope = "read:account write:notes write:favorites write:reactions"

  var params = new URLSearchParams()
  params.append("response_type", "code")
  params.append("client_id", clientId)
  params.append("code_challenge", pkce_challenge)
  params.append("code_challenge_method", pkce_method)
  params.append("redirect_uri", redirectUri)
  params.append("scope", scope)
  params.append("state", state)
  
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
      code_verifier: pkce_verifier,
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope
    })
  })

  if(!response.ok){
    throw new Error("Failed to create application token")
  }
  let tokenResponse = await response.json()
  return tokenResponse.access_token
}*/