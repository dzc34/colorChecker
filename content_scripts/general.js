var bio_general_colorCheck = {
	niquelando: true,
	getText: function(element) {
		if (element.nodeType == 3)
			return element.nodeValue.replace(/\n/g,' ').replace(/\t/g,' ').replace(/  /g,' ').replace(/  /g,' ').replace(/  /g,' ').replace(/  /g,' ');
		if(element.tagName.toLowerCase() == 'img' || element.tagName.toLowerCase() == 'area' || (element.tagName.toLowerCase() == 'input' && element.getAttribute('type').toLowerCase() == 'image')) {
			var alternativas = '';
			if(element.getAttribute('alt')) alternativas += element.getAttribute('alt');
				return alternativas;
		}
		var texto = new Array(), i = 0;
		while(element.childNodes[i]) {
			if(element.childNodes[i].nodeType != 8)
				texto[texto.length] = bio_general_colorCheck.getText(element.childNodes[i]);
			i++;
		}
		return texto.join('').replace(/  /g,'').replace(/   /g,'').replace(/    /g,'').replace(/\n/g,'').replace(/\t/g,'').replace(/  /g,'');
	},
	getText: function(element) {
		if (element.nodeType == 3)
			return element.nodeValue.replace(/\n/g,' ').replace(/\t/g,' ').replace(/  /g,' ').replace(/  /g,' ').replace(/  /g,' ').replace(/  /g,' ');;
		if(element.tagName.toLowerCase() == 'img' || element.tagName.toLowerCase() == 'area' || (element.tagName.toLowerCase() == 'input' && element.getAttribute('type').toLowerCase() == 'image')) {
			var alternativas = '';
			if(element.getAttribute('alt')) alternativas += element.getAttribute('alt');
			return alternativas;
		}
		var texto = new Array();
		if(element.childNodes[0]){
			if(element.childNodes[0].nodeType != 8)
				texto[0] = rumoHeadingsmap_bio_headings.getText(element.childNodes[0]);
		}
		var i = 1;
		if(element.childNodes[i]){
			while(element.childNodes[i]) {
				if(element.childNodes[i]){
					if(element.childNodes[i].nodeType != 8)
						texto[texto.length] = rumoHeadingsmap_bio_headings.getText(element.childNodes[i]);
					i++;
				}
			}
		}
		return texto.join('').replace(/\n/g,' ').replace(/\t/g,' ').replace(/  /g,' ').replace(/  /g,' ').replace(/  /g,' ').replace(/  /g,' ');
	},
	getTextChild: function(element) {
		var texto = '', i = 0;
		if (element.nodeType == 3){
				texto = element.nodeValue;
		}else{
			while(element.childNodes[i]) {
				if (element.childNodes[i].nodeType == 3)
					texto+= element.childNodes[i].nodeValue;
				i++;
			}
			if(element.getAttribute('alt'))
				texto+= element.getAttribute('alt');
		}
		texto = texto.replace('    ','').replace('    ','').replace('   ','').replace('  ','').replace(' ','').replace(/\n/g,'').replace(/\t/g,'').replace(' ','').replace(' ','').replace(' ','').replace(/' '/g,'');
		texto = texto.replace(/\n/g,'').replace(/\t/g,'').replace(/  /g,'').replace(/  /g,'').replace(/  /g,'').replace(/  /g,'');
		return texto.length;
	},
	showHideNext: function(jarljarl){
		if(jarljarl.nextSibling.style.display == ''){
			jarljarl.nextSibling.style.display = 'none';
			jarljarl.style.backgroundImage = 'url(chrome://colorchecker/content/img/pl.png)';
		}else{
			jarljarl.nextSibling.style.display = '';		
			jarljarl.style.backgroundImage = 'url(chrome://colorchecker/content/img/despl.png)';
		}
	},
	getElementsByClassName: function(oElm, strTagName, oClassNames){
		var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
		var arrReturnElements = new Array();
		var arrRegExpClassNames = new Array();
		if(typeof oClassNames == "object"){
			for(var i = 0; i < oClassNames.length; i++){
				arrRegExpClassNames.push(new RegExp("(^|\\s)" + oClassNames[i].replace(/\-/g, "\\-") + "(\\s|$)"));
			}
		}else{
			arrRegExpClassNames.push(new RegExp("(^|\\s)" + oClassNames.replace(/\-/g, "\\-") + "(\\s|$)"));
		}
		var oElement;
		var bMatchesAll;
		for(var j=0; j<arrElements.length; j++){
			oElement = arrElements[j];
			bMatchesAll = true;
			for(var k=0; k<arrRegExpClassNames.length; k++){
				if(!arrRegExpClassNames[k].test(oElement.className)){
					bMatchesAll = false;
					break;                      
				}
			}
			if(bMatchesAll){
				arrReturnElements.push(oElement);
			}
		}
		return (arrReturnElements);
	},
	getElementsByAttribute: function(oElm, strTagName, strAttributeName, strAttributeValue){
		var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
		var arrReturnElements = new Array();
		var oAttributeValue = (typeof strAttributeValue != "undefined")? new RegExp("(^|\\s)" + strAttributeValue + "(\\s|$)", "i") : null;
		var oCurrent;
		var oAttribute;
		for(var i=0; i<arrElements.length; i++){
			oCurrent = arrElements[i];
			oAttribute = oCurrent.getAttribute && oCurrent.getAttribute(strAttributeName);
			if(typeof oAttribute == "string" && oAttribute.length > 0){
				if(typeof strAttributeValue == "undefined" || (oAttributeValue && oAttributeValue.test(oAttribute))){
					arrReturnElements.push(oCurrent);
				}
			}
		}
		return arrReturnElements;
	},
	// Obtiene el nombre del elemento y si tienen el atributo "id" o "class", lo devuelve también
	// Se usa para componer la expresión XPath
	getXPathFromElement:function(htmlElement) {
		if (htmlElement == null || htmlElement.tagName == undefined) {
			return "";
		}
		// Comprueba si tiene un atributo id
		var xpathAttributes = "";
		if (htmlElement.getAttribute("id")!=null) {
			xpathAttributes = xpathAttributes + "@id='" + htmlElement.getAttribute("id").value + "'";	
		}
		// Comprueba si tiene un atributo class
		if (htmlElement.getAttribute("class")!=null) {
			if (xpathAttributes.length > 0) {
				xpathAttributes = xpathAttributes + " or ";
			}
			xpathAttributes = xpathAttributes + "@class='" + htmlElement.getAttribute("class").value + "'";	
		}
		// Incluye los "[" y "]"	
		if (xpathAttributes.length > 0) {
			xpathAttributes = "[" + xpathAttributes + "]";
		}

		xpathExpresion = htmlElement.tagName.toLowerCase() + xpathAttributes; 
		 
		return xpathExpresion;
	},
	// Función recursiva que examina el nombre del tag de cada uno de los padres
	getXPath:function(nodo, cadena) {
		if(!cadena)
			cadena = "";
		if (nodo!=null) {
			cadena = bio_general_colorCheck.getXPath(nodo.parentNode, cadena);
		}
		if (getXPathFromElement(nodo) != "") {
			cadena = cadena + "/" + bio_general_colorCheck.getXPathFromElement(nodo);	
		}
		return cadena;
	},
	resuelvexpath:function(nodo, expresion) {
		var iterator = nodo.evaluate(expresion, nodo, null, XPathResult.ANY_TYPE, null );
		switch(iterator.resultType){
			case 1:
				return iterator.numberValue;
				break;
			case 2:
				return iterator.stringValue;
				break;
			case 4:
				var thisIterator = iterator.iterateNext();
				var encontrados = new Array();
				while (thisIterator) {
					encontrados.push(thisIterator);
					thisIterator = iterator.iterateNext();
				}
				return encontrados;
				break;
		}
	}
}
