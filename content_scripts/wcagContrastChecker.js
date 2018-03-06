(function () {
    var body, bodyParent, iframeWidget, iframeContentDocument, iframeBody, highlightedElements, settings,
        contrastLevelChecker, autoRefreshCheck,
        navigationBar, selectorBar,
        contrastCheckerIframeWrapperId = 'contrastCheckerIframeWrapper',
        contrastCheckerWrapperId = 'contrastCheckerWrapper',
        contrastColorCheckerPort = chrome.runtime.connect({name: 'port-from-cs'}),
        mutationObserverParams = {childList: true, subtree: true},
        defaultDebounceTime = 250,
        defaultSettings = {
            contrastLevelChecker: 'AA',
            autoRefreshCheck: 'on'
        };
    var KEYS = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        RIGHT_ARROW: 39,
        DOWN_ARROW: 40,
        DELETE: 46
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
            results = checkAllElementsInDocument(),
            widgetContent = createElement('div'),
            contrastResults = createResultsContainer({
                caption: 'Visible elements',
                headers: [{content: 'Contrast', colspan: 2}, {content: 'Size', colspan: 2}, {
                    content: 'Elements',
                    colspan: 2
                }],
                class: 'results AA'
            }),
            contrastResultsNoVisible = createResultsContainer({
                caption: 'Hidden elements',
                headers: [{content: 'Contrast', colspan: 2}, {content: 'Size', colspan: 2}, {
                    content: 'Elements',
                    colspan: 2
                }],
                class: 'results AA'
            }),
            tableBody = contrastResults.querySelector('tbody'),
            tableNoVisibleBody = contrastResultsNoVisible.querySelector('tbody');

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
                elementItem.addEventListener('focus', highlightElements(elementsByTag, RGBToHex(colors.foregroundColor), RGBToHex(colors.backgroundColor)));
                elementItem.addEventListener('blur', removeHighlightFromElements(elementsByTag));
                sublist.appendChild(elementItem)
            }

            if (validation) {
                rowClass = isValidAA ? 'validAA' : 'invalidAA';
                rowClass += isValidAAA ? ' validAAA' : ' invalidAAA';
                rowContent.push({content: contrast, rowClass: rowClass, class: 'contrast-value'});
                rowContent.push(fontSize);
            }

            rowContent.push({
                content: '',
                class: 'sample',
                style: colors ? 'color:' + RGBObjectToString(colors.foregroundColor) + ';background-color:' + RGBObjectToString(colors.backgroundColor) : ''
            });
            rowContent.push(counter.toString());
            rowContent.push(tags.join(', '));


            if (sublist.childNodes.length > 1) {
                rowContent._ezpandable = true;
            }

            newRow = createRow(rowContent, {tabindex: 0});
            newRow.addEventListener('focus', highlightElements(elementsByValue, RGBToHex(colors.foregroundColor), RGBToHex(colors.backgroundColor)));
            newRow.addEventListener('blur', removeHighlightFromElements(elementsByValue));

            if (sublist.childNodes.length > 1) {
                newRow.querySelectorAll('td:last-child')[0].appendChild(sublist)
            }

            if (isVisible) {
                tableBody.appendChild(newRow);
            } else {
                tableNoVisibleBody.appendChild(newRow);
            }
        }
        widgetContent.appendChild(contrastResults);
        widgetContent.appendChild(contrastResultsNoVisible);

        sortTable(tableBody, 1);
        sortTable(tableNoVisibleBody, 1);

        return widgetContent;

        function createRow(contentArray, parameters) {
            var collapser, cell,
                row = createElement('tr');

            if (contentArray._ezpandable) {
                collapser = createElement('span', {class: 'collapser'});
                collapser.addEventListener('click', toggle(row));
                cell = createElement('td');
                cell.appendChild(collapser);
                row.appendChild(cell);
                row.classList.add('expandable');
            } else {
                row.appendChild(createElement('td'));
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

            row.onkeydown = keyboardHandler;

            return row;

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
                } else if (keyCode === KEYS.ENTER && row.classList.contains('expandable')) {
                    row.classList.toggle('expanded');
                }


                if (keyCode === KEYS.DOWN_ARROW || keyCode === KEYS.UP_ARROW) {
                    event.preventDefault();
                }
            }

            function toggle(row) {
                return function (event) {
                    row.classList.toggle('expanded');
                }
            }
        }

        function createResultsContainer(config) {
            var headerCell,
                tableWrapper = createElement('div', {class: 'results-container'}),
                table = createElement('table', config.class ? {class: config.class} : {}),
                caption = createElement('caption', {content: config.caption || ''}),
                thead = createElement('thead'),
                tbody = createElement('tbody'),
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
            table.appendChild(tbody);

            tableWrapper.appendChild(table);

            return tableWrapper;

            function sort(table, index) {
                return function () {
                    sortTable(table.querySelectorAll('tbody')[0], index)
                }
            }
        }
    }

    function refreshWidget() {
        sendMessageToBackgroundScript({action: 'update'});
    }

    function sendMessageToBackgroundScript(messageObject) {
        contrastColorCheckerPort.postMessage(messageObject);
    }

    function highlightElements(elements, foreground, background) {
        return function () {
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
                iframeContentDocument.getElementById('foreground').value = foreground;
                iframeContentDocument.getElementById('foreground-selector').value = foreground;
                iframeContentDocument.getElementById('exampleText').style.color = foreground;

                iframeContentDocument.getElementById('background').value = background;
                iframeContentDocument.getElementById('background-selector').value = background;
                iframeContentDocument.getElementById('exampleText').style.backgroundColor = background;
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
            if ((mutations[0].addedNodes.length && mutations[0].addedNodes[0].classList.contains('visualHelper')) || (mutations[0].removedNodes.length && mutations[0].removedNodes[0].classList.contains('visualHelper'))) {
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
            iframeWidget = createElement('iframe', {'id': contrastCheckerIframeWrapperId}),
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

                    return iframeWidget;
                } else {
                    return iframeWidget;
                }
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
            levelSwitcher = createSwitcher(
                [
                    {content: 'level AA', value: 'AA'},
                    {content: 'level AAA', value: 'AAA'}
                ],
                contrastLevelChecker,
                switchContrastLevelChecker),
            refreshSwitcher = createSwitcher(
                [
                    {content: 'auto-refresh on', value: 'on'},
                    {content: 'auto-refresh off', value: 'off'}
                ],
                autoRefreshCheck,
                switchAutoRefresh);

        selectorBar.appendChild(refreshSwitcher);
        selectorBar.appendChild(levelSwitcher);

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
            foregroundInput = createInputForColor('Foreground color', 'foreground', '#000000'),
            backgroundInput = createInputForColor('Background color', 'background', '#FFFFFF'),
            exampleText = createElement('div', {
                content: 'Example text',
                id: 'exampleText',
                style: 'color: #000000; background-color: #FFFFFF'
            });

        colorTools.appendChild(foregroundInput);
        colorTools.appendChild(backgroundInput);
        colorTools.appendChild(exampleText);

        return colorTools;

        function createInputForColor(label, inputId, defaultColor) {
            var wrapper = createElement('div', {class: 'color-tool'}),
                inputLabel = createElement('label', {for: inputId, content: label}),
                inputField = createElement('input', {id: inputId, type: 'text', value: defaultColor}),
                colorSelector = createElement('input', {id: inputId + '-selector', type: 'color', value: defaultColor});

            inputField.onchange = function () {
                colorSelector.value = hexShorthandToExtended(this.value);
                if (inputId === 'foreground') {
                    iframeContentDocument.getElementById('exampleText').style.color = this.value;
                } else {
                    iframeContentDocument.getElementById('exampleText').style.backgroundColor = this.value;
                }
            };

            colorSelector.onchange = function () {
                colorSelector.value = this.value;
                if (inputId === 'foreground') {
                    iframeContentDocument.getElementById('exampleText').style.color = this.value;
                } else {
                    iframeContentDocument.getElementById('exampleText').style.backgroundColor = this.value;
                }
            };

            wrapper.appendChild(inputLabel);
            wrapper.appendChild(inputField);
            wrapper.appendChild(colorSelector);

            return wrapper;
        }
    }

    function createSwitcher(options, value, callback) {
        var optionElement,
            switcher = createElement('select', {value: value});

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

        textType = (fontSize >= largeSize || (fontSize >= normalSize && isBold)) ? 'L' : 'N';

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
        if (textType === 'N') {
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

            for (var i = 0; i < (rowsLength - 1); i++) {
                shouldSwitch = false;

                valueA = parseFloat(rows[i].querySelectorAll('td')[columnIndex].textContent);
                valueB = parseFloat(rows[i + 1].querySelectorAll('td')[columnIndex].textContent);

                if (valueA > valueB) {
                    shouldSwitch = true;
                    break;
                }
            }

            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
})();