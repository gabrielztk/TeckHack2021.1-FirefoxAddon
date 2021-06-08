var gettingStoredStats = browser.storage.local.get();

function getActiveTab() {
  return browser.tabs.query({currentWindow: true, active: true});
}

gettingStoredStats.then(results => {
  if (!results.stats) {
    results = {
      host: {},
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
