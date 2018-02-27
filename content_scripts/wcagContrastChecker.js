(function () {
        var body, bodyParent, iframeWidget, iframeContentDocument, iframeBody, highlightedElements,
            contrastCheckerIframeWrapperId = 'contrastCheckerIframeWrapper',
            contrastColorCheckerPort = chrome.runtime.connect({name: 'port-from-cs'}),
            mutationObserverParams = {childList: true, subtree: true},
            defaultDebounceTime = 250;

        if (window.hasContrastColorCheckerRun) {
            return;
        }
        window.hasContrastColorCheckerRun = true;

        body = document.body;
        bodyParent = body.parentNode;

        let bodyMutationEndingObserver, onEndingDOMChangeCallback;

        function replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }

        onEndingDOMChangeCallback = function (mutations) {
            var colorContrastWidget = getWidget(),
                iframeBodyInnerHTML = iframeBody ? replaceAll(iframeBody.innerHTML, ' style="display: none;"', '') : '',
                contrastCheckerWidgetInnerHTML = '<div id="' + contrastCheckerIframeWrapperId + '">' + replaceAll(colorContrastWidget.innerHTML, ' style="display: none;"', '') + '</div>';

            if (replaceAll(iframeBodyInnerHTML, ' collapsed', '') != replaceAll(contrastCheckerWidgetInnerHTML, ' collapsed', '')) {
                updateWidget(colorContrastWidget);
            }
        };
        bodyMutationEndingObserver = addMutationObserver(body, mutationObserverParams, debounceFn(onEndingDOMChangeCallback, false));

        chrome.runtime.onMessage.addListener((message) => {
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
            var tags, elements, validation, colors, elementsByValue, elementsByTag, item, itemContent, itemStyle,
                resultStrings, label,
                fontSize,
                isValidAA, isValidAAA,
                sublist, elementItem, counter,
                results = checkAllElementsInDocument(),
                widgetContent = createElement('div'),
                refreshButton= createElement('button', 'refresh', {id: 'refresh'}),
                closeButton = createElement('button', 'close', {id: 'close'}),
                contrastResults = createElement('ul', '', {id: 'results'}),
                finalResults = createTableResults(),
                notTested = createElement('ul', '', {id: 'notTested'});

            for (resultLabel in results) {
                resultStrings = resultLabel.split('-');
                label = resultStrings[0];
                fontSize = resultStrings[1];

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

                    elementItem = createElement('li', tag + ' (x' + elementsByTag.length + ')', {tabindex: 0});
                    elementItem.addEventListener('focus', highlightElements(elementsByTag));
                    elementItem.addEventListener('blur', removeHighlightFromElements(elementsByTag));
                    sublist.appendChild(elementItem)
                }

                itemContent = label;
                if (validation) {
                    itemContent += ' - ' + fontSize + ' - ' + isValidAA + ' - ' + isValidAAA;
                }
                itemContent += ' (' + counter + ' elements [' + tags.join(', ') + '])';

                itemStyle = colors ? 'color:' + RGBObjectToString(colors.foregroundColor) + ';background-color:' + RGBObjectToString(colors.backgroundColor) : ''

                item = createElement('li', itemContent, {tabindex: 0, style: itemStyle});


                item.addEventListener('focus', highlightElements(elementsByValue));
                item.addEventListener('blur', removeHighlightFromElements(elementsByValue));

                if (sublist.childNodes.length > 1) {
                    item.appendChild(sublist)
                }

                contrastResults.appendChild(item);
            }

            refreshButton.onclick = refreshWidget;
            closeButton.onclick = closeWidget;

            widgetContent.appendChild(refreshButton);
            widgetContent.appendChild(closeButton);
            widgetContent.appendChild(contrastResults);
            widgetContent.appendChild(notTested);

            return widgetContent;

            function createTableResults(){
                var table = createElement('table', '', {id: 'results'}),
                    header = createElement('thead'),
                    headerRow = createElement('tr'),
                    emptyHeader = createElement('th'),
                    AAHeader = createElement('th', 'AA'),
                    AAAHeader = createElement('th', 'AAA'),
                    contrastHeader = createElement('th', 'contrast'),
                    ElementsHeader = createElement('th', 'Elements affected');

                headerRow.appendChild(emptyHeader);
                headerRow.appendChild(AAHeader);
                headerRow.appendChild(AAAHeader);
                headerRow.appendChild(contrastHeader);
                headerRow.appendChild(ElementsHeader);
                header.appendChild(headerRow);
                table.appendChild(header);

                return table;
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
                highlightedElements = elements;
                elements.forEach(function (element) {
                    element.style.outline = '1px solid red';
                });
            }
        }

        function removeHighlightFromElements(elements) {
            return function () {
                highlightedElements = [];
                elements.forEach(function (element) {
                    element.style.outline = '';
                });
            }
        }

        function openWidget(widgetContent) {
            iframeWidget = createIframeWidget(widgetContent);
        }

        function createIframeWidget(widgetContent) {
            var xmlhttp = new XMLHttpRequest(),
                baseURL = chrome.extension.getURL('html/'),
                iframeCSS,
                iframeHead,
                iframeWidget = createElement('iframe', '', {'id': contrastCheckerIframeWrapperId}),
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
            var widget = document.getElementById(contrastCheckerIframeWrapperId),
                widgetParent = widget.parentNode;

            widgetParent.removeChild(widget);
            widgetParent.removeAttribute('data-contrast-checker-active');
            removeHighlightFromElements(highlightedElements)();
            bodyMutationEndingObserver();
        }

        function updateWidget(widgetContent) {
            while (iframeBody.firstChild) {
                iframeBody.removeChild(iframeBody.firstChild);
            }

            iframeBody.appendChild(widgetContent);
            removeHighlightFromElements(highlightedElements)();
        }

        function createElement(tagName, content, parameters) {
            var newElement = document.createElement(tagName),
                textContent;

            if (parameters) {
                for (var parameterName in parameters) {
                    newElement.setAttribute(parameterName, parameters[parameterName]);
                }
            }

            if (content && content.length) {
                textContent = document.createTextNode(content);
                newElement.appendChild(textContent);
            }

            return newElement
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
                o: rgbValues[3] === undefined ? 1 : parseInt(rgbValues[3])
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

        function evaluateColorFromElement(element) {
            var foregroundColor, fontSize, fontWeight, isBold, textType, contrast, evaluation,
                getComputedStyle = document.defaultView.getComputedStyle(element, null),
                largeSize = 24,
                normalSize = 18.6667,
                backgroundColor = backgroundFromAncestorOrSelf(element),
                isVisible = backgroundColor && getComputedStyle.getPropertyValue('display') !== 'none' && getComputedStyle.getPropertyValue('visibility') !== 'hidden';

            fontSize = parseInt(getComputedStyle.getPropertyValue('font-size').replace('px', ''));
            fontWeight = getComputedStyle.getPropertyValue('font-weight');
            isBold = parseInt(fontWeight) >= 700 || fontWeight === 'bold' || fontWeight == 'bolder';

            textType = (fontSize >= largeSize || (fontSize >= normalSize && isBold)) ? 'large' : 'normal';

            evaluation = {
                element: element,
                fontSize: fontSize,
                fontWeight: fontWeight,
                textType: textType
            };

            if (isVisible) {
                foregroundColor = RGBStringToObject(getComputedStyle.getPropertyValue('color'));
                contrast = getContrastDiff(foregroundColor, backgroundColor);

                evaluation.foregroundColor = foregroundColor;
                evaluation.backgroundColor = backgroundColor;
                evaluation.contrast = contrast;
                if (textType === 'normal') {
                    evaluation.isValidAA = contrast >= 4.5;
                    evaluation.isValidAAA = contrast >= 7;
                } else {
                    evaluation.isValidAA = contrast >= 3;
                    evaluation.isValidAAA = contrast >= 4.5;
                }
            }

            return evaluation;

            function backgroundFromAncestorOrSelf(element) {
                var defaultView = document.defaultView,
                    getComputedStyle = defaultView.getComputedStyle(element, null),
                    backgroundColor = getComputedStyle.getPropertyValue('background-color'),
                    RGBValues = RGBStringToObject(backgroundColor),
                    isTransparent = RGBValues.o === 0,
                    isVisible = getComputedStyle.getPropertyValue('display') !== 'none' && getComputedStyle.getPropertyValue('visibility') !== 'hidden';

                if (!isVisible) {
                    return false;
                }

                if (isTransparent || backgroundColor === 'transparent' || !backgroundColor) {
                    if (element.parentNode.tagName.toLowerCase() !== 'body') {
                        return backgroundFromAncestorOrSelf(element.parentNode);
                    } else {
                        return {r: 255, g: 255, b: 255};
                    }
                }

                return RGBStringToObject(backgroundColor);
            }
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
                    colorEvaluation = evaluateColorFromElement(element);
                    tagName = element.tagName.toLowerCase();
                    if (colorEvaluation.contrast) {
                        identifier = colorEvaluation.contrast + '-' + colorEvaluation.textType;

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

            return observer.disconnect;
        }
    }
)();