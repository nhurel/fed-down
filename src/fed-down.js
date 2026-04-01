/*async function fetchActivitypub(url){
    var isAP = false
    try {
        const myHeaders = new Headers();
        myHeaders.append("Accept", 'Accept: application/activity+json; profile="https://www.w3.org/ns/activitystreams"');
        console.log("FETCH {}", url, myHeaders)
        response = await fetch(url,
            {
                method: "GET",
                mode: "no-cors",
                redirect: "follow",
                cache: "no-cache",
                headers: myHeaders,
              })

        if(response.ok){
            console.log("OK")
            console.log(response)
            const doc= await response.json()
            console.log("{}", doc)
            if(doc['type'] || doc['@type']){
                isAP = true
            }
        }else{
            console.log("KO")
            console.log(response)
        }
    }catch(error){
        console.log(error)
    }
    if(isAP){
        document.body.style.border = "5px solid lime";
    }else{
        document.body.style.border = "5px solid red";
    }
}
*/




var isAP = false

var url = document.URL
var links = document.head.getElementsByTagName('link')
for (var i =0; i <links.length; i++ ){
    if(links[i].rel === "alternate" && links[i].type === "application/activity+json"){
        url = links[i].href;
        console.log("found link", links[i])
        isAP=true;
        break;
    }
    if(links[i].rel === "canonical" && !document.URL.startsWith(links[i].href)){
        url = links[i].href;
        console.log("found link", links[i])
        isAP=true;
        break;
    }
}
if(!isAP){
    var scripts = document.head.getElementsByTagName('script') 
    for (var i =0; i <scripts.length; i++ ){
        if(scripts[i].type === "application/activity+json"){
            //url = links[i].href;
            console.log("found script", scripts[i])
            isAP=true;
            break;
        }
    }
}

if(isAP){
    console.log("This page is part of the fediverse")
}else{
    console.log("This page is not part of the fediverse")
}

//fetchActivitypub(url)

