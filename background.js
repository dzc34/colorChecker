var tabId;

// open/close when clicking the toolbar button
chrome.browserAction.onClicked.addListener(injectWCAGContrastScript);

// listen for messages
chrome.runtime.onConnect.addListener(connected);

function injectWCAGContrastScript(tab) {
    tabId = tab.id;

    chrome.tabs
        .executeScript(tabId, {file: 'content_scripts/wcagContrastChecker.js'}, showContrastChecker);

    chrome.tabs
        .insertCSS({file: 'content_scripts/wcagContrastChecker.css'});
}

function connected(portFromCS) {
    portFromCS.onMessage.addListener(function (message) {
        if (message.action === 'update') {
            updateContrastChecker();
        } else if (message.action === 'settings') {
            var openOptionsPage = chrome.runtime.openOptionsPage();

            openOptionsPage.then(reportSuccess, reportError);
        }
    });
}

function sendActionupdateContrastCheckerScript(action) {
    var message = {action: action};

    chrome.tabs
        .sendMessage(tabId, message);
}

function showContrastChecker() {
    sendActionupdateContrastCheckerScript('toggle');
}

function updateContrastChecker() {
    sendActionupdateContrastCheckerScript('update');
}

function reportSuccess() {
}

function reportError(error) {
}
