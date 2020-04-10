
// install as a page action
chrome.runtime.onInstalled.addListener(() => {
   chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
     chrome.declarativeContent.onPageChanged.addRules([
       {
         conditions: [
           new chrome.declarativeContent.PageStateMatcher({
             pageUrl: { hostSuffix: 'mail.google.com' },
           })
         ],
         actions: [ new chrome.declarativeContent.ShowPageAction() ],
       }
     ]);
   });
 });
