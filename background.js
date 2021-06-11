var gettingStoredStats = browser.storage.local.get();
var getting = browser.windows.getCurrent({populate: true})

function getActiveTab() {
  return browser.tabs.query({currentWindow: true, active: true});
}

// background-script.js

var portFromCS;

function connected(p) {
  portFromCS = p;
  // portFromCS.postMessage({greeting: "hi there content script!"});
  portFromCS.onMessage.addListener(function(m) {
    // console.log("In background script, received message from content script")
    console.log(m.greeting);
    gettingStoredStats.then(results => {

      results.storage = m.greeting;
      console.log(results);
      browser.storage.local.set(results);
    });
  });
}

browser.runtime.onConnect.addListener(connected);

browser.browserAction.onClicked.addListener(function() {
  portFromCS.postMessage({greeting: "they clicked the button!"});
});

// ========================================== // 

gettingStoredStats.then(results => {
  if (!results.stats) {
    results = {
      host: {},
      storage: []
    };
  }

  browser.webNavigation.onBeforeNavigate.addListener(evt => {

    const tabUrl = new URL(evt.url);

    results.hosts[tabUrl.hostname] = {}

    browser.storage.local.set(results);
  }, {
    url: [{schemes: ["http", "https"]}]});
  
  browser.webRequest.onCompleted.addListener(responseDetails => {
      getActiveTab().then(tabs => {

        let tab = tabs.pop();
        const responseUrl = new URL(responseDetails.url);
        const tabUrl = new URL(tab.url);

        browser.cookies.getAll({url: "https://" + responseUrl.hostname + "/"}).then(cookies => {
          if (tabUrl.hostname != responseUrl.hostname)
          {
            if (!results.host.hasOwnProperty(tabUrl.hostname)) {
              results.host[tabUrl.hostname] = {};
            }
            let cl = cookies.length;
            results.host[tabUrl.hostname][responseUrl.hostname] = cl
          }
          browser.storage.local.set(results);
          });
      });
    },
    {urls: ["<all_urls>"]}
  );
});


