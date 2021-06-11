function sorter(array) {
  return Object.keys(array).sort((a, b) => {
    return array[a] <= array[b];
  });
}

function getActiveTab() {
  return browser.tabs.query({currentWindow: true, active: true});
}

function addElements(element, array, callback) {
  while(element.firstChild) {
    element.removeChild(element.firstChild);
  }

  for (let i=0; i < array.length; i++) {
    const listItem = document.createElement("li");
    listItem.textContent = callback(array[i]);
    element.appendChild(listItem);
  }
}

var gettingStoredStats = browser.storage.local.get();
gettingStoredStats.then(results => {
  getActiveTab().then(tabs => {
      let tab = tabs.pop();
      const tabUrl = new URL(tab.url);

      if (!results.host.hasOwnProperty(tabUrl.hostname)) {
        return;
      }
    
      let hostElement = document.getElementById("hosts");
      let sortedHosts = sorter(results.host[tabUrl.hostname]);
      addElements(hostElement, sortedHosts, (host) => {
        return `${host}`;
      });

      if (results.storage.length > 0)
      {
        let storageElement = document.getElementById("storage");
        addElements(storageElement, results.storage, (host) => {
          return `${host}`;
        });
      }

      browser.cookies.getAll({url: tab.url}).then(cookies => {
        let urls = [{}];

        urls[0]["n_cookies"] = cookies.length;
        urls[0]["url"] = tabUrl.hostname;

        for (let i=0; i < sortedHosts.length; i++) {
          if (results.host[tabUrl.hostname][sortedHosts[i]] > 0)
          {
            urls.push({n_cookies: results.host[tabUrl.hostname][sortedHosts[i]], url: sortedHosts[i]});
          }
        }

        let typeElement = document.getElementById("cookies");
        addElements(typeElement, urls, (url) => {
          if (url.n_cookies > 0)
          return `${url.url}: ${url.n_cookies} cookie(s)`;
        });
      })
  });
});
