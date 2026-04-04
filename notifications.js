// FIXME : remove duplication from popup/fed-react.js

  export function error(message) {
    browser.notifications.create("", {
      type: "basic",
      message: message,
      title: "Fed-Down error !",
      iconUrl: "../icons/fed-down-96.png"
    })
  }

  export function success(message, icon) {
    browser.notifications.create("", {
      type: "basic",
      message: message,
      title: `Fed-Down ${icon}`,
      iconUrl: "../icons/fed-down-96.png"
    })
  }