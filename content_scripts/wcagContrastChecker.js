(function () {
    var body, bodyParent, iframeWidget, iframeContentDocument, iframeBody, highlightedElements, settings,
        contrastLevelChecker, autoRefreshCheck,
        contrastCheckerIframeWrapperId = 'contrastCheckerIframeWrapper',
        contrastColorCheckerPort = chrome.runtime.connect({name: 'port-from-cs'}),
        mutationObserverParams = {childList: true, subtree: true},
        defaultDebounceTime = 250,
        defaultSettings = {
            contrastLevelChecker: 'AA',
            autoRefreshCheck: 'on'
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
            widgetContent = createElement('div', {class: contrastLevelChecker}),
            refreshButton = createElement('button', {content: 'refresh', id: 'refresh'}),
            closeButton = createElement('button', {content: 'close', id: 'close'}),
            contrastResults = createTable({
                headers: [{content: 'Contrast', colspan: 2}, 'Size', 'Elements'],
                class: 'results AA'
            }),
            contrastResultsNoVisible = createTable({
                headers: [{content: 'Contrast', colspan: 2}, 'Size', 'Elements'],
                class: 'results AA'
            }),
            tableBody = contrastResults.querySelector('tbody'),
            tableNoVisibleBody = contrastResultsNoVisible.querySelector('tbody'),
            notTested = createElement('ul', {class: 'notTested'}),
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

                elementItem = createElement('li', {content: tag + ' (' + elementsByTag.length + ')', tabindex: 0});
                elementItem.addEventListener('focus', highlightElements(elementsByTag));
                elementItem.addEventListener('blur', removeHighlightFromElements(elementsByTag));
                sublist.appendChild(elementItem)
            }

            if (validation) {
                rowClass = isValidAA ? 'validAA' : 'invalidAA';
                rowClass += isValidAAA ? ' validAAA' : ' invalidAAA';
                rowContent.push({content: contrast, rowClass: rowClass, class: 'contrast-value'});
                rowContent.push(fontSize);
            }

            rowContent.push(counter + ' [' + tags.join(', ') + ']');

//                itemStyle = colors ? 'color:' + RGBObjectToString(colors.foregroundColor) + ';background-color:' + RGBObjectToString(colors.backgroundColor) : '';

            if (sublist.childNodes.length > 1) {
                rowContent._ezpandable = true;
            }

            newRow = createRow(rowContent, {tabindex: 0});
            newRow.addEventListener('focus', highlightElements(elementsByValue));
            newRow.addEventListener('blur', removeHighlightFromElements(elementsByValue));

            if (sublist.childNodes.length > 1) {
                newRow.querySelectorAll('td:last-child')[0].appendChild(sublist)
            }

            if (validation) {
                if (isVisible) {
                    tableBody.appendChild(newRow);
                } else {
                    tableNoVisibleBody.appendChild(newRow);
                }
            } else {
                notTested.appendChild(newRow);
            }
        }

        refreshButton.onclick = refreshWidget;
        closeButton.onclick = closeWidget;

        widgetContent.appendChild(refreshButton);
        widgetContent.appendChild(closeButton);
        widgetContent.appendChild(refreshSwitcher);
        widgetContent.appendChild(levelSwitcher);
        widgetContent.appendChild(contrastResults);
        widgetContent.appendChild(contrastResultsNoVisible);
        widgetContent.appendChild(notTested);

        sortTable(tableBody, 1);
        sortTable(tableNoVisibleBody, 1);

        return widgetContent;

        function createRow(contentArray, parameters) {
            var toggleButton, cell,
                row = createElement('tr');

            if (contentArray._ezpandable) {
                toggleButton = createElement('button', {content: '+', class: 'show-tags'});
                toggleButton.onclick = toggle(row);
                cell = createElement('td');
                cell.appendChild(toggleButton);
                row.appendChild(cell);
            } else {
                row.appendChild(createElement('td'));
            }

            contentArray.forEach(function (cellContent) {
                if (typeof cellContent === 'string') {
                    cell = createElement('td', {content: cellContent});
                    row.appendChild(cell);
                } else {
                    cell = createElement('td', {content: cellContent.content});
                    cell.setAttribute('class', cellContent.class);
                    row.setAttribute('class', cellContent.rowClass);
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
                return function () {
                    row.classList.toggle('expanded');
                }
            }
        }

        function createTable(config) {
            var headerCell,
                tableWrapper = createElement('div'),
                table = createElement('table', config.class ? {class: config.class} : {}),
                thead = createElement('thead'),
                tbody = createElement('tbody'),
                headerRow = createElement('tr');

            config.headers.forEach(function (header, index) {
                headerCell = createElement('th', typeof header === 'string' ? {content: header} : header);
                headerCell.onclick = sort(table, index)
                headerRow.appendChild(headerCell);
            });

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
            widgetContent.classList.remove('AA');
            widgetContent.classList.remove('AAA');
            widgetContent.classList.add(classValue);

            contrastLevelChecker = classValue;

            sendMessageToBackgroundScript({
                action: 'saveSettings',
                settings: {contrastLevelChecker: classValue}
            });
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
    }

    function refreshWidget() {
        sendMessageToBackgroundScript({action: 'update'});
    }

    function sendMessageToBackgroundScript(messageObject) {
        contrastColorCheckerPort.postMessage(messageObject);
    }

    function highlightElements(elements) {
        return function () {
            if (elements) {
                highlightedElements = elements;
                elements.forEach(function (element) {
                    element.style.outline = '1px solid red';
                });
            }
        }
    }

    function removeHighlightFromElements(elements) {
        return function () {
            highlightedElements = [];
            if (elements) {
                elements.forEach(function (element) {
                    element.style.outline = '';
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
                    iframeCSS = xmlhttp.responseText;

                    iframeHead = '<base href="' + baseURL + '" /><style>' + iframeCSS + '</style>';

                    iframeContentDocument.head.innerHTML = iframeHead;

                    iframeBody.appendChild(widgetContent);

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
        while (iframeBody.firstChild) {
            iframeBody.removeChild(iframeBody.firstChild);
        }

        iframeBody.appendChild(widgetContent);
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
            isVisible = backgroundColor.isVisible && getComputedStyle.getPropertyValue('display') !== 'none' && getComputedStyle.getPropertyValue('visibility') !== 'hidden';

        fontSize = parseInt(getComputedStyle.getPropertyValue('font-size').replace('px', ''));
        fontWeight = getComputedStyle.getPropertyValue('font-weight');
        isBold = parseInt(fontWeight) >= 700 || fontWeight === 'bold' || fontWeight == 'bolder';

        textType = (fontSize >= largeSize || (fontSize >= normalSize && isBold)) ? 'large' : 'normal';

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
        if (textType === 'normal') {
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
            isVisible = getComputedStyle.getPropertyValue('display') !== 'none' && getComputedStyle.getPropertyValue('visibility') !== 'hidden';

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

    function RGBStringToHex(originId, destId) {
        var originalValue = document.getElementById(originId).value,
            RGBValues = RGBStringToObject(originalValue);

        document.getElementById(destId).value = '#' + decToHex(RGBValues.r) + decToHex(RGBValues.g) + decToHex(RGBValues.b);
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