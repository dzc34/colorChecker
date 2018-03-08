(function () {
    var body, bodyParent, iframeWidget, iframeContentDocument, iframeBody, highlightedElements, settings,
        contrastLevelChecker, autoRefreshCheck,
        navigationBar, selectorBar,
        contrastCheckerIframeWrapperId = 'contrastCheckerIframeWrapper',
        contrastCheckerWrapperId = 'contrastCheckerWrapper',
        defaultActivePanel = 'visibleElements',
        visibleElementsPanelClass = 'visibleElements',
        hiddenElementsPanelClass = 'hiddenElements',
        contrastColorCheckerPort = chrome.runtime.connect({name: 'port-from-cs'}),
        mutationObserverParams = {childList: true, subtree: true},
        defaultDebounceTime = 250,
        defaultSettings = {
            contrastLevelChecker: 'AA',
            autoRefreshCheck: 'on'
        },
        defaultForegroundColor = '#000000',
        defaultBackgroundColor = '#FFFFFF',
        KEYS = {
            ENTER: 13,
            SPACE: 32,
            UP_ARROW: 38,
            DOWN_ARROW: 40
        };

    if (window.hasContrastColorCheckerRun) {
        return;
    }
    window.hasContrastColorCheckerRun = true;

    body = document.body;
    bodyParent = body.parentNode;

    let bodyMutationEndingObserver, onEndingDOMChangeCallback;

    chrome.runtime.onMessage.addListener((message) => {
        settings = Object.assign({}, defaultSettings, message.settings);

        contrastLevelChecker = settings.contrastLevelChecker;
        autoRefreshCheck = settings.autoRefreshCheck;

        let colorContrastWidget,
            previous = document.getElementById(contrastCheckerIframeWrapperId);


        if (previous) {
            if (message.action === 'toggle') {
                closeWidget();
            } else if (message.action === 'update') {
                colorContrastWidget = getWidget();
                updateWidget(colorContrastWidget);
            }
        } else if (message.action === 'toggle') {
            colorContrastWidget = getWidget();
            openWidget(colorContrastWidget);
        }
    });

    function getWidget() {
        var tags, elements, validation, colors, elementsByValue, elementsByTag,
            resultStrings, isVisible, contrast, fontSize, isValidAA, isValidAAA,
            sublist, elementItem, counter,
            rowContent, newRow, rowClass,
            visibleElementsCounter = 0,
            invisibleElementsCounter = 0,
            results = checkAllElementsInDocument(),
            widgetContent = createElement('div'),
            visibleElementsTab = generateTabLink('visible elements', visibleElementsPanelClass, true),
            hiddenElementsTab = generateTabLink('hidden elements', hiddenElementsPanelClass),
            contrastResults = createResultsContainer({
                headers: [{content: 'Contrast', colspan: 2}, {
                    content: 'Elements',
                    colspan: 4
                }],
                class: 'results AA',
                tbody: ['visibleElements shown', hiddenElementsPanelClass]
            }),
            tableBody = contrastResults.querySelectorAll('.' + visibleElementsPanelClass)[0],
            tableNoVisibleBody = contrastResults.querySelectorAll('.' + hiddenElementsPanelClass)[0];

        for (resultLabel in results) {
            rowContent = [];
            resultStrings = resultLabel.split('-');
            isVisible = resultStrings[0] === 'true';
            contrast = resultStrings[1];
            fontSize = resultStrings[2];

            elements = results[resultLabel].elements;
            validation = results[resultLabel].validation;
            colors = results[resultLabel].colors;

            if (validation) {
                isValidAA = validation.isValidAA;
                isValidAAA = validation.isValidAAA;
            }

            sublist = createElement('ul');

            counter = 0;
            tags = [];
            elementsByValue = [];

            for (tag in elements) {
                tags.push(tag);
                elementsByTag = elements[tag];
                elementsByValue = elementsByValue.concat(elementsByTag);
                counter += elementsByTag.length;
                elementItem = createElement('li', {content: elementsByTag.length + ' ' + tag, tabindex: 0});
                elementItem.addEventListener('focus', highlightElements(elementsByTag, colors.foregroundColor, colors.backgroundColor));
                elementItem.addEventListener('blur', removeHighlightFromElements(elementsByTag));
                sublist.appendChild(elementItem)
            }

            if (validation) {
                rowClass = isValidAA ? 'validAA' : 'invalidAA';
                rowClass += isValidAAA ? ' validAAA' : ' invalidAAA';
                rowContent.push({content: contrast, rowClass: rowClass, class: 'contrast-value'});

                rowContent.push({
                    content: '',
                    class: 'sample',
                    style: colors ? 'color:' + RGBObjectToString(colors.foregroundColor) + ';background-color:' + RGBObjectToString(colors.backgroundColor) : ''
                });
                rowContent.push({content: fontSize, class: 'font-size'});
            }
            rowContent.push({content: counter.toString(), class: 'elements-counter'});


            if (sublist.childNodes.length > 1) {
                rowContent._expandable = true;
                rowContent.push('[' + tags.join(', ') + ']');
            } else {
                rowContent.push(tags.join(', '));
            }

            rowContent._initialEmptyColumn = true;

            newRow = createRow(rowContent, {tabindex: 0});
            newRow.addEventListener('focus', highlightElements(elementsByValue, colors.foregroundColor, colors.backgroundColor));
            newRow.addEventListener('blur', removeHighlightFromElements(elementsByValue));

            if (sublist.childNodes.length > 1) {
                newRow.querySelectorAll('td:last-child')[0].appendChild(sublist)
            }

            newRow.onkeydown = keyboardHandler;

            if (isVisible) {
                tableBody.appendChild(newRow);
                visibleElementsCounter++;
            } else {
                tableNoVisibleBody.appendChild(newRow);
                invisibleElementsCounter++;
            }
        }

        if (!visibleElementsCounter) {
            tableBody.appendChild(createRow(['', '', '', '', '']));
            tableBody.appendChild(createRow([{content: 'no visible elements detected', class: 'empty', colspan: 100}]));
        }

        if (!invisibleElementsCounter) {
            tableNoVisibleBody.appendChild(createRow(['', '', '', '', '']));
            tableNoVisibleBody.appendChild(createRow([{
                content: 'no hidden elements detected',
                class: 'empty',
                colspan: 100
            }]));
        }

        widgetContent.appendChild(visibleElementsTab);
        widgetContent.appendChild(hiddenElementsTab);
        widgetContent.appendChild(contrastResults);

        getSettings(['activePanel'], setActivePanel);

        sortTable(tableBody, 1);
        sortTable(tableNoVisibleBody, 1);

        return widgetContent;

        function setActivePanel(setting) {
            var activePanel = setting.activePanel;

            if(activePanel){
                switchPanel(activePanel);
            }
        }

        function generateTabLink(tabTex, mapId, isActive) {
            var textNode = createTextNode(tabTex),
                tabButton = createElement('a', {id: mapId + 'Tab', tabindex: 0, class: 'tab ' + (isActive ? 'active' : '')});

            tabButton.onclick = function () {
                switchPanel(mapId);
            };

            tabButton.appendChild(textNode);

            return tabButton;
        }

        function switchPanel(panelId) {
            var tabs = widgetContent.querySelectorAll('.tab'),
                tbodyElements = contrastResults.querySelectorAll('tbody');

            tabs.forEach(function (tab) {
                if (tab.id === panelId + 'Tab') {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            tbodyElements.forEach(function (tbody) {
                if (tbody.classList.contains(panelId)) {
                    tbody.classList.add('shown');
                } else {
                    tbody.classList.remove('shown');
                }
            });

            saveSettings({activePanel: panelId});
        }

        function keyboardHandler(event) {
            var keyCode = event.which,
                row = event.target;

            while (row.tagName.toLowerCase() !== 'tr') {
                row = target.parentNode;
            }

            if (keyCode === KEYS.DOWN_ARROW && row.nextSibling) {
                row.nextSibling.focus();
            } else if (keyCode === KEYS.UP_ARROW && row.previousSibling) {
                row.previousSibling.focus();
            } else if ((keyCode === KEYS.ENTER || keyCode === KEYS.SPACE) && row.classList.contains('expandable')) {
                row.classList.toggle('expanded');
            }


            if (keyCode === KEYS.DOWN_ARROW || keyCode === KEYS.UP_ARROW) {
                event.preventDefault();
            }
        }

        function createResultsContainer(config) {
            var tableWrapper = createElement('div', {class: 'results-container'}),
                table = createTable(config);

            tableWrapper.appendChild(table);

            return tableWrapper;
        }
    }

    function refreshWidget() {
        sendMessageToBackgroundScript({action: 'update'});
    }

    function sendMessageToBackgroundScript(messageObject) {
        try {
            contrastColorCheckerPort.postMessage(messageObject);
        } catch (error) {
        }
    }

    function highlightElements(elements, foreground, background) {
        return function () {
            var foregroundColor = RGBToHex(foreground),
                backgroundColor = RGBToHex(background);

            if (elements) {
                highlightedElements = elements;
                elements.forEach(function (element) {
                    if (element.parentNode) {
                        element.parentNode.insertBefore(createElement('span', {
                            class: 'visualHelper', style: 'display: inline-block; position: absolute;' +
                            'border: 10px solid; border-color: transparent transparent transparent red; ' +
                            'margin-left: -10px; margin-top: -10px; transform: rotate(45deg)'
                        }), element);
                        element.style.boxShadow = 'inset 0 0 0 1px #F00';
                    }
                });

                iframeContentDocument.getElementById('foreground').value = foregroundColor;
                iframeContentDocument.getElementById('foreground-selector').value = foregroundColor;
                iframeContentDocument.getElementById('exampleText').style.color = foregroundColor;

                iframeContentDocument.getElementById('background').value = backgroundColor;
                iframeContentDocument.getElementById('background-selector').value = backgroundColor;
                iframeContentDocument.getElementById('exampleText').style.backgroundColor = backgroundColor;

                singleEvaluation();
            }
        }
    }

    function removeHighlightFromElements(elements) {
        return function () {
            highlightedElements = [];
            var visualHelpers = document.querySelectorAll('.visualHelper');

            for (var i = visualHelpers.length - 1; i >= 0; i--) {
                visualHelpers[i].parentNode.removeChild(visualHelpers[i]);
            }

            if (elements) {
                elements.forEach(function (element) {
                    element.style.boxShadow = '';
                });
            }
        }
    }

    function openWidget(widgetContent) {
        iframeWidget = createIframeWidget(widgetContent);

        if (autoRefreshCheck === 'on') {
            setMutationObserver();
        }
    }

    function setMutationObserver() {
        onEndingDOMChangeCallback = function (mutations) {
            if (
                (mutations[0].addedNodes.length && mutations[0].addedNodes[0].classList && mutations[0].addedNodes[0].classList.contains('visualHelper'))
                || (mutations[0].removedNodes.length && mutations[0].removedNodes[0].classList && mutations[0].removedNodes[0].classList.contains('visualHelper'))
            ) {
                return;
            }

            var colorContrastWidget = getWidget(),
                iframeBodyInnerHTML = iframeBody ? replaceAll(iframeBody.innerHTML, ' style="display: none;"', '') : '',
                contrastCheckerWidgetInnerHTML = '<div id="' + contrastCheckerIframeWrapperId + '">' + replaceAll(colorContrastWidget.innerHTML, ' style="display: none;"', '') + '</div>';

            if (replaceAll(iframeBodyInnerHTML, ' collapsed', '') != replaceAll(contrastCheckerWidgetInnerHTML, ' collapsed', '')) {
                updateWidget(colorContrastWidget);
            }
        };

        bodyMutationEndingObserver = addMutationObserver(body, mutationObserverParams, debounceFn(onEndingDOMChangeCallback, false));
    }

    function createIframeWidget(widgetContent) {
        var xmlhttp = new XMLHttpRequest(),
            baseURL = chrome.extension.getURL('html/'),
            iframeCSS,
            iframeHead,
            iframeWidget = createElement('iframe', {'id': contrastCheckerIframeWrapperId, 'aria-hidden': 'true'}),
            iframeWidgetContentWindow;

        bodyParent.insertBefore(iframeWidget, body);
        bodyParent.setAttribute('data-contrast-checker-active', 'true');
        iframeWidgetContentWindow = iframeWidget.contentWindow;
        iframeWidgetContentWindow.stop();
        iframeContentDocument = iframeWidgetContentWindow.document;
        iframeBody = iframeContentDocument.body;

        xmlhttp.open('GET', baseURL + 'style.css', true);

        xmlhttp.onload = function (e) {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    var widgetWrapper = createElement('div', {
                            id: contrastCheckerWrapperId,
                            class: contrastLevelChecker
                        }),
                        colorTools = createColorTools();

                    navigationBar = createWidgetControlButtons();
                    selectorBar = createSelectorBar();

                    iframeCSS = xmlhttp.responseText;

                    iframeHead = '<base href="' + baseURL + '" /><style>' + iframeCSS + '</style>';

                    iframeContentDocument.head.innerHTML = iframeHead;

                    iframeBody.appendChild(navigationBar);
                    widgetWrapper.appendChild(widgetContent);
                    iframeBody.appendChild(widgetWrapper);
                    iframeBody.appendChild(selectorBar);
                    iframeBody.appendChild(colorTools);
                }
                return iframeWidget;
            }
        };
        xmlhttp.onerror = function (e) {
        };
        xmlhttp.send(null);
    }

    function closeWidget() {
        var widget, widgetParent;

        if (bodyMutationEndingObserver) {
            bodyMutationEndingObserver.disconnect();
        }
        widget = document.getElementById(contrastCheckerIframeWrapperId);
        widgetParent = widget.parentNode;

        widgetParent.removeChild(widget);
        widgetParent.removeAttribute('data-contrast-checker-active');
        removeHighlightFromElements(highlightedElements)();
        saveSettings({activePanel: defaultActivePanel});
    }

    function updateWidget(widgetContent) {
        var contrastCheckerWrapper = iframeContentDocument.getElementById(contrastCheckerWrapperId);

        while (contrastCheckerWrapper.firstChild) {
            contrastCheckerWrapper.removeChild(contrastCheckerWrapper.firstChild);
        }

        contrastCheckerWrapper.appendChild(widgetContent);
        removeHighlightFromElements(highlightedElements)();

        if (bodyMutationEndingObserver) {
            bodyMutationEndingObserver.disconnect();
        }
        if (autoRefreshCheck) {
            setMutationObserver();
        }
    }

    function singleEvaluation() {
        var foregroundColor = iframeContentDocument.getElementById('foreground').value,
            backgroundColor = iframeContentDocument.getElementById('background').value,
            contrast, smallAA, largeAA, smallAAA, largeAAA;

        if (!isValidHex(foregroundColor) || !isValidHex(backgroundColor)) {
            return;
        }

        contrast = getContrastDiff(hexToRGB(foregroundColor), hexToRGB(backgroundColor));
        smallAA = iframeContentDocument.querySelectorAll('.single-validation-AA-small')[0];
        largeAA = iframeContentDocument.querySelectorAll('.single-validation-AA-large')[0];
        smallAAA = iframeContentDocument.querySelectorAll('.single-validation-AAA-small')[0];
        largeAAA = iframeContentDocument.querySelectorAll('.single-validation-AAA-large')[0];

        iframeContentDocument.querySelectorAll('.single-validation-contrast').forEach(function (element) {
            element.innerHTML = contrast;
        });

        if (contrast >= 7) {
            smallAA.classList.add('valid');
            smallAAA.classList.add('valid');
            largeAA.classList.add('valid');
            largeAAA.classList.add('valid');
        } else if (contrast < 7 && contrast >= 4.5) {
            smallAA.classList.add('valid');
            smallAAA.classList.remove('valid');
            largeAA.classList.add('valid');
            largeAAA.classList.add('valid');
        } else if (contrast < 4.5 && contrast >= 3) {
            smallAA.classList.remove('valid');
            smallAAA.classList.remove('valid');
            largeAA.classList.add('valid');
            largeAAA.classList.remove('valid');
        } else if (contrast < 3) {
            smallAA.classList.remove('valid');
            smallAAA.classList.remove('valid');
            largeAA.classList.remove('valid');
            largeAAA.classList.remove('valid');
        }
    }

    function createElement(tagName, parameters) {
        var newElement = document.createElement(tagName),
            textContent;

        if (parameters) {
            for (var parameterName in parameters) {
                if (parameterName !== 'content') {
                    newElement.setAttribute(parameterName, parameters[parameterName]);
                } else {
                    textContent = document.createTextNode(parameters[parameterName]);
                    newElement.appendChild(textContent);
                }
            }
        }

        return newElement
    }

    function createTextNode(text) {
        return document.createTextNode(text);
    }

    function createTable(config) {
        var headerCell,
            table = createElement('table', config.class ? {class: config.class} : {}),
            caption = createElement('caption', {content: config.caption || ''}),
            thead = createElement('thead'),
            headerRow = createElement('tr');

        config.headers.forEach(function (header, index) {
            headerCell = createElement('th', typeof header === 'string' ? {content: header} : header);
            headerCell.onclick = sort(table, index);
            headerRow.appendChild(headerCell);
        });

        if (config.caption) {
            table.appendChild(caption);
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        if (config.tbody) {
            config.tbody.forEach(function (tbodyClass) {
                table.appendChild(createElement('tbody', {class: tbodyClass}));
            });
        } else {
            table.appendChild(createElement('tbody'));
        }

        return table;

        function sort(table, index) {
            return function () {
                sortTable(table.querySelectorAll('tbody')[0], index)
            }
        }
    }

    function createRow(contentArray, parameters) {
        var collapser, cell,
            row = createElement('tr');

        if (contentArray._initialEmptyColumn) {
            if (contentArray._expandable) {
                collapser = createElement('span', {class: 'collapser'});
                collapser.addEventListener('click', toggle(row));
                cell = createElement('td');
                cell.appendChild(collapser);
                row.appendChild(cell);
                row.classList.add('expandable');
            } else {
                row.appendChild(createElement('td'));
            }
        }

        contentArray.forEach(function (cellContent) {
            if (typeof cellContent === 'string') {
                cell = createElement('td', {content: cellContent});
                row.appendChild(cell);
            } else {
                cell = createElement('td', cellContent);
                if (cellContent.rowClass) {
                    cellContent.rowClass.split(' ').forEach(function (rowClass) {
                        row.classList.add(rowClass);
                    });
                }
                row.appendChild(cell);
            }
        });

        if (parameters) {
            for (var parameterName in parameters) {
                row.setAttribute(parameterName, parameters[parameterName]);
            }
        }

        return row;

        function toggle(row) {
            return function (event) {
                row.classList.toggle('expanded');
            }
        }
    }

    function createWidgetControlButtons() {
        var navigationBar = createElement('div', {class: 'navigation-bar'}),
            refreshButton = createElement('button', {content: 'refresh', id: 'refresh'}),
            closeButton = createElement('button', {content: 'close', id: 'closer'});

        refreshButton.onclick = refreshWidget;
        closeButton.onclick = closeWidget;

        navigationBar.appendChild(refreshButton);
        navigationBar.appendChild(closeButton);

        return navigationBar;
    }

    function createSelectorBar() {
        var selectorBar = createElement('div', {class: 'selector-bar'}),
            levelSwitcherLabel = createElement('label', {content: 'WCAG level: ', for: 'levelSwitcher'}),
            levelSwitcher = createSwitcher(
                [
                    {content: 'AA', value: 'AA'},
                    {content: 'AAA', value: 'AAA'}
                ],
                contrastLevelChecker,
                'levelSwitcher',
                switchContrastLevelChecker),
            refreshSwitcherLabel = createElement('label', {
                content: 'Refresh on DOM updates: ',
                for: 'refreshSwitcher'
            }),
            refreshSwitcher = createSwitcher(
                [
                    {content: 'on', value: 'on'},
                    {content: 'off', value: 'off'}
                ],
                autoRefreshCheck,
                'refreshSwitcher',
                switchAutoRefresh);

        selectorBar.appendChild(levelSwitcherLabel);
        levelSwitcherLabel.appendChild(levelSwitcher);
        selectorBar.appendChild(refreshSwitcherLabel);
        refreshSwitcherLabel.appendChild(refreshSwitcher);

        return selectorBar;

        function switchAutoRefresh(value) {
            var colorContrastWidget;

            autoRefreshCheck = value;

            if (value === 'on') {
                colorContrastWidget = getWidget();
                updateWidget(colorContrastWidget);
            } else {
                bodyMutationEndingObserver.disconnect();
            }

            sendMessageToBackgroundScript({
                action: 'saveSettings',
                settings: {autoRefreshCheck: value}
            });
        }

        function switchContrastLevelChecker(classValue) {
            var contrastCheckerWrapper = iframeContentDocument.getElementById(contrastCheckerWrapperId);

            contrastCheckerWrapper.classList.remove('AA');
            contrastCheckerWrapper.classList.remove('AAA');
            contrastCheckerWrapper.classList.add(classValue);

            contrastLevelChecker = classValue;

            sendMessageToBackgroundScript({
                action: 'saveSettings',
                settings: {contrastLevelChecker: classValue}
            });
        }
    }

    function createColorTools() {
        var colorTools = createElement('div', {class: 'color-tools'}),
            inputWrapper = createElement('div', {class: 'color-input'}),
            foregroundInput = createInputForColor('Foreground color (hex.)', 'foreground', defaultForegroundColor),
            backgroundInput = createInputForColor('Background color (hex.)', 'background', defaultBackgroundColor),
            exampleText = createElement('div', {
                content: 'Example text',
                id: 'exampleText',
                style: 'color: ' + defaultForegroundColor + '; background-color: ' + defaultBackgroundColor
            }),
            validationTable = createTable(
                {
                    headers: ['Size', 'Contrast', 'AA', 'AAA'],
                    class: 'single-validation'
                }),
            tableBody = validationTable.querySelector('tbody'),
            rowAA = createRow([
                    {content: 'small', class: 'single-validation-size'},
                    {class: 'single-validation-contrast', content: '21'},
                    {class: 'single-validation-AA-small valid'},
                    {class: 'single-validation-AAA-small valid'}
                ]
            ),
            rowAAA = createRow([
                    {content: 'Large', class: 'single-validation-size'},
                    {class: 'single-validation-contrast', content: '21'},
                    {class: 'single-validation-AA-large valid'},
                    {class: 'single-validation-AAA-large valid'}
                ]
            );

        inputWrapper.appendChild(foregroundInput);
        inputWrapper.appendChild(backgroundInput);
        colorTools.appendChild(inputWrapper);

        tableBody.appendChild(rowAA);
        tableBody.appendChild(rowAAA);

        colorTools.appendChild(validationTable);
        colorTools.appendChild(exampleText);

        return colorTools;

        function createInputForColor(label, inputId, defaultColor) {
            var wrapper = createElement('div', {class: 'color-tool'}),
                inputLabel = createElement('label', {for: inputId, content: label}),
                inputField = createElement('input', {
                    id: inputId,
                    type: 'text',
                    value: defaultColor,
                    placeholder: 'ex. ' + defaultColor
                }),
                colorSelector = createElement('input', {id: inputId + '-selector', type: 'color', value: defaultColor});

            inputField.onchange = function () {
                if (!isValidHex(this.value)) {
                    return;
                }
                colorSelector.value = hexShorthandToExtended(this.value);

                if (inputId === 'foreground') {
                    iframeContentDocument.getElementById('exampleText').style.color = this.value;
                } else {
                    iframeContentDocument.getElementById('exampleText').style.backgroundColor = this.value;
                }
                singleEvaluation();
            };

            colorSelector.onchange = function () {
                inputField.value = this.value;
                if (inputId === 'foreground') {
                    iframeContentDocument.getElementById('exampleText').style.color = this.value;
                } else {
                    iframeContentDocument.getElementById('exampleText').style.backgroundColor = this.value;
                }
                singleEvaluation();
            };

            wrapper.appendChild(inputLabel);
            wrapper.appendChild(inputField);
            wrapper.appendChild(colorSelector);

            return wrapper;
        }
    }

    function createSwitcher(options, value, selectId, callback) {
        var optionElement,
            switcher = createElement('select', {value: value, id: selectId});

        options.forEach(function (option) {
            optionElement = createElement('option', option);
            if (option.value === value) {
                optionElement.setAttribute('selected', 'selected');
            }
            switcher.appendChild(optionElement);

        });

        switcher.onchange = function (event) {
            callback(event.target.value);
        };

        return switcher;
    }

    function getContrastDiff(foreground, background) {
        var higherValue, lowerValue, contrastDiff,
            foregroundLuminosity = getLuminosity(foreground.r, foreground.g, foreground.b, 255),
            backgroundLuminosity = getLuminosity(background.r, background.g, background.b, 255);

        if (foregroundLuminosity > backgroundLuminosity) {
            higherValue = foregroundLuminosity;
            lowerValue = backgroundLuminosity;
        } else {
            higherValue = backgroundLuminosity;
            lowerValue = foregroundLuminosity;
        }
        contrastDiff = (higherValue + 0.05) / (lowerValue + 0.05);
        contrastDiff = Math.round(contrastDiff * 100) / 100; // round to two decimals

        return contrastDiff;

        function getLuminosity(fRed, fGreen, fBlue, fFullScale) {
            var fRedRGB = fRed / fFullScale,
                fGreenRGB = fGreen / fFullScale,
                fBlueRGB = fBlue / fFullScale,
                fLinearisedRed, fLinearisedGreen, fLinearisedBlue;

            if (fRedRGB <= 0.03928) {
                fLinearisedRed = fRedRGB / 12.92;
            } else {
                fLinearisedRed = Math.pow(((fRedRGB + 0.055) / 1.055), 2.4);
            }
            if (fGreenRGB <= 0.03928) {
                fLinearisedGreen = fGreenRGB / 12.92;
            } else {
                fLinearisedGreen = Math.pow(((fGreenRGB + 0.055) / 1.055), 2.4);
            }
            if (fBlueRGB <= 0.03928) {
                fLinearisedBlue = fBlueRGB / 12.92;
            } else {
                fLinearisedBlue = Math.pow(((fBlueRGB + 0.055) / 1.055), 2.4);
            }
            return (0.2126 * fLinearisedRed + 0.7152 * fLinearisedGreen + 0.0722 * fLinearisedBlue);
        }
    }

    function evaluateColorContrastFromElement(element) {
        var foregroundColor, fontSize, fontWeight, isBold, textType, contrast, evaluation,
            getComputedStyle = document.defaultView.getComputedStyle(element, null),
            largeSize = 24,
            normalSize = 18.6667,
            backgroundColor = backgroundFromSelfOrAncestor(element),
            isVisible = backgroundColor.isVisible && isElementVisible(element);

        fontSize = parseInt(getComputedStyle.getPropertyValue('font-size').replace('px', ''));
        fontWeight = getComputedStyle.getPropertyValue('font-weight');
        isBold = parseInt(fontWeight) >= 700 || fontWeight === 'bold' || fontWeight == 'bolder';

        textType = (fontSize >= largeSize || (fontSize >= normalSize && isBold)) ? 'large' : 'small';

        foregroundColor = RGBStringToObject(getComputedStyle.getPropertyValue('color'));
        if (foregroundColor.o > 0 && foregroundColor.o < 1) {
            foregroundColor = getAdjustedColorWithOpacity(foregroundColor, element);
        }
        contrast = getContrastDiff(foregroundColor, backgroundColor);

        evaluation = {
            element: element,
            fontSize: fontSize,
            fontWeight: fontWeight,
            textType: textType,
            foregroundColor: foregroundColor,
            backgroundColor: backgroundColor,
            contrast: contrast,
            isVisible: isVisible
        };

        if (textType === 'small') {
            evaluation.isValidAA = contrast >= 4.5;
            evaluation.isValidAAA = contrast >= 7;
        } else {
            evaluation.isValidAA = contrast >= 3;
            evaluation.isValidAAA = contrast >= 4.5;
        }

        return evaluation;
    }

    function backgroundFromSelfOrAncestor(element) {
        var RGBBackgroundColorObject,
            defaultView = document.defaultView,
            getComputedStyle = defaultView.getComputedStyle(element, null),
            backgroundColor = getComputedStyle.getPropertyValue('background-color'),
            RGBValues = RGBStringToObject(backgroundColor),
            alpha = RGBValues.o,
            isTransparent = alpha === 0,
            isVisible = isElementVisible(element);

        if (isTransparent || backgroundColor === 'transparent' || !backgroundColor) {
            if (element.parentNode.tagName.toLowerCase() !== 'body') {
                return backgroundFromSelfOrAncestor(element.parentNode);
            } else {
                return {r: 255, g: 255, b: 255, o: alpha, isVisible: isVisible};
            }
        } else if (alpha === 1) {
            RGBBackgroundColorObject = RGBStringToObject(backgroundColor);
        } else if (alpha < 1) {
            if (element.parentNode.tagName.toLowerCase() !== 'body') {
                RGBBackgroundColorObject = getAdjustedColorWithOpacity(RGBStringToObject(backgroundColor), element.parentNode);
            } else {
                return {r: 255, g: 255, b: 255, o: alpha, isVisible: isVisible};
            }
        }

        RGBBackgroundColorObject.isVisible = isVisible;

        return RGBBackgroundColorObject;
    }

    function checkAllElementsInDocument() {
        var elementsToCheck, identifier, tagName,
            results = {},
            query = 'body *',
            elementsToExclude = [
                'script', 'noscript', 'hr', 'table', 'tbody', 'thead', 'tfoot', 'tr', 'iframe',
                'option', 'ul', 'ol', 'dl', 'style', 'link', 'iframe', 'object'
            ];

        elementsToExclude.forEach(function (element) {
            query += ':not(' + element + ')';
        });
        query += ':not(tr)';

        elementsToCheck = document.querySelectorAll(query);

        elementsToCheck.forEach(function (element) {
            var colorEvaluation;

            if (hasText(element) || (getValue(element) && element.getAttribute('type') !== 'hidden' && element.getAttribute('type') !== 'color')) {
                colorEvaluation = evaluateColorContrastFromElement(element);
                tagName = element.tagName.toLowerCase();
                if (colorEvaluation.contrast) {
                    identifier = colorEvaluation.isVisible + '-' + colorEvaluation.contrast + '-' + colorEvaluation.textType;

                    if (!results[identifier]) {
                        results[identifier] = {elements: {}, validation: {}, colors: {}};
                        results[identifier].elements[tagName] = [];
                    } else if (!results[identifier].elements[tagName]) {
                        results[identifier].elements[tagName] = [];
                    }

                    results[identifier].elements[tagName].push(element);

                    results[identifier].validation.isValidAA = colorEvaluation.isValidAA;
                    results[identifier].validation.isValidAAA = colorEvaluation.isValidAAA;

                    results[identifier].colors.foregroundColor = colorEvaluation.foregroundColor;
                    results[identifier].colors.backgroundColor = colorEvaluation.backgroundColor;
                } else {
                    if (!results['not_tested']) {
                        results['not_tested'] = {elements: {}};
                        results['not_tested'].elements[tagName] = [];
                    } else if (!results['not_tested'].elements[tagName]) {
                        results['not_tested'].elements[tagName] = [];
                    }

                    results['not_tested'].elements[tagName].push(element);
                }
            }
        });

        return results;
    }

    function getAdjustedColorWithOpacity(color, element) {
        var r1 = color.r,
            g1 = color.g,
            b1 = color.b,
            alpha = color.o,
            backgroundColor, r2, g2, b2;

        if (alpha === 1) {
            return color;
        }

        backgroundColor = backgroundFromSelfOrAncestor(element);

        r2 = backgroundColor.r;
        g2 = backgroundColor.g;
        b2 = backgroundColor.b;

        return {
            r: getAdjustedValueWithAlphaChannel(r1, r2, alpha),
            g: getAdjustedValueWithAlphaChannel(g1, g2, alpha),
            b: getAdjustedValueWithAlphaChannel(b1, b2, alpha),
            o: 1
        };
    }

    function getAdjustedValueWithAlphaChannel(v1, v2, alpha) {
        return Math.floor(v2 + (v1 - v2) * alpha);
    }

    function isValidHex(hexToCheck) {
        if (!hexToCheck || typeof hexToCheck !== 'string' || hexToCheck.indexOf('#') > 0) {
            return false;
        }

        hexToCheck = hexToCheck.replace('#', '');

        switch (hexToCheck.length) {
            case 3:
                return /^[0-9A-F]{3}$/i.test(hexToCheck);
            case 6:
                return /^[0-9A-F]{6}$/i.test(hexToCheck);
            case 8:
                return /^[0-9A-F]{8}$/i.test(hexToCheck);
            default:
                return false;
        }

        return false;
    }

    function hexShorthandToExtended(shorthandHex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

        return shorthandHex.replace(shorthandRegex, function (m, r, g, b) {
            return '#' + r + r + g + g + b + b;
        });
    }

    function RGBStringToObject(color) {
        var separator, rgbValues,
            plainParameters = color.replace('rgb(', '').replace('rgba(', '').replace('(', '').replace(')', '').replace(/ /g, '');

        if (plainParameters.indexOf(',') > -1) {
            separator = ',';
        } else if (plainParameters.indexOf(':') > -1) {
            separator = ':';
        } else if (plainParameters.indexOf('/') > -1) {
            separator = '/';
        } else if (plainParameters.indexOf('.') > -1) {
            separator = '.';
        }
        rgbValues = plainParameters.split(separator);


        return {
            r: parseInt(rgbValues[0]),
            g: parseInt(rgbValues[1]),
            b: parseInt(rgbValues[2]),
            o: rgbValues[3] === undefined ? 1 : parseFloat(rgbValues[3])
        }
    }

    function decToHex(positionInDecimalBase) {
        var positionAsNumber,
            baseString = '0123456789ABCDEF';

        if (positionInDecimalBase == null) {
            return '00';
        }

        positionAsNumber = parseInt(positionInDecimalBase);

        if (isNaN(positionAsNumber)) {
            return '00';
        } else if (positionAsNumber <= 0) {
            return '00';
        } else if (positionAsNumber > 255) {
            return 'FF';
        }

        positionAsNumber = Math.round(positionAsNumber);

        return baseString.charAt((positionAsNumber - positionAsNumber % 16) / 16) + baseString.charAt(positionAsNumber % 16);
    }

    function RGBObjectToString(rgbObject) {
        return 'rgb(' + rgbObject.r + ',' + rgbObject.g + ',' + rgbObject.b + ')';
    }

    function hexToRGB(hex) {
        var rgbValue;

        hex = hexShorthandToExtended(hex);

        rgbValue = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        return rgbValue ? {
            r: parseInt(rgbValue[1], 16),
            g: parseInt(rgbValue[2], 16),
            b: parseInt(rgbValue[3], 16)
        } : null;
    }

    function RGBStringToHex(RGBColor) {
        var RGBValues = RGBStringToObject(RGBColor);

        return '#' + decToHex(RGBValues.r) + decToHex(RGBValues.g) + decToHex(RGBValues.b);
    }

    function RGBToHex(RGBColor) {
        return '#' + decToHex(RGBColor.r) + decToHex(RGBColor.g) + decToHex(RGBColor.b);
    }

    function getValue(input) {
        return input.value;
    }

    function hasText(element) {
        return getChildText(element).trim().length > 0;
    }

    function getTextFromNode(element) {
        if (isTextNode(element)) {
            return element.nodeValue.replace("\"", "'").replace("\"", "'").replace("<", "&lt;").replace(">", "&gt;");
        }

        if (isElementWithAltText(element)) {
            return element.getAttribute('alt') || '';
        }

        return '';
    }

    function getChildText(element) {
        var childNodes,
            text = '';

        if (isTextNode(element)) {
            return element.nodeValue.replace("\"", "'").replace("\"", "'").replace("<", "&lt;").replace(">", "&gt;");
        }

        if (isElementWithAltText(element)) {
            return element.getAttribute('alt') || '';
        }

        childNodes = element.childNodes;

        for (var i = 0, childNodesLength = childNodes.length; i < childNodesLength; i++) {
            text += getTextFromNode(childNodes[i]);
        }

        return text.replace(/\n/g, ' ').replace(/\t/g, ' ').replace(/\s+/gi, ' ');
    }

    function isElementVisible(element) {
        var getComputedStyle = document.defaultView.getComputedStyle(element, null),
            isVisible = getComputedStyle.getPropertyValue('display') !== 'none' && getComputedStyle.getPropertyValue('visibility') !== 'hidden' && isVisibleByPosition(getComputedStyle);

        if (isVisible && element.parentNode.tagName.toLowerCase() !== 'body') {
            isVisible = isElementVisible(element.parentNode);
        }

        return isVisible;

        function isVisibleByPosition(getComputedStyle) {
            var position = getComputedStyle.getPropertyValue('position'),
                isPositioned = position === 'relative' || position === 'absolute',
                top = getComputedStyle.getPropertyValue('top').replace('px', ''),
                left = getComputedStyle.getPropertyValue('left').replace('px', ''),
                zIndex = getComputedStyle.getPropertyValue('z-index');

            return !(isPositioned && ((top.indexOf('-') === 0 && parseInt(top) < -1000) || (left.indexOf('-') === 0 && parseInt(left) < -1000) || zIndex.indexOf('-') === 0));
        }
    }

    function isTextNode(node) {
        return node.nodeType === 3;
    }

    function isCommentNode(node) {
        return node.nodeType === 8;
    }

    function isElementWithAltText(element) {
        var tagName;

        if (isCommentNode(element)) {
            return false;
        }

        tagName = element.tagName.toLowerCase();

        return ((tagName === 'img' || tagName === 'area') && element.getAttribute('alt')) || (tagName === 'input' && element.getAttribute('type') && element.getAttribute('type').toLowerCase() === 'image');
    }

    function getSettings (propertiesToGet, callback){
        chrome.storage.local.get(propertiesToGet, callback);
    }

    function saveSettings(settings){
        chrome.storage.local.set(settings);
    }

    function debounceFn(func, executeAtTheBeginning, wait) {
        var timeout;

        return function () {
            var callNow,
                context = this,
                args = arguments,
                later = function () {
                    timeout = null;
                    if (!executeAtTheBeginning) {
                        func.apply(context, args);
                    }
                };

            callNow = executeAtTheBeginning && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait || defaultDebounceTime);
            if (callNow) {
                func.apply(context, args);
            }
        };
    }

    function addMutationObserver(elementToObserve, config, callback) {
        // Create an observer instance
        var observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(elementToObserve, config);

        return observer;
    }

    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    function sortTable(table, columnIndex) {
        var rows, rowsLength, switching, shouldSwitch, valueA, valueB;

        switching = true;

        while (switching) {
            switching = false;
            rows = table.querySelectorAll('tr');
            rowsLength = rows.length;

            if (rowsLength > 1) {
                for (var i = 0; i < (rowsLength - 1); i++) {
                    shouldSwitch = false;

                    if (rows[i].querySelectorAll('td')[columnIndex] && rows[i + 1].querySelectorAll('td')[columnIndex]) {
                        valueA = parseFloat(rows[i].querySelectorAll('td')[columnIndex].textContent);
                        valueB = parseFloat(rows[i + 1].querySelectorAll('td')[columnIndex].textContent);

                        if (valueA > valueB) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                }

                if (shouldSwitch) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                }
            }
        }
    }
})();