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


    document.body.appendChild(row)
  }
}

function addActions(row) {
  console.log("addActions")
  console.log("managing row", row)
  let like = document.createElement("button")
  like.appendChild(document.createTextNode('❤️'))
  if (row.classList.contains("misskey")) {
    console.log("MISSKEY ROW")
    like.addEventListener("click", function (e) { e.preventDefault(); misskeyReact(this.parentNode) })
  } else if (row.classList.contains("mastodon")) {
    console.log("MASTODON ROW")
    like.addEventListener("click", function (e) { e.preventDefault(); mastodonLike(this.parentNode) })
  }
  console.log("add like anchor")
  row.appendChild(like)

  async function misskeyReact(row) {
    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
    const postUrl = tabs[0].url
    console.log("MISSKEY REACT", postUrl)

    let token = row.getAttribute("data-token")
    var apiUrl = row.getAttribute("data-base-api-url")
    let statusResponse = await fetch(apiUrl + '/notes/search', {
      method: "POST",
      body: JSON.stringify({
        query: postUrl,
        limit: 10
      }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
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
    if (status === undefined) {
      error(row, "This page is not part of the fediverse or unknown from your instance. Try to quote it from contextual menu to share what caught your attention")
    } else {
      let response = await fetch(apiUrl + '/notes/reactions/create', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          noteId: status.id,
          reaction: ":heart:"
        })
      })
      if (!response.ok) {
        error(row, `Failed to post reaction : ${response.body}`)
      }

    }
  }

  async function mastodonLike(row) {
    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
    const postUrl = tabs[0].url
    console.log("MASTODON LIKE", postUrl)
    let token = row.getAttribute("data-token")
    var apiUrl = row.getAttribute("data-base-api-url")
    var params = new URLSearchParams()
    params.append("q", postUrl)
    params.append("type", "statuses")
    params.append("resolve", "true")
    params.append("limit", 10)
    var searchUrl = `${apiUrl}/v2/search?${params}`
    console.log("MASTODON SEARCH URL", searchUrl)
    let statusResponse = await fetch(`${apiUrl}/v2/search?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
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
    if (status === undefined) {
      error(row, "This page is not part of the fediverse or unknown from your instance. Try to quote it from contextual menu to share what caught your attention")
    } else {
      let response = await fetch(`${apiUrl}/v1/statuses/${status.id}/favourite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      })
      if (!response.ok) {
        error(row, `Failed to post reaction : ${response.body}`)
      }
    }

  }

  function error(row, message) {
    browser.notifications.create("", {
      type: "basic",
      message: message,
      title: "Fed-Down error !",
      iconUrl: "../icons/fed-down-96.png"
    })
  }
}

load()
