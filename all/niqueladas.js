var bio_niqueladas_colorCheck = {
	informes: new Array(),
	stop: 1,
	wURL: '',
	u: null,
	newTabBrowser: null,
	activar : true,
	luminosidades : new Array(),
	combinacionColores : new Array(),
	nivelJarl : '',
	treecur : '',
	alteracion: 'normal',
	contenido:function(elem,destino){
		elem.style.outline = '';
		if(elem.getAttribute('style') != null && !elem.getAttribute('style'))
			elem.removeAttribute('style');
		var serializer = new XMLSerializer();
		var xml = serializer.serializeToString(elem);
		destino.value = xml.replace('onclick="return false;"','');
		elem.style.outline = bio_niqueladas_colorCheck.borde;
	},
	padre: function(elemento){
		var j = elemento;
		while(j.nodeType != 9)
			j = j.parentNode;
		return j;
	},
	outMark:function(elem){
		elem.style.outline = '';
		if(elem.getAttribute('style') != null && !elem.getAttribute('style'))
			elem.removeAttribute('style');
		var documento = bio_niqueladas_colorCheck.padre(elem);

		elem.style.outline = bio_niqueladas_colorCheck.borde;
		
		var tm = documento.defaultView.getComputedStyle(elem, null).getPropertyValue('color');

		if(tm.indexOf('rgba') > -1){
			var valores = tm.split(',');
			tm = valores[0].replace('rgba','rgb') + ',' + valores[1] + ',' + valores[2] + ')'; 
		}

		bio_niq_color_colorCheck.sendColor(tm,'c_texto');
		bio_niq_color_colorCheck.sendColor(bio_niqueladas_colorCheck.backgroundFromAncestorOrSelf(elem,documento),'c_fondo');
		var etiqueta = document.getElementById('currentElement');
		var fontsize = documento.defaultView.getComputedStyle(elem, null).getPropertyValue('font-size').replace('px','');
		var fontweight = documento.defaultView.getComputedStyle(elem, null).getPropertyValue('font-weight');

		var tam = 'small';
		if(fontsize >= colorCheckerconfig.fntLg || (fontsize >=colorCheckerconfig.fntSm && (fontweight =='bold' || fontweight =='bolder')))
			tam = 'large';
		
	},
	colorElement:function(elem,tipo,discr){
		var colores = new Array();
		var documento = bio_niqueladas_colorCheck.padre(elem);
		if(tipo <= 0 || discr){
			var vision_tipo = 'Normal';
		}else{
			var vision_tipo = document.getElementById('vision_tipo').value;
		}
		try{
			var tm = documento.defaultView.getComputedStyle(elem, null).getPropertyValue('color');

			if(tm.indexOf('rgba') > -1){
				var valores = tm.split(',');
				tm = valores[0].replace('rgba','rgb') + ',' + valores[1] + ',' + valores[2] + ')'; 
			}

			if(tm.replace('rgb(','').replace(')','') == 'transparent')
				return false;
			
			if(tipo <= 0 || discr){
				colores[0] = tm.replace('rgb(','').replace(')','');
			}else{
				colores[0] = bio_niq_color_colorCheck.calDefRev(tm.replace('rgb(','').replace(')',''),vision_tipo);
			}

			tm = bio_niqueladas_colorCheck.backgroundFromAncestorOrSelf(elem,documento);
			if(tm){
				if(tm.indexOf('rgba') > -1){
					var valores = tm.split(',');
					tm = valores[0].replace('rgba','rgb') + ',' + valores[1] + ',' + valores[2] + ')'; 
				}
				if(tipo <= 0 || discr)
					colores[1] = tm.replace('rgb(','').replace(')','');
				else
					colores[1] = bio_niq_color_colorCheck.calDefRev(tm.replace('rgb(','').replace(')',''),vision_tipo);
				if(documento.defaultView.getComputedStyle(elem, null).getPropertyValue('display') == 'none')
					return false;
			}else{
				return false;
			}
		} catch (e) {
			return false;
		}
			
		return colores;
			
	},
	borde: '',
	curelem: '',
	ratonOver:function(e){
		if (!e)
			var e = window.event;
		if (e.target)
			target = e.target;
		else if (e.srcElement)
			target = e.srcElement;
		if(bio_niqueladas_colorCheck.borde){
			var atrib = '';
			if(target.getAttribute('style') != null && !target.getAttribute('style'))
				target.removeAttribute('style');
			if(!target.getAttribute('onclick'))
				target.addEventListener("click", function(){return false}, false); 
			else
				target.addEventListener("click", function(){'return false;' + this.getAttribute('onclick')}, false); 
			var documento = bio_niqueladas_colorCheck.padre(target);
			bio_niqueladas_colorCheck.outMark(target);
			bio_niqueladas_colorCheck.curelem = target;
		}
		if(bio_niqueladas_colorCheck.borde == ''){
			if(target.getAttribute('style') != null && !target.getAttribute('style'))
				target.removeAttribute('style');
			if(target.tagName.toLowerCase() == 'a' || target.tagName.toLowerCase() == 'input' || target.tagName.toLowerCase() == 'area'){
				if(target.getAttribute('onclick')){
					if(target.getAttribute('onclick') == 'return false;')
						target.removeAttribute('onclick');
					if(target.getAttribute('onclick').indexOf('return false;') == 0)
						target.addEventListener("click", function(){this.getAttribute('onclick').replace('return false;','')}, false); 
				}
			}
		}
	},
	ratonOut:function(e){
		if (!e)
			var e = window.event;
		if (e.target)
			target = e.target;
		else if (e.srcElement)
			target = e.srcElement;
		target.style.outline = '';
		if(target.getAttribute('style') != null && !target.getAttribute('style'))
			target.removeAttribute('style');
		if(target.getAttribute('onclick')){
			if(target.getAttribute('onclick') == 'return false;')
				target.removeAttribute('onclick');
			if(target.getAttribute('onclick') && target.getAttribute('onclick').indexOf('return false;') == 0)
				target.addEventListener("click", function(){this.getAttribute('onclick').replace('return false;','')}, false);
		}
	},
	backgroundFromAncestorOrSelf:function(element){
		var act = element;
		var documento = bio_niqueladas_colorCheck.padre(element);
		
		if(documento.defaultView.getComputedStyle(act, null).getPropertyValue('display') == 'none')
			return false;
		
		var col = documento.defaultView.getComputedStyle(act, null).getPropertyValue('background-color');
		while(col == 'transparent'){
			if(act.tagName.toLowerCase()== 'body' || act.tagName.toLowerCase()== 'html'){
				col = 'rgb(255,255,255)';
				break;
			}
			act = act.parentNode;
			col = documento.defaultView.getComputedStyle(act, null).getPropertyValue('background-color');
		}
		if(col.indexOf('rgba') > -1){
			var valores = col.split(',');
			col = valores[0].replace('rgba','rgb') + ',' + valores[1] + ',' + valores[2] + ')'; 
		}
		
		return col;
	},
	ratonClick:function(ch){
	},
	currentElement:function(ch, elem){
	},
	loading: function(v){
		if(v){
			treechildren = document.getElementById('cargador');
			while(treechildren.childNodes.length)
				treechildren.removeChild(treechildren.childNodes[0]);
			if(v == 1)
				document.getElementById('cargador').style.background = '#FFF url(chrome://colorchecker/content/img/ajax-loader.gif) center center no-repeat';
			treechildren = document.getElementById('cargadorWCAG1');
			while(treechildren.childNodes.length)
				treechildren.removeChild(treechildren.childNodes[0]);
			if(v == 1)
				document.getElementById('cargadorWCAG1').style.background = '#FFF url(chrome://colorchecker/content/img/ajax-loader.gif) center center no-repeat';
		}else{
			document.getElementById('cargador').style.background = '';
			document.getElementById('cargadorWCAG1').style.background = '';
		}
	},
	showPan:function(panS){
		if(panS == 1){
			document.getElementById('doc').style.display = 'block';
			document.getElementById('elem').style.display = 'none';
		}else{
			document.getElementById('doc').style.display = 'none';
			document.getElementById('elem').style.display = 'block';
		}
	},
	changeNorma:function(norma){
		if(norma == 3){
			document.getElementById('texto_ejemplo_disc').setAttribute('style','display: none');
		}else{
			if(norma == 1){
				bio_niqueladas_colorCheck.treecur = 'WCAG1';
			}else{
				bio_niqueladas_colorCheck.treecur = '';
			}
			if(document.getElementById('vision_tipo').selectedIndex == 0)
				document.getElementById('texto_ejemplo_disc').setAttribute('style','display: none');
			else
				document.getElementById('texto_ejemplo_disc').setAttribute('style','display: inline');
		}

	},
	jarl:function(norma){
		try{
			var analiza = true;
			var continua = true;
			bio_niqueladas_colorCheck.loading(1);
			var nivel = document.getElementById('optLevels').selectedItem.id;
			bio_niqueladas_colorCheck.nivelJarl = nivel;
			bio_niqueladas_colorCheck.luminosidades = [];
			bio_niqueladas_colorCheck.combinacionColores = [];
			var difBrillo = new Array();
			var difColor =  new Array();
			treechildren = document.getElementById('cargador');
			treechildren.setAttribute('class',treechildren.getAttribute('class').replace('cargando',''));
			treechildrenWCAG1 = document.getElementById('cargadorWCAG1');
			treechildrenWCAG1.setAttribute('class',treechildrenWCAG1.getAttribute('class').replace('cargando',''));
			var lumOrder = new Array();
			var documentos = bio_documents_colorCheck.documents();
			
			for (var doc_number = 0; doc_number < documentos.length; doc_number++) {
				if(documentos[doc_number].getElementsByTagName('body')[0]){
					var base = documentos[doc_number].getElementsByTagName('body')[0];
				}
				if(base){
					var cadXpath = '//*[ ';
					cadXpath += 'not(name() = "HEAD") ';
					cadXpath += 'and not(name() = "head") ';
					cadXpath += 'and not(@type = "hidden") and not(@type = "HIDDEN") ';
					cadXpath += 'and not(@id = "prog_colorCheck") and not(./parent[@id = "prog_colorCheck"]) ';
					cadXpath += 'and not(name() = "SCRIPT") and not(name() = "NOSCRIPT") and not(./ancestor::*[name() = "NOSCRIPT"]) ';
					cadXpath += 'and not(name() = "script") and not(name() = "noscript") and not(./ancestor::*[name() = "noscript"]) ';
					cadXpath += 'and not(name() = "HR") and not(name() = "PARAM") ';
					cadXpath += 'and not(name() = "hr") and not(name() = "param") ';
					cadXpath += 'and not(name() = "STYLE") and not(name() = "TITLE") ';
					cadXpath += 'and not(name() = "style") and not(name() = "title") ';
					cadXpath += 'and not(name() = "LINK") and not(name() = "META") ';
					cadXpath += 'and not(name() = "link") and not(name() = "meta") ';
					cadXpath += 'and not(name() = "OBJECT") and not(name() = "EMBED") and not(name() = "IFRAME") and not(name() = "FRAMESET") ';
					cadXpath += 'and not(name() = "object") and not(name() = "embed") and not(name() = "iframe") and not(name() = "frameset") ';
					cadXpath += 'and not(name() = "IFRAME") and not(name() = "FRAMESET") ';
					cadXpath += 'and not(name() = "iframe") and not(name() = "frameset") ';
					cadXpath += 'and count(./ancestor::object) = 0 ';
					cadXpath += ']';
					var elementos = bio_niq_xpath_colorCheck.resuelvexpath(documentos[doc_number],cadXpath);
					elementos[elementos.length] = base;
					for (var i = 0; i < elementos.length; i++) {
						var elemento = elementos[i].tagName.toLowerCase();
						if((bio_general_colorCheck.getTextChild(elementos[i]) || elemento == 'textarea' || (elemento == 'input' && elementos[i].getAttribute('type') && elementos[i].getAttribute('type') != 'hidden')) && elemento != 'script' && elemento != 'noscript'){
							var colores = bio_niqueladas_colorCheck.colorElement(elementos[i],document.getElementById('vision_tipo').selectedIndex,false);
							if(colores){
								
								var fontsize = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('font-size').replace('px','');

								var fontweight = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('font-weight');
								var tam = 'small';
								if(fontsize >= colorCheckerconfig.fntLg || (fontsize >=colorCheckerconfig.fntSm && (fontweight =='bold' || fontweight =='bolder')))
									tam = 'large';
								var lum = bio_niq_color_colorCheck.luminosidadElements(colores[0], colores[1]);
								var texto = {};
								texto.red = colores[0].split(',')[0];
								texto.green = colores[0].split(',')[1];
								texto.blue = colores[0].split(',')[2];

								var brilloPrimerPlano = bio_niq_color_colorCheck.obtenBrillo(texto);
								
								var fondo = {};
								fondo.red = colores[1].split(',')[0];
								fondo.green = colores[1].split(',')[1];
								fondo.blue = colores[1].split(',')[2];
								var brilloSegundoPlano = bio_niq_color_colorCheck.obtenBrillo(fondo);

								var diferenciaBrillo = parseInt(Math.abs(brilloSegundoPlano-brilloPrimerPlano), 10);
								var diferenciaColor = Math.abs(fondo.red - texto.red) + Math.abs(fondo.green - texto.green) + Math.abs(fondo.blue - texto.blue);

								var identificador = lum + '-' + tam;
								var identificadorWCAG1 = lum + '-';
								
								if(!bio_niqueladas_colorCheck.luminosidades[identificadorWCAG1]){
									bio_niqueladas_colorCheck.luminosidades[identificadorWCAG1] = new Array;
									bio_niqueladas_colorCheck.luminosidades[identificadorWCAG1][elemento] = new Array;
									bio_niqueladas_colorCheck.luminosidades[identificadorWCAG1][elemento].push(elementos[i]);
									if(lumOrder.indexOf(lum) == -1){
										lumOrder.push(lum);
									}
									difBrillo[identificadorWCAG1] = diferenciaBrillo;
									difColor[identificadorWCAG1] =  diferenciaColor;
									bio_niqueladas_colorCheck.combinacionColores[identificadorWCAG1] = colores;
								}else{
									if(!bio_niqueladas_colorCheck.luminosidades[identificadorWCAG1][elemento])
										bio_niqueladas_colorCheck.luminosidades[identificadorWCAG1][elemento] = new Array;
									bio_niqueladas_colorCheck.luminosidades[identificadorWCAG1][elemento].push(elementos[i]);
								}
								
								if(!bio_niqueladas_colorCheck.luminosidades[identificador]){
									bio_niqueladas_colorCheck.luminosidades[identificador] = new Array;
									bio_niqueladas_colorCheck.luminosidades[identificador][elemento] = new Array;
									bio_niqueladas_colorCheck.luminosidades[identificador][elemento].push(elementos[i]);
									if(lumOrder.indexOf(lum) == -1){
										lumOrder.push(lum);
									}
									difBrillo[identificador] = diferenciaBrillo;
									difColor[identificador] =  diferenciaColor;
									bio_niqueladas_colorCheck.combinacionColores[identificador] = colores;
								}else{
									if(!bio_niqueladas_colorCheck.luminosidades[identificador][elemento])
										bio_niqueladas_colorCheck.luminosidades[identificador][elemento] = new Array;
									bio_niqueladas_colorCheck.luminosidades[identificador][elemento].push(elementos[i]);
								}
							}
						}
					}
				}
			}
			var inf = 3;
			var sup  = 4.5;
			if(nivel == 'AAA'){
				inf = 4.5;
				sup = 7
			}
			lumOrder = bio_niqueladas_colorCheck.ordena(lumOrder); // para poder ordenar por los valores de luminosidad
			
			var newOrder = new Array();
			var newOrderWcag1 = new Array();
			
			for (var i = 0; i < lumOrder.length; i++){
				if(bio_niqueladas_colorCheck.luminosidades[lumOrder[i] + '-small'])
					newOrder.push(lumOrder[i] + '-small');
				if(bio_niqueladas_colorCheck.luminosidades[lumOrder[i] + '-large'])
					newOrder.push(lumOrder[i] + '-large');
				newOrderWcag1.push(lumOrder[i] + '-');
			}
			for (var i = 0; i < newOrderWcag1.length; i++){
				var treeitem = document.createElement('treeitem');
				var treerow = document.createElement('treerow');
				treeitem.appendChild(treerow);
				treechildrenWCAG1.appendChild(treeitem);
				var treecontrast = document.createElement('treecell');
				var treedifbrillo = document.createElement('treecell');
				var treedifcolor = document.createElement('treecell');
				var treeElement = document.createElement('treecell');
				treerow.appendChild(treecontrast);
				treerow.appendChild(treedifbrillo);
				treerow.appendChild(treedifcolor);
				treerow.appendChild(treeElement);
				var l = newOrder[i].split('-')[0];
						
				if(difBrillo[newOrderWcag1[i]] < 125){
					treedifbrillo.setAttribute('class', 'dudadifBrillo');
					treedifbrillo.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
				}else{
					treedifbrillo.setAttribute('src', 'chrome://colorchecker/content/img/ok.png');
				}
				treedifbrillo.setAttribute('label',difBrillo[newOrderWcag1[i]]);
				if(difColor[newOrderWcag1[i]] < 500){
					treedifcolor.setAttribute('class', 'dudadifColor');
					treedifcolor.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
				}else{
					treedifcolor.setAttribute('src', 'chrome://colorchecker/content/img/ok.png');
				}
				treecontrast.setAttribute('label',newOrder[i].split('-')[0]);
				treedifcolor.setAttribute('label',difColor[newOrderWcag1[i]]);
				subtreechildren = document.createElement('treechildren');
				treeitem.appendChild(subtreechildren);
				var cad = '';
				var contador = 0;
				var subcontador = 0;
				for (key in bio_niqueladas_colorCheck.luminosidades[newOrderWcag1[i]]){
					var subtreeitem = document.createElement('treeitem');
					var subtreerow = document.createElement('treerow');
					subtreeitem.appendChild(subtreerow);
					if(errorContrast)
						subtreerow.setAttribute('properties', 'sub_error');
					else
						subtreerow.setAttribute('properties', 'sub_ok');
					if(errorSubDuda)
						subtreerow.setAttribute('class', 'duda');
					subtreechildren.appendChild(subtreeitem);
					var subtreeElement = document.createElement('treecell');
					var treecontrast = document.createElement('treecell');
					var treedifbrillo = document.createElement('treecell');
					var treedifcolor = document.createElement('treecell');
					subtreerow.appendChild(treecontrast);
					subtreerow.appendChild(treedifbrillo);
					subtreerow.appendChild(treedifcolor);
					subtreerow.appendChild(subtreeElement);
					treecontrast.setAttribute('label','');
					var totalizador = bio_niqueladas_colorCheck.luminosidades[newOrderWcag1[i]][key];
					var totalizadorCad = totalizador.length;

					if(totalizador.length < 10)
						totalizadorCad = '    ' + totalizadorCad + ': ';
					else
						if(totalizador.length < 100)
							totalizadorCad = '  ' + totalizadorCad + ': ';
						else
							if(totalizador.length < 1000)
								totalizadorCad = totalizadorCad + ': ';
						
				
					subtreeElement.setAttribute('label',totalizadorCad + key);
					cad += ',' + key;
					contador += bio_niqueladas_colorCheck.luminosidades[newOrderWcag1[i]][key].length;
					subcontador++;
				}
				totalizadorCad = contador;
				if(contador < 10)
					totalizadorCad = '    ' + totalizadorCad + ': ';
				else
					if(contador < 100)
						totalizadorCad = '  ' + totalizadorCad + ': ';
					else
						if(contador < 1000)
							totalizadorCad = totalizadorCad + ': ';
				if(subcontador > 1){
					treeitem.setAttribute('container',true);
					treeElement.setAttribute('label',totalizadorCad + '[' + cad.replace(',','') + ']');
				}else{
					treeElement.setAttribute('label',totalizadorCad + cad.replace(',',''));
				}
			}

			for (var i = 0; i < newOrder.length; i++){
				var treeitem = document.createElement('treeitem');
				var treerow = document.createElement('treerow');
				treeitem.appendChild(treerow);
				treechildren.appendChild(treeitem);
				var treecontrast = document.createElement('treecell');
				var treeElement = document.createElement('treecell');
				treerow.appendChild(treecontrast);
				treerow.appendChild(treeElement);
				var l = newOrder[i].split('-')[0];
				var siz = '';
				siz = newOrder[i].split('-')[1];
				treerow.setAttribute('properties', 'ok');
				var errorContrast = 0;
				treecontrast.setAttribute('src', 'chrome://colorchecker/content/img/ok.png');
				if (l < inf) {
					treerow.setAttribute('properties', 'error');
					treecontrast.setAttribute('src', 'chrome://colorchecker/content/img/error.png');

					errorContrast = 1;
				}else{
					if (l < sup && siz == 'small') {
						treerow.setAttribute('properties', 'error');
						treecontrast.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
						errorContrast = 1;
					}
				}
				var errorSubDuda = 0;
				if (3 <= l && l < 7) {
					if (l < 4.5){
						if(siz == 'large'){
							treerow.setAttribute('class', 'duda');
							errorSubDuda = 1;
						}
					}else{
						if (siz == 'small'){
							treerow.setAttribute('class', 'duda');
							errorSubDuda = 1;
						}
					}
				}
						
				treecontrast.setAttribute('label',newOrder[i].split('-')[0]);
				subtreechildren = document.createElement('treechildren');
				treeitem.appendChild(subtreechildren);
				var cad = '';
				var contador = 0;
				var subcontador = 0;
				var sep = '-';
				for (key in bio_niqueladas_colorCheck.luminosidades[newOrder[i]]){
					var subtreeitem = document.createElement('treeitem');
					var subtreerow = document.createElement('treerow');
					subtreeitem.appendChild(subtreerow);
					if(errorContrast)
						subtreerow.setAttribute('properties', 'sub_error');
					else
						subtreerow.setAttribute('properties', 'sub_ok');
					if(errorSubDuda)
						subtreerow.setAttribute('class', 'duda');
					subtreechildren.appendChild(subtreeitem);
					var subtreeElement = document.createElement('treecell');
					var treecontrast = document.createElement('treecell');
					subtreerow.appendChild(treecontrast);
					subtreerow.appendChild(subtreeElement);
					treecontrast.setAttribute('label','');
					var totalizador = bio_niqueladas_colorCheck.luminosidades[newOrder[i]][key];
					var totalizadorCad = totalizador.length;

					if(totalizador.length < 10)
						totalizadorCad = '    ' + totalizadorCad + sep + siz + ': ';
					else
						if(totalizador.length < 100)
							totalizadorCad = '  ' + totalizadorCad + sep + siz + ': ';
						else
							if(totalizador.length < 1000)
								totalizadorCad = totalizadorCad + sep + siz + ': ';
						
				
					subtreeElement.setAttribute('label',totalizadorCad + key);
					cad += ',' + key;
					contador += bio_niqueladas_colorCheck.luminosidades[newOrder[i]][key].length;
					subcontador++;
				}
				totalizadorCad = contador;
				if(contador < 10)
					totalizadorCad = '    ' + totalizadorCad + sep + siz + ': ';
				else
					if(contador < 100)
						totalizadorCad = '  ' + totalizadorCad + sep + siz + ': ';
					else
						if(contador < 1000)
							totalizadorCad = totalizadorCad + sep + siz + ': ';
				if(subcontador > 1){
					treeitem.setAttribute('container',true);
					treeElement.setAttribute('label',totalizadorCad + '[' + cad.replace(',','') + ']');
				}else{
					treeElement.setAttribute('label',totalizadorCad + cad.replace(',',''));
				}
			}

			document.getElementById('cargador').style.background = '';
			document.getElementById('cargadorWCAG1').style.background = '';

			document.getElementById('rgb_c_texto').value = 'rgb(0,0,0)';
			document.getElementById('rgb_c_fondo').value = 'rgb(255,255,255)';
			bio_niq_color_colorCheck.RGBhex('rgb_c_texto','c_texto');
			bio_niq_color_colorCheck.alteraciones('c_texto');
			bio_niq_color_colorCheck.RGBhex('rgb_c_fondo','c_fondo');
			bio_niq_color_colorCheck.alteraciones('c_fondo');
			
			bio_niq_color_colorCheck.aplicaColor();
		} catch (e) {
		}		

	},
	ajusta_selectTipo:function(el){
		var id = el.getAttribute('id');
		if(id == 'vision_tipo'){
			document.getElementById('vision_tipo_II').value = el.value;
			document.getElementById('vision_tipo_III').value = el.value;
		}else if(id == 'vision_tipo_II'){
			document.getElementById('vision_tipo').value = el.value;
			document.getElementById('vision_tipo_III').value = el.value;
		}else if(id == 'vision_tipo_III'){
			document.getElementById('vision_tipo').value = el.value;
			document.getElementById('vision_tipo_II').value = el.value;
		}
		bio_niqueladas_colorCheck.reiniciaSamples();
	},
	rejarl:function(nivel){
		var treecolors = document.getElementById('colores');
		if(treecolors.getElementsByTagName('treechildren').length){
			var treerow = bio_general_colorCheck.getElementsByClassName(document, 'treerow', 'duda');
			for(var i = 0; i < treerow.length; i++){
				if(nivel == 'AA'){
					treerow[i].getElementsByTagName('treecell')[0].setAttribute('src', 'chrome://colorchecker/content/img/ok.png');
				}else{
					treerow[i].getElementsByTagName('treecell')[0].setAttribute('src', 'chrome://colorchecker/content/img/error.png');
				}
			}
		}
		bio_niq_color_colorCheck.getColorFromPickerStop()
	},
	treeClick: function(e,ind,n){
		bio_niqueladas_colorCheck.treecur = n;
		if(e.button == 2){
			bio_niqueladas_colorCheck.activar = false;
		}else{
			bio_niqueladas_colorCheck.activar = true;
			bio_niqueladas_colorCheck.selectElem(ind);
			bio_niq_color_colorCheck.aplicaColor();
		}
		bio_niq_color_colorCheck.getColorFromPickerStop()
	},
	keyClick: function(e,ind){
		if(e.keyCode == 38 || e.keyCode == 40){
			bio_niqueladas_colorCheck.activar = true;
			bio_niqueladas_colorCheck.selectElem(ind);
			bio_niq_color_colorCheck.aplicaColor();
		}else{
			bio_niqueladas_colorCheck.activar = false;
		}
	},
	especial: function(){
		var tree = document.getElementById('colores');
		for(var i = 0; i < 10; i++){
			alert(tree.view.getCellText(i,tree.columns.getNamedColumn('luminosidad')))
		}
	},
	selectElem: function(ind){

		var vision_tipo = document.getElementById('vision_tipo').selectedIndex;

		bio_niqueladas_colorCheck.eliminaSeleccion();
		var tree = document.getElementById('colores' + bio_niqueladas_colorCheck.treecur);
		if(tree.view.getCellText(tree.currentIndex,tree.columns.getNamedColumn('luminosidad' + bio_niqueladas_colorCheck.treecur))){
			var luminosidad = tree.view.getCellText(tree.currentIndex,tree.columns.getNamedColumn('luminosidad' + bio_niqueladas_colorCheck.treecur))
		}
		var elemento =  tree.view.getCellText(tree.currentIndex,tree.columns.getNamedColumn('elemento' + bio_niqueladas_colorCheck.treecur));
		var size = elemento;
		elemento = elemento.substring(elemento.lastIndexOf(' ')+1,elemento.length);
		if(!luminosidad){
			var i = 0;
			while(!tree.view.getCellText(tree.currentIndex-i,tree.columns.getNamedColumn('luminosidad' + bio_niqueladas_colorCheck.treecur)))
				i++;
			luminosidad = tree.view.getCellText(tree.currentIndex-i,tree.columns.getNamedColumn('luminosidad' + bio_niqueladas_colorCheck.treecur));
		}
		if(size.indexOf('-') > 0)
			size = size.substring(size.indexOf('-')+1,size.lastIndexOf(': '));
		else
			size = '';
		luminosidad += '-' + size;
		var elementos = elemento.split(',');
		elementos[0].replace('[','');
		elementos[elementos.length-1].replace(']','');
		document.getElementById('rgb_c_texto').value = 'rgb(' + bio_niqueladas_colorCheck.combinacionColores[luminosidad][0].replace(' ','').replace(' ','') + ')';
		document.getElementById('rgb_c_fondo').value = 'rgb(' + bio_niqueladas_colorCheck.combinacionColores[luminosidad][1].replace(' ','').replace(' ','') + ')';
		bio_niq_color_colorCheck.RGBhex('rgb_c_texto','c_texto');
		bio_niq_color_colorCheck.RGBhex('rgb_c_fondo','c_fondo');
		var labels = bio_general_colorCheck.getElementsByAttribute(document, 'label','class','current');
			for(var i = 0; i < labels.length; i++){
				labels[i].removeAttribute('class');
			}
		for(var a = 0; a < elementos.length; a++){
			elementos[a] = elementos[a].replace('[','').replace(']','');
			for(var i = 0; i < bio_niqueladas_colorCheck.luminosidades[luminosidad][elementos[a]].length; i++){
				var el = bio_niqueladas_colorCheck.luminosidades[luminosidad][elementos[a]][i];
				if(el.getAttribute('class'))
					el.setAttribute('class',el.getAttribute('class') + ' bioContrast');
				else
					el.setAttribute('class','bioContrast');
				bio_niqueladas_colorCheck.luminosidades[luminosidad][elementos[a]][i].style.border = '2px dotted red';
				if(vision_tipo > 0 && i == 0){
					var ct = bio_niqueladas_colorCheck.colorElement(bio_niqueladas_colorCheck.luminosidades[luminosidad][elementos[a]][i],document.getElementById('vision_tipo').selectedIndex,true);
					document.getElementById('texto_ejemplo').style.color = 'rgb(' + ct[0] + ')';
					document.getElementById('texto_ejemplo').style.backgroundColor = 'rgb(' + ct[1] + ')';
				}

			}
		}
		var documentos = bio_documents_colorCheck.documents();
		for (var doc_number = 0; doc_number < documentos.length; doc_number++) {
			documentos[doc_number].addEventListener("click", bio_niqueladas_colorCheck.eliminaSeleccion, document.getElementById('vision_tipo').selectedIndex);
		}
	},
	eliminaSeleccion: function(){
		var documentos = bio_documents_colorCheck.documents();
		for (var doc_number = 0; doc_number < documentos.length; doc_number++) {
			var olds = bio_general_colorCheck.getElementsByClassName(documentos[doc_number], '*', 'bioContrast');
			for(var i = 0; i < olds.length; i++){
				var el = olds[i];
				el.style.border = '';
				if (el.getAttribute('class'))
					el.setAttribute('class',el.getAttribute('class').replace(' bioContrast','').replace('bioContrast',''));
				if (el.getAttribute('class') != null && !el.getAttribute('class'))
					el.removeAttribute('class');
				if (el.getAttribute('style') != null && !el.getAttribute('style'))
					el.removeAttribute('style');
			}
		}
	},
	ordena: function(arr){
		for(var i = 0; i < arr.length; i++) {
			for(var j = i+1; j < arr.length; j++) {
				if(Number(arr[i]) > Number(arr[j])){
					tempValue = arr[j];
					arr[j] = arr[i];
					arr[i] = tempValue;
				}
			}
		}
		return arr;
	},
	changePanel: function(ind){
		document.getElementById('version_wcag').selectedIndex = ind;
	},
	destColorWheel: function(ind){
		if(ind == 0)
			bio_niq_color_colorCheck.colorWheelDest = 'c_texto';
		else
			bio_niq_color_colorCheck.colorWheelDest = 'c_fondo';
		bio_niq_color_colorCheck.getColorFromPickerStop()
	},
	reiniciaSamples:function(){
		document.getElementById('texto_ejemplo').style.color = 'rgb(0,0,0)';
		document.getElementById('texto_ejemplo').style.backgroundColor = 'rgb(255,255,255)';
		document.getElementById('texto_ejemplo_disc').style.color = 'rgb(0,0,0)';
		document.getElementById('texto_ejemplo_disc').style.backgroundColor = 'rgb(255,255,255)';
	}
}
