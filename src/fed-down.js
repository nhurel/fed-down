export async function getFediClient(apiType){
    var client
    switch (apiType) {
      case "misskey":
        client = await import("./misskey.js");
        break;
      case "mastodon":
        client = await import("./mastodon.js");
        break;
      case "pixelfed":
        client = await import("./pixelfed.js")
        break;
    }
    return client
}