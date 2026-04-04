//Search a status agains mastodon-compatible instance
  // options is an obect with apiUrl and token properties
 export async function search(postUrl, options){
    var params = new URLSearchParams()
    params.append("q", postUrl)
    params.append("type", "statuses")
    params.append("resolve", "true")
    params.append("limit", 10)
    let statusResponse = await fetch(`${options.apiUrl}/v2/search?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${options.token}`
      }
    })

    var statuses
    var status
    if (statusResponse.ok) {
      statuses = await statusResponse.json()
      statuses= statuses.statuses
      console.log("STATUS", statuses.length)
    }

    if (statuses && statuses.length > 0) {
      // fixme : compare by removing trailing / ?
      status = statuses.find((s) => s.uri === postUrl || s.url === postUrl)
    }
    return status
  }

  // Adds the note passed as argument to user's favourites
  // options is an object with apiUrl and token properties
 export async function like(noteId, options){
    console.log("MASTODON LIKE", noteId)
    let response = await fetch(`${options.apiUrl}/v1/statuses/${noteId}/favourite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${options.token}`
        },
      })
      return response
  }

  // Boosts the note passed as argument 
  // options is an object with apiUrl and token properties
 export async function boost(noteId, options){
    console.log("MASTODON BOOST", noteId)
    let response = await fetch(`${options.apiUrl}/v1/statuses/${noteId}/reblog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${options.token}`
        },
      })
      return response
  }


// Posts a new status with given message
// options is an object with apiUrl and token properties
 export async function post(message, options){
    console.log("MASTODON POST", options)
    var params = new URLSearchParams()
    params.append("status", message)

    let response = await fetch(`${options.apiUrl}/v1/statuses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${options.token}`
        },
        body: params
      })
      return response
  }