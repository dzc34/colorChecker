(function () {
        var body, bodyParent, iframeWidget, iframeContentDocument, iframeBody, highlightedElements,
            contrastCheckerIframeWrapperId = 'contrastCheckerIframeWrapper',
            contrastColorCheckerPort = chrome.runtime.connect({name: 'port-from-cs'});

        if (window.hasContrastColorCheckerRun) {
            return;
        }
        window.hasContrastColorCheckerRun = true;

        body = document.body;
        bodyParent = body.parentNode;

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
            var tags, elements, validation, elementsByValue, elementsByTag, item, itemContent, resultStrings, label,
                fontSize,
                isValidAA, isValidAAA,
                sublist, elementItem, counter,
                results = checkAllElementsInDocument(),
                widgetContent = createElement('div'),
                contrastResults = createElement('ul', '', {id: 'results'}),
                notTested = createElement('ul', '', {id: 'notTested'});

            for (resultLabel in results) {
                resultStrings = resultLabel.split('-');
                label = resultStrings[0];
                fontSize = resultStrings[1];

                elements = results[resultLabel].elements;
                validation = results[resultLabel].validation;

                if (validation) {
                    isValidAA = validation.isValidAA;
                    isValidAAA = validation.isValidAAA;
                }

                item = document.createElement('li');
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
                if(validation){
                    itemContent += ' - ' + fontSize + ' - ' + isValidAA + ' - ' + isValidAAA;
                }
                itemContent += ' (' + counter + ' elements [' + tags.join(', ') + '])';

                item = createElement('li', itemContent, {tabindex: 0});


                item.addEventListener('focus', highlightElements(elementsByValue));
                item.addEventListener('blur', removeHighlightFromElements(elementsByValue));

                if (sublist.childNodes.length > 1) {
                    item.appendChild(sublist)
                }

                widgetContent.appendChild(item);
            }

            widgetContent.appendChild(contrastResults);
            widgetContent.appendChild(notTested);
            return widgetContent;
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

        function closeWidget() {
            var widget = document.getElementById(contrastCheckerIframeWrapperId),
                widgetParent = widget.parentNode;

            widgetParent.removeChild(widget);
            widgetParent.removeAttribute('data-contrast-checker-active');
            removeHighlightFromElements(highlightedElements)();
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

//-----------------------------------
//-----------------------------------
        function hexToRGB(hex) {
            var rgbValue;

            hex = shorthandHexToExtended(hex);

            rgbValue = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

            return rgbValue ? {
                r: parseInt(rgbValue[1], 16),
                g: parseInt(rgbValue[2], 16),
                b: parseInt(rgbValue[3], 16)
            } : null;
        }

        function shorthandHexToExtended(shorthandHex) {
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

            return shorthandHex.replace(shorthandRegex, function (m, r, g, b) {
                return '#' + r + r + g + g + b + b;
            });
        }

        function RGBToHex(RGBColor) {
            var RGBValues = extractRGBValues(RGBColor);

            return '#' + decToHex(RGBValues.r) + decToHex(RGBValues.g) + decToHex(RGBValues.b);
        }

        function extractRGBValues(color) {
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

        function hexRGBString(rgbObject) {
            return 'rgb(' + rgbObject.r + ',' + rgbObject.g + ',' + rgbObject.b + ')';
        }

        function RGBhex(originId, destId) {
            var originalValue = document.getElementById(originId).value,
                RGBValues = extractRGBValues(originalValue);

            document.getElementById(destId).value = '#' + decToHex(RGBValues.r) + decToHex(RGBValues.g) + decToHex(RGBValues.b);
        }

// WCAG 2.0 color test
        function getContrastDiff(foreground, background) {
            var higherValue, lowerValue, contrastDiff,
                foregroundLuminosity = obtenluminosidad(foreground.r, foreground.g, foreground.b, 255),
                backgroundLuminosity = obtenluminosidad(background.r, background.g, background.b, 255);

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
        }

// WCAG 1.0 color test
        function getBrightness(rgbColorParams) {
            var brightness = ((rgbColorParams.r * 299) + (rgbColorParams.g * 587) + (rgbColorParams.b * 114)) / 1000;

            return brightness;
        }

// WCAG 1.0 color test
        function getBrightnessDiff(foreground, background) {
            var brightnessForeground = getBrightness(foreground),
                brightnessBackground = getBrightness(background);

            return parseInt(Math.abs(brightnessBackground - brightnessForeground), 10);
            // limit: 125
        }

        function getColorDiff(foreground, background) {
            return Math.abs(background.r - foreground.r) + Math.abs(background.g - foreground.g) + Math.abs(background.b - foreground.b);
            // limit: 500
        }

        function obtenluminosidad(fRed, fGreen, fBlue, fFullScale) {
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


//-----------------------------------
//-----------------------------------
        function evaluateColorFromElement(element) {
            var foregroundColor, backgroundColor, fontSize, fontWeight, isBold, textType, contrast, evaluation,
                getComputedStyle = document.defaultView.getComputedStyle(element, null),
                largeSize = 24,
                normalSize = 18.6667,
                isVisible = getComputedStyle.getPropertyValue('display') !== 'none' && getComputedStyle.getPropertyValue('visibility') !== 'hidden';

            fontSize = parseInt(getComputedStyle.getPropertyValue('font-size').replace('px', ''));
            fontWeight = getComputedStyle.getPropertyValue('font-weight');
            isBold = parseInt(fontWeight) >= 700 || fontWeight === 'bold' || fontWeight == 'bolder';

            textType = (fontSize >= largeSize || (fontSize >= normalSize && isBold)) ? 'large' : 'normal';

            foregroundColor = extractRGBValues(getComputedStyle.getPropertyValue('color'));
            backgroundColor = backgroundFromAncestorOrSelf(element);

            contrast = getContrastDiff(foregroundColor, backgroundColor);

            evaluation = {
                element: element,
                fontSize: fontSize,
                fontWeight: fontWeight,
                textType: textType
            };

            if (isVisible) {
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
        }

//-----------------------------------
//-----------------------------------
        function backgroundFromAncestorOrSelf(element) {
            var defaultView = document.defaultView,
                getComputedStyle = defaultView.getComputedStyle(element, null),
                backgroundColor = getComputedStyle.getPropertyValue('background-color'),
                RGBValues = extractRGBValues(backgroundColor),
                isTransparent = RGBValues.o === 0;

            if (isTransparent || backgroundColor === 'transparent' || !backgroundColor) {
                if (element.parentNode.tagName.toLowerCase() !== 'body') {
                    return backgroundFromAncestorOrSelf(element.parentNode);
                } else {
                    return {r: 255, g: 255, b: 255};
                }
            }

            return extractRGBValues(backgroundColor);
        }

//-----------------------------------
//-----------------------------------

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
                            results[identifier] = {elements: {}, validation: {}};
                            results[identifier].elements[tagName] = [];
                        } else if (!results[identifier].elements[tagName]) {
                            results[identifier].elements[tagName] = [];
                        }

                        results[identifier].elements[tagName].push(element);

                        results[identifier].validation.isValidAA = colorEvaluation.isValidAA;
                        results[identifier].validation.isValidAAA = colorEvaluation.isValidAAA;
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
    }

)();