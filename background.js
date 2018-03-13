var tabId,
    scriptToExecute = 'content_scripts/wcagContrastChecker.js',
    cssToInject = 'content_scripts/wcagContrastChecker.css';

// open/close when clicking the toolbar button
chrome.browserAction.onClicked.addListener(injectWCAGContrastScript);

// listen for messages
chrome.runtime.onConnect.addListener(connected);

function injectWCAGContrastScript(tab) {
    tabId = tab.id;

    chrome.tabs
        .executeScript(tabId, {file: scriptToExecute}, showContrastChecker);

    chrome.tabs
        .insertCSS({file: cssToInject});
}

function sendMessage(message, callback) {
    chrome.tabs.sendMessage(tabId, message, callback);
}

function connected(portFromCS) {
    portFromCS.onMessage.addListener(function (message) {
        if (message.action === 'update') {
            updateContrastChecker();
        } else if (message.action === 'saveSettings' && message.settings) {
            chrome.storage.local.set(message.settings);
        } else if (message.action === 'screenCapture') {
            screenCapture();
        }
    });
}

function screenCapture() {
    chrome.tabs.captureVisibleTab({format: 'png'}, sendCaptureToContentScript);

    function sendCaptureToContentScript(data) {
        sendMessage({
            action: 'screenCapture',
            data: data
        }, function () {
        });
    }
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
