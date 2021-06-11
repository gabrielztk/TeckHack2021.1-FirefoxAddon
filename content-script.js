// content-script.js

var myPort = browser.runtime.connect({name:"port-from-cs"});
myPort.postMessage({greeting: Object.keys(localStorage)});

myPort.onMessage.addListener(function(m) {
  console.log("In content script, received message from background script: ");
  console.log(m.greeting);
//   console.log(localStorage);
});

document.body.addEventListener("storage", function() {
    myPort.postMessage({greeting: Object.keys(localStorage)});
});