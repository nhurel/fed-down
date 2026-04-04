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
export async function post(message, options){
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