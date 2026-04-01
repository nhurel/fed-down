// TODO add a div.row on fed-react.html for each registered account

async function load() {
  const options = await browser.storage.sync.get()
  const accounts = options.accounts
  if (accounts.length == 0) {
    document.body.appendChild(document.createTextNode("Add accounts in plugin preferences first"))
  }
  for (let i = 0; i < accounts.length; i++) {
    var row = document.createElement("div")
    var img = document.createElement("img")
    img.src = accounts[i].favicon
    row.classList.add("row")
    row.classList.add(accounts[i].api)
    row.setAttribute("data-token", accounts[i].token);
    row.setAttribute('data-base-api-url', accounts[i].baseApiUrl)
    row.appendChild(img)
    row.appendChild(document.createTextNode(accounts[i].handle))

    addActions(row)


    document.getElementById("container").appendChild(row)
  }
}

function addActions(row) {
  console.log("addActions")
  console.log("managing row", row)
  let like = document.createElement("button")
  like.appendChild(document.createTextNode('❤️'))
  if (row.classList.contains("misskey")) {
    like.addEventListener("click", function (e) { e.preventDefault(); doLike(this.parentNode, misskeySearch, misskeyLike) })
  } else if (row.classList.contains("mastodon")) {
    like.addEventListener("click", function (e) { e.preventDefault(); doLike(this.parentNode, mastodonSearch, mastodonLike) })
  }
  row.appendChild(like)

  let boost = document.createElement("button")
  boost.appendChild(document.createTextNode('🔃'))
  if (row.classList.contains("misskey")) {
    boost.addEventListener("click", function (e) { e.preventDefault(); doBoost(this.parentNode, misskeySearch, misskeyBoost) })
  } else if (row.classList.contains("mastodon")) {
    boost.addEventListener("click", function (e) { e.preventDefault(); doBoost(this.parentNode, mastodonSearch, mastodonBoost) })
  }
  row.appendChild(boost)



  //Search a status agains misskey-compatible instance
  // options is an obect with apiUrl and token properties
  async function misskeySearch(postUrl, options){
    let statusResponse = await fetch(options.apiUrl + '/notes/search', {
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
    var status
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
  async function misskeyLike(statusId, options){
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
  async function misskeyBoost(statusId, options){
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

  //Search a status agains mastodon-compatible instance
  // options is an obect with apiUrl and token properties
  async function mastodonSearch(postUrl, options){
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
  async function mastodonLike(noteId, options){
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
  async function mastodonBoost(noteId, options){
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

  async function doLike(row, searchFn, likeFn){
    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
    const postUrl = tabs[0].url
    console.log("LIKE", postUrl)

    let token = row.getAttribute("data-token")
    var apiUrl = row.getAttribute("data-base-api-url")
    var options = {apiUrl: apiUrl, token:token}
    var status = await searchFn(postUrl, options)
    if (status === undefined) {
      error("This page is not part of the fediverse or unknown from your instance. Try to quote it from contextual menu to share what caught your attention")
    } else {
      console.log("LIKE FOUND STATUS", status)
      let response = await likeFn(status.id, options)
      if (!response.ok) {
        error(`Failed to post reaction : ${response.body}`)
      }else{
        success("Reacted to post", "❤️")
      }
    }
  }


  async function doBoost(row, searchFn, boostFn){
    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
    const postUrl = tabs[0].url
    console.log("BOOST", postUrl)

    let token = row.getAttribute("data-token")
    var apiUrl = row.getAttribute("data-base-api-url")
    var options = {apiUrl: apiUrl, token:token}
    var status = await searchFn(postUrl, options)
    if (status === undefined) {
      error("This page is not part of the fediverse or unknown from your instance. Try to quote it from contextual menu to share what caught your attention")
    } else {
      console.log("BOOST FOUND STATUS", status)
      let response = await boostFn(status.id, options)
      if (!response.ok) {
        error(`Failed to boost post : ${response.body}`)
      }else{
        success("Boosted post", "🔃")
      }
    }
  }

  function error(message) {
    browser.notifications.create("", {
      type: "basic",
      message: message,
      title: "Fed-Down error !",
      iconUrl: "../icons/fed-down-96.png"
    })
  }

  async function success(message, icon) {
    browser.notifications.create("", {
      type: "basic",
      message: message,
      title: `Fed-Down ${icon}`,
      iconUrl: "../icons/fed-down-96.png"
    })
  }

}

load()
