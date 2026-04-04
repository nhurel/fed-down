
async function loadMenu() {

  console.log("BACKGROUND")
  var options = await browser.storage.sync.get()
  var allAccounts = options.accounts
  if (allAccounts !== undefined && allAccounts.length > 0) {
    console.log("CREATE MENU")
    await browser.contextMenus.create(
      {
        id: "fed-down-selection",
        title: "Share on the fediverse",
        // TODO i18n title: browser.i18n.getMessage("contextMenuItemSelectionLogger"),
        contexts: ["selection"],
      },
    );
    for (let i = 0; i < allAccounts.length; i++) {
      browser.contextMenus.create({
        id: `fed-account-${i}`,
        title: allAccounts[i].handle,
        parentId: "fed-down-selection",
        contexts: ["selection"]
      })
    }  
  }
  
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.startsWith("fed-account")) {
      quote(parseInt(info.menuItemId.split("-").pop()), info.selectionText, tab.url)
    }
  })

  async function quote(accountIndex, text, pageUrl) {
    const notifications = await import("./notifications.js");
    account = allAccounts[accountIndex]
    console.log("CONTEXT MENU", account, text, pageUrl)
    let options = {
      token: account.token,
      apiUrl: account.baseApiUrl
    }
    let message = `> ${text}
    
    ${pageUrl}`
    var response
    switch (account.api) {
      case "misskey":
        response= await misskeyQuote(message, options)
        break;
      case "mastodon":
        //TODO mastodonQuote
        break;
    }
    if(!response.ok){
      notifications.error("Failed to post your quote")
    }else{
      notifications.success("Quote posted !", "💬")
    }

  }


  async function misskeyQuote(message, options){
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
}

loadMenu()
