
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
        contexts: ["selection", "link"],
      },
    );
    for (let i = 0; i < allAccounts.length; i++) {
      browser.contextMenus.create({
        id: `fed-account-${i}`,
        title: allAccounts[i].handle,
        parentId: "fed-down-selection",
        // contexts: ["selection"]
      })
    }
  }

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.startsWith("fed-account")) {
      console.log("LISTEN", info)
      const accountIndex = info.menuItemId.split("-").pop();
      if (info.linkUrl !== undefined) {
        var boost = mayBoost(accountIndex, info.linkUrl)
        if (boost) {
          return
        }
      }
      // contextMenu is not opened from a link or the link is not part of the fediverse :
      //  let's post a message with current tab url
      // and quote selected text if any
      quote(parseInt(accountIndex), info.selectionText, tab.url)
    }
  })

  // mayBoost will try to boost the resource behind the given URL.
  // Returns true if the resource was boosted, false if the resource is not federated or boost failed
  async function mayBoost(accountIndex, url) {
    const notifications = await import("./notifications.js");
    account = allAccounts[accountIndex]
    let options = {
      token: account.token,
      apiUrl: account.baseApiUrl
    }
    switch (account.api) {
      case "misskey":
        client = await import("./src/misskey.js");
        break;
      case "mastodon":
        client = await import("./src/mastodon.js");
        break;
    }

    var status = await client.search(url, options)
    if (status === undefined) {
      return false
    }
    var response = await client.boost(status.id, options)
    if(response.ok){
      notifications.success("Boosted post", "🔃")
    }
    return response.ok
  }

  async function quote(accountIndex, text, pageUrl) {
    const notifications = await import("./notifications.js");
    account = allAccounts[accountIndex]
    console.log("CONTEXT MENU", account, text, pageUrl)
    let options = {
      token: account.token,
      apiUrl: account.baseApiUrl
    }
    let message = "";
    const isQuote = text !== undefined;
    if (isQuote) {
      message += `> ${text}
      
      `
    }
    message += pageUrl
    var response
    var client
    switch (account.api) {
      case "misskey":
        client = await import("./src/misskey.js");
        break;
      case "mastodon":
        client = await import("./src/mastodon.js");
        break;
    }
    response = await client.post(message, options)
    if (!response.ok) {
      notifications.error("Failed to share this page")
    } else {
      if (isQuote) {
        notifications.success("Quote posted !", "💬")
      } else {
        notifications.success("Page link posted", "🔗")
      }
    }

  }
}

loadMenu()

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "fed-down-reload") {
    browser.contextMenus.remove("fed-down-selection")
    loadMenu();
    return true;
  }
});