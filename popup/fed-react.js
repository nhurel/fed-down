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
    // row.setAttribute("data-token", accounts[i].token);
    // row.setAttribute('data-base-api-url', accounts[i].baseApiUrl)
    row.setAttribute('data-index', i)
    row.appendChild(img)
    row.appendChild(document.createTextNode(accounts[i].handle))

    addActions(row)


    document.getElementById("container").appendChild(row)
  }
}

async function addActions(row) {
  console.log("addActions")
  console.log("managing row", row)
  var options = await browser.storage.sync.get()
  var allAccounts = options.accounts
  var account = allAccounts[row.getAttribute("data-index")]

  let like = document.createElement("button")
  like.appendChild(document.createTextNode('❤️'))
  var client
  const factory = await import("../src/fed-down.js")
  client = await factory.getFediClient(account.api)

  like.addEventListener("click", function (e) { e.preventDefault(); doLike(account, client) })
  row.appendChild(like)

  let boost = document.createElement("button")
  boost.appendChild(document.createTextNode('🔃'))
  boost.addEventListener("click", function (e) { e.preventDefault(); doBoost(account, client) })
  
  row.appendChild(boost)


  async function doLike(account, fediClient){
    const notifications = await import("../notifications.js");
    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
    const postUrl = tabs[0].url
    console.log("LIKE", postUrl)

    let refresh = await fediClient.refreshToken(account)
    if( refresh ){
      updateAccount(account)
    }
    var options = {apiUrl: account.baseApiUrl, token:account.token.access_token}

    var status = await fediClient.search(postUrl, options)
    if (status === undefined) {
      notifications.error("This page is not part of the fediverse or unknown from your instance. Try to quote it from contextual menu to share what caught your attention")
    } else {
      console.log("LIKE FOUND STATUS", status)
      let response = await fediClient.like(status.id, options)
      if (!response.ok) {
        notifications.error(`Failed to post reaction : ${response.body}`)
      }else{
        notifications.success("Reacted to post", "❤️")
      }
    }
  }


  async function doBoost(account, fediClient){
    const notifications = await import("../notifications.js");
    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
    const postUrl = tabs[0].url
    console.log("BOOST", postUrl)

    let refresh = await fediClient.refreshToken(account) 
    if( refresh ){
      updateAccount(account)
    }
    var options = {apiUrl: account.baseApiUrl, token:account.token.access_token}
    var status = await fediClient.search(postUrl, options)
    if (status === undefined) {
      notifications.error("This page is not part of the fediverse or unknown from your instance. Try to quote it from contextual menu to share what caught your attention")
    } else {
      console.log("BOOST FOUND STATUS", status)
      let response = await fediClient.boost(status.id, options)
      if (!response.ok) {
        notifications.error(`Failed to boost post : ${response.body}`)
      }else{
        notifications.success("Boosted post", "🔃")
      }
    }
  }

  async function updateAccount(account){
    var options = await browser.storage.sync.get()
    var allAccounts = options.accounts
    for(let i=0; i<allAccounts.length;i++){
      if(allAccounts[i].handle === account.handle){
        allAccounts[i]=account
      }
    }
    // options.accounts= allAccounts
    browser.storage.sync.set(options);
  }

}
load()
