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
        } else if (message.action === 'saveSettings' && message.settings) {
            chrome.storage.local.set(message.settings);
        }
    });
}

function sendActionToContrastCheckerScript(action) {
    var message = {action: action};

    chrome.storage
        .local.get(['contrastLevelChecker', 'autoRefreshCheck'], sendActionWithSettings);


    function sendActionWithSettings(settings) {
        message.settings = settings;

        chrome.tabs
            .sendMessage(tabId, message);
    }
}

function showContrastChecker() {
    sendActionToContrastCheckerScript('toggle');
}

function updateContrastChecker() {
    sendActionToContrastCheckerScript('update');
}

function reportSuccess() {
}

function reportError(error) {
}
