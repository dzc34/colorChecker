var bio_niq_xpath_colorCheck = {
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
	},
	expresionXpath:function(cadena){
		var documentos = bio_documents_colorCheck.documents();
		var prev = new Array();
		for (var doc_number = 0; doc_number < documentos.length; doc_number++) {
			var elementos = bio_niq_xpath_colorCheck.resuelvexpath(documentos[doc_number], cadena);
			var tmp = prev.concat(elementos);
			prev = tmp
		}
		return prev;
	},
	LimpiarXpath:function(){
		var documentos = bio_documents_colorCheck.documents();
		var tipodocumentos = bio_documents_colorCheck.tipodocuments();
		for (var doc_number = 0; doc_number < documentos.length; doc_number++) {
			localizados = bio_general_colorCheck.getElementsByClassName(documentos[doc_number], '*', 'bio_xpath');
			for (var i = 0; i < localizados.length; i++) {
				localizados[i].className = localizados[i].className.replace('bio_xpath', '');
				if (localizados[i].getAttribute('class') != null && !localizados[i].getAttribute('class')) 
					localizados[i].removeAttribute('class');
				localizados[i].style.outline = '';
				if (localizados[i].getAttribute('style') != null && !localizados[i].getAttribute('style')) 
					localizados[i].removeAttribute('style');
			}
		}
	}
}
