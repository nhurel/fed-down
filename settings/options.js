async function getToken(e){
    e.preventDefault();
    const notifications = await import("../notifications.js");
    let fullHandle = document.getElementById("addAccountHandle").value
    let hostname = fullHandle.split("@").pop()
    let apiType = document.getElementById("apiType").value

    var client;
    const factory = await import("../src/fed-down.js")
    client = await factory.getFediClient(apiType)
   
    try{
        //token is an object with access_token property + oauth informations
        var token = await client.authenticate(hostname)
        if(token == undefined){
            throw new Error("Could not create token")
        }
        await addAccount(fullHandle, apiType, token)
    }catch(e){
        console.error(e)
        notifications.error(e.message)
    }
}



async function addAccount(fullHandle, apiType, apiToken){
    console.log("ADD ACCOUNTS")
    var options = await browser.storage.sync.get()
    var allAccounts = options.accounts
    if(!allAccounts){
        allAccounts = []
    }
    
    var apiUrl = `https://${fullHandle.split("@").pop()}`

    if(apiType==='misskey'){
        apiUrl += '/api'
    }else if(apiType === "mastodon" || apiType == "pixelfed"){
        apiUrl += '/api'
    }


    allAccounts.push({
        handle: fullHandle, 
        api: apiType, 
        token: apiToken,
        baseApiUrl: apiUrl,
        favicon: apiType == "misskey" ? `https://${fullHandle.split("@").pop()}/favicon.ico` : "../icons/mastodon.png"
    })
    // options.accounts= allAccounts
    browser.storage.sync.set(options);
    document.getElementById("addAccountHandle").value = ""
    // document.getElementById("apiToken").value = ""
    getAccounts();
    browser.runtime.sendMessage("fed-down-reload")
}

async function deleteAccount(account){
    var options = await browser.storage.sync.get()
    var allAccounts = options.accounts
    allAccounts.splice(account,1)
    browser.storage.sync.set({
        accounts: allAccounts,
    });
    getAccounts()
    browser.runtime.sendMessage("fed-down-reload")
}

async function getAccounts(){
    document.querySelector("#accounts").innerHTML=''
    var options = await browser.storage.sync.get()
    var allAccounts = options.accounts
    console.log("ALL ACCOUNTS ARE ", allAccounts.join(","))
    for(let i = 0; i< allAccounts.length; i++){
        var li = document.createElement("li");
        var a = document.createElement("a")
        a.onclick=function(e){e.preventDefault(); deleteAccount(i)}
        a.href = "#"
        var linkText = document.createTextNode(`Remove ${allAccounts[i].handle}`);
        a.appendChild(linkText);
        li.appendChild(a)
        document.querySelector("#accounts").appendChild(li)
    }

}

document.addEventListener("DOMContentLoaded", getAccounts);
document.querySelector("#addAccount").addEventListener("submit", getToken);