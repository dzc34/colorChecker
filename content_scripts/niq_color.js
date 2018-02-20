var bio_niq_color_colorCheck = {
	colorpickerDest : 'c_texto',
	colorWheelDest : 'c_texto',
	whe : 'left',
	bio_imagenes_f: new Array(),
	bio_imagenes_b: new Array(),
	bio_canvas: new Array(),
	bio_object: new Array(),
	bio_imagenes_disc: new Array(),
	bio_capturas: new Array(),
	sendColor: function(colorRGB,elemento){
		colorRGB = colorRGB.replace(/ /g,'');
		if (colorRGB) {
			document.getElementById(elemento).value = bio_niq_color_colorCheck.RGBhexColor(colorRGB);
			document.getElementById('rgb_' + elemento).value = colorRGB;
			//bio_niq_color_colorCheck.alteraciones(elemento);
			bio_niq_color_colorCheck.aplicaColor();
		}
	},
	alteraciones:function(elemento){
		//bio_niq_color_colorCheck.calDef('rgb_c_texto','rgb_c_texto_deute','rgb_c_texto_prota','rgb_c_texto_trita');
		//bio_niq_color_colorCheck.calDef('rgb_c_fondo','rgb_c_fondo_deute','rgb_c_fondo_prota','rgb_c_fondo_trita');		
	},
	aplicaColor:function(m){
		var vision_tipo = document.getElementById('vision_tipo').selectedItem.getAttribute('label').split('/')[0];
		
		var t = document.getElementById('rgb_c_texto').value.replace('rgb(','').replace(')','');
		var f = document.getElementById('rgb_c_fondo').value.replace('rgb(','').replace(')','');

 		if(document.getElementById('vision_tipo').selectedIndex > 0 && document.getElementById('version_wcag').selectedIndex < 2){
			var dtd = bio_niq_color_colorCheck.calDefRev(t,document.getElementById('vision_tipo').value);
			var dfd = bio_niq_color_colorCheck.calDefRev(f,document.getElementById('vision_tipo').value);
			
			document.getElementById('texto_ejemplo_disc').setAttribute('value',vision_tipo);
			document.getElementById('texto_ejemplo_disc').setAttribute('style','display: inline');
			document.getElementById('texto_ejemplo_disc').style.color = 'rgb(' + dtd + ')';
			document.getElementById('texto_ejemplo_disc').style.backgroundColor = 'rgb(' + dfd  + ')';
		}else{
			document.getElementById('texto_ejemplo').style.color = 'rgb(' + t + ')';
			document.getElementById('texto_ejemplo').style.backgroundColor = 'rgb(' + f + ')';
			document.getElementById('texto_ejemplo_disc').setAttribute('style','display: none');
		}
		document.getElementById('sample_color_fore').color = document.getElementById('c_texto').value;
		document.getElementById('sample_color_back').color = document.getElementById('c_fondo').value;
		if(!m){
			bio_niq_color_colorCheck.contrastes('rgb_c_texto','rgb_c_fondo','contr_bri','contr_col', 'contr_AAg', 'contr_AAp', 'contr_AAAg', 'contr_AAAp');
		}
	},
	hexRGBColor:function(color) {
		if(color.indexOf('#') > -1)
			color = color.replace('#','');
		if (!(color.length == 3) && !(color.length == 6)) {
			color = '-,-,-';
		}else {
			if (color.length == 3) {
				var r = color.substring(0, 1);
				var g = color.substring(1, 2);
				var b = color.substring(2, 3);
				color = r + r + g + g + b + b;
			}
			var rojo = bio_niq_color_colorCheck.hexR(color);
			var verde = bio_niq_color_colorCheck.hexG(color);
			var azul = bio_niq_color_colorCheck.hexB(color);
			color = rojo + ',' + verde + ',' + azul;
		}
		return color;
	},
	hexRGB:function(id,destino) {
		var color = document.getElementById(id).value;
		document.getElementById(destino).value = bio_niq_color_colorCheck.hexRGBColor(color);
	},
	hexR:function(color) {
		return parseInt(color.substring(0,2), 16);
	},
	hexG: function(color) {
		return parseInt(color.substring(2,4), 16);
	},
	hexB:function(color) {
		return parseInt(color.substring(4,6), 16);
	},
	limpiaRGB:function(color,cadena) {
		var valores = new Array();
		if(color.indexOf('rgb') > -1) color = color.replace('rgb','');
		if(color.indexOf('(') > -1) color = color.replace('(','');
		if(color.indexOf(')') > -1) color = color.replace(')','');
		color = color.replace(/ /g,'');
		if(color.indexOf(':') > -1)
			valores = color.split(':');
		else if(color.indexOf(',') > -1)
			valores = color.split(',');
		else if(color.indexOf('/') > -1)
			valores = color.split('/');
		else if(color.indexOf('.') > -1)
			valores = color.split('.');
		return valores;
	},
	RGBhexColor:function(color) {
		var valores = new Array();
		valores = bio_niq_color_colorCheck.limpiaRGB(color);
		color = '#' + bio_niq_color_colorCheck.dechex(valores[0]) + bio_niq_color_colorCheck.dechex(valores[1]) + bio_niq_color_colorCheck.dechex(valores[2]);
		return color;
	},
	RGBhex:function(id,destino) {
		var valores;
		var dest = document.getElementById(id).value;
		valores = bio_niq_color_colorCheck.limpiaRGB(dest);
		document.getElementById(destino).value = '#' + bio_niq_color_colorCheck.dechex(valores[0]) + bio_niq_color_colorCheck.dechex(valores[1]) + bio_niq_color_colorCheck.dechex(valores[2]);
	},
	dechex:function(numero) {
		if (numero == null)
			return '00';
		numero = parseInt(numero);
		if (isNaN(numero))
			return '00';
		else if (numero <= 0 )
			return '00';
		else if (numero > 255)
			return 'FF';
		numero = Math.round(numero);
		return "0123456789ABCDEF".charAt((numero - numero % 16)/16) + "0123456789ABCDEF".charAt(numero % 16);
	},
	contrastes:function(ortexto,orfondo,destbri,destcol, destAAg){
		var texto = {};
		var valores;
		var valoresfondo;
		var p = document.getElementById(ortexto).value;
		var b = document.getElementById(orfondo).value;

		if(p.indexOf('rgb') > -1) p = p.replace('rgb','');
		if(p.indexOf('(') > -1)	p = p.replace('(','');
		if(p.indexOf(')') > -1)	p = p.replace(')','');
		if(b.indexOf('rgb') > -1) b = b.replace('rgb','');
		if(b.indexOf('(') > -1)	b = b.replace('(','');
		if(b.indexOf(')') > -1)	b = b.replace(')','');
		if(p.indexOf(':') > -1)
			valores = p.split(':');
		else if(p.indexOf(',') > -1)
			valores = p.split(',');
		else if(p.indexOf('/') > -1)
			valores = p.split('/');
		else if(p.indexOf('.') > -1)
			valores = p.split('.');
			texto.red = valores[0];
			texto.green = valores[1];
			texto.blue = valores[2];
		var fondo = {};
		if(b.indexOf(':') > -1)
			valoresfondo = b.split(':');
		else if(b.indexOf(',') > -1)
			valoresfondo = b.split(',');
		else if(b.indexOf('/') > -1)
			valoresfondo = b.split('/');
		else if(b.indexOf('.') > -1)
			valoresfondo = b.split(':');
			fondo.red = valoresfondo[0];
			fondo.green = valoresfondo[1];
			fondo.blue = valoresfondo[2];
		bio_niq_color_colorCheck.luminosidad(texto, fondo, destAAg);
		bio_niq_color_colorCheck.brilloDif(destbri, texto, fondo);
		bio_niq_color_colorCheck.colorDif(destcol, texto, fondo);
	},
	obtenBrillo:function(colores){
		var brillo = ((colores.red * 299) + (colores.green * 587) + (colores.blue * 114)) / 1000;
		return brillo;
	},
	brilloDif:function(dest, primerPlano, segundoPlano){
		var brilloPrimerPlano = bio_niq_color_colorCheck.obtenBrillo(primerPlano);
		var brilloSegundoPlano = bio_niq_color_colorCheck.obtenBrillo(segundoPlano);
		var diferenciaBrillo = parseInt(Math.abs(brilloSegundoPlano-brilloPrimerPlano), 10);
		var contr_bri = document.getElementById(dest);
		if(contr_bri){
			var contr_bri_dif = 1;
			var porcentaje = '%';
			if (diferenciaBrillo >= (125 * contr_bri_dif)) {
	//			contr_bri.className = 'ok';
	//			contr_bri.setAttribute('src', 'chrome://colorchecker/content/img/ok.png');
				contr_bri.setAttribute('label',diferenciaBrillo)
				contr_bri.setAttribute('value',diferenciaBrillo)
			}else if (diferenciaBrillo < (125 * contr_bri_dif)){
	//			contr_bri.className = 'error';
	//			contr_bri.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
				contr_bri.setAttribute('label',diferenciaBrillo)
				contr_bri.setAttribute('value',diferenciaBrillo)
			}else {
	//			contr_bri.className = '';
				contr_bri.setAttribute('label','-');
				contr_bri.setAttribute('value','-')
	//			contr_bri.removeAttribute('src');
			}
		}
		return 0;
	},
	colorDif:function(dest, primerPlano, segundoPlano){
		var diferenciaColor = Math.abs(segundoPlano.red - primerPlano.red) + Math.abs(segundoPlano.green - primerPlano.green) + Math.abs(segundoPlano.blue - primerPlano.blue);
		var contr_col = document.getElementById(dest);
		if(contr_col){
			var contr_col_dif = 1;
			var porcentaje = '%';
			if(diferenciaColor >= (500*contr_col_dif)){
	//			contr_col.className = 'ok';
	//			contr_col.setAttribute('src', 'chrome://colorchecker/content/img/ok.png');
				contr_col.setAttribute('label',diferenciaColor)
				contr_col.setAttribute('value',diferenciaColor)
			}else if(diferenciaColor < (500*contr_col_dif)){
	//			contr_col.className = 'error';
	//			contr_col.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
				contr_col.setAttribute('label',diferenciaColor)
				contr_col.setAttribute('value',diferenciaColor)
			}else {
	//			contr_col.className = '';
				contr_col.setAttribute('label','-');
				contr_col.setAttribute('value','-')
	//			contr_col.removeAttribute('src');
			}
		}
		return 0;
	},
	obtenluminosidad:function(fRed, fGreen, fBlue, fFullScale){
		var fRedRGB = fRed / fFullScale;
		var fGreenRGB = fGreen / fFullScale;
		var fBlueRGB = fBlue / fFullScale;
		var fLinearisedRed, fLinearisedGreen, fLinearisedBlue;
		if (fRedRGB <= 0.03928){
			fLinearisedRed = fRedRGB / 12.92;
		}else{
			fLinearisedRed = Math.pow(((fRedRGB + 0.055)/1.055), 2.4);
		}
		if (fGreenRGB <= 0.03928){
			fLinearisedGreen = fGreenRGB / 12.92;
		}else{
			fLinearisedGreen = Math.pow(((fGreenRGB + 0.055)/1.055), 2.4);
		}
		if (fBlueRGB <= 0.03928){
			fLinearisedBlue = fBlueRGB / 12.92;
		}else{
			fLinearisedBlue = Math.pow(((fBlueRGB + 0.055)/1.055), 2.4);
		}
		return (0.2126 * fLinearisedRed + 0.7152 * fLinearisedGreen + 0.0722 * fLinearisedBlue);
	},
	resultadosColor:function(valor, destAAg, AAg){
		var contr_AAg = document.getElementById(destAAg);
		if(contr_AAg.childNodes[0])
			contr_AAg.removeChild(contr_AAg.childNodes[0]);
		contr_AAg.setAttribute('label', valor);
		contr_AAg.setAttribute('value', valor);
		var contr_AAg_small_II = document.getElementById('contr_AAg_small_II');
		var contr_AAg_large_II = document.getElementById('contr_AAg_large_II');
		var contr_AAAg_small_II = document.getElementById('contr_AAAg_small_II');
		var contr_AAAg_large_II = document.getElementById('contr_AAAg_large_II');
		contr_AAg_small_II.setAttribute('src', 'chrome://colorchecker/content/img/ok.png');
		contr_AAg_large_II.setAttribute('src', 'chrome://colorchecker/content/img/ok.png');
		contr_AAAg_small_II.setAttribute('src', 'chrome://colorchecker/content/img/ok.png');
		contr_AAAg_large_II.setAttribute('src', 'chrome://colorchecker/content/img/ok.png');
		if(valor < 3){
			contr_AAg_small_II.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
			contr_AAg_large_II.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
			contr_AAAg_small_II.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
			contr_AAAg_large_II.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
		}else{
			if(valor < 4.5){
				contr_AAg_small_II.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
				contr_AAAg_small_II.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
				contr_AAAg_large_II.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
			}else{
				if(valor < 7){
					contr_AAAg_small_II.setAttribute('src', 'chrome://colorchecker/content/img/error.png');
				}
			}
		}
		contr_AAg.parentNode.setAttribute('properties',AAg)
//		contr_AAg.className = AAg;
		
		var contr_AAg_II = document.getElementById(destAAg + '_II');
		if(contr_AAg_II){
			if(contr_AAg_II.childNodes[0])
				contr_AAg_II.removeChild(contr_AAg_II.childNodes[0]);
			contr_AAg_II.setAttribute('label', valor);
			contr_AAg_II.setAttribute('value', valor);
			contr_AAg_II.parentNode.setAttribute('properties',AAg)
		}
		
		
	},
	luminosidad:function(primerPlano, segundoPlano, destAAg){
		var lum_primerPlano, lum_Fondo, mayor, menor, difluminosidad;
		lum_primerPlano = bio_niq_color_colorCheck.obtenluminosidad(primerPlano.red, primerPlano.green, primerPlano.blue, 255);
		lum_Fondo = bio_niq_color_colorCheck.obtenluminosidad(segundoPlano.red, segundoPlano.green, segundoPlano.blue, 255);
		if (lum_primerPlano > lum_Fondo){
			mayor = lum_primerPlano;
			menor = lum_Fondo;
		}else{
			mayor = lum_Fondo;
			menor = lum_primerPlano;
		}
		difluminosidad = (mayor + 0.05) / (menor + 0.05);
		difluminosidad = Math.round(difluminosidad * 100) / 100; // redondeo a dos decimales
		if (difluminosidad) {
			if (difluminosidad < 3) {
				bio_niq_color_colorCheck.resultadosColor(difluminosidad, destAAg, 'error');
				return 0;
			}
			else 
				if (difluminosidad < 4.5) {
					bio_niq_color_colorCheck.resultadosColor(difluminosidad, destAAg, 'ok');
					return 1;
				}
				else 
					if (difluminosidad < 7) {
						bio_niq_color_colorCheck.resultadosColor(difluminosidad, destAAg, 'ok');
						return 1;
					}
					else 
						if (difluminosidad >= 7) {
							bio_niq_color_colorCheck.resultadosColor(difluminosidad, destAAg, 'ok');
							return 1;
						}
		}else {
			bio_niq_color_colorCheck.resultadosColor('-', destAAg, '');
		}
		return 1;
	},
	luminosidadElements:function(primerPlano, segundoPlano){
		var lum_primerPlano, lum_Fondo, mayor, menor, difluminosidad;
		lum_primerPlano = bio_niq_color_colorCheck.obtenluminosidad(primerPlano.split(',')[0], primerPlano.split(',')[1], primerPlano.split(',')[2], 255);
		lum_Fondo = bio_niq_color_colorCheck.obtenluminosidad(segundoPlano.split(',')[0], segundoPlano.split(',')[1], segundoPlano.split(',')[2], 255);

		if (lum_primerPlano > lum_Fondo){
			mayor = lum_primerPlano;
			menor = lum_Fondo;
		}else{
			mayor = lum_Fondo;
			menor = lum_primerPlano;
		}
		difluminosidad = (mayor + 0.05) / (menor + 0.05);
		difluminosidad = Math.round(difluminosidad * 100) / 100; // redondeo a dos decimales
		return difluminosidad;
	},
	ConfusionLines : {
		"Protanope": {
			x: 0.7465,
			y: 0.2535,
			m: 1.273463,
			yint: -0.073894
		},
		"Deuteranope": {
			x: 1.4,
			y: -0.4,
			m: 0.968437,
			yint: 0.003331
		},
		"Tritanope": {
			x: 0.1748,
			y: 0.0,
			m: 0.062921,
			yint: 0.292119
		}
	},
	/* 
		Color.Vision.Simulate : v0.1
		-----------------------------
		Freely available for non-commercial use by Matthew Wickline and the
		Human-Computer Interaction Resource Network ( http://hcirn.com/ ).
		
		"Color-Defective Vision and Computer Graphics Displays" by Gary W. Meyer and Donald P. Greenberg
		http://ieeexplore.ieee.org/iel1/38/408/00007759.pdf?arnumber=7759
		
		"Spectral sensitivity of the foveal cone photopigments between 400 and 500 nm" by V.C. Smith, J. Pokorny
		http://www.opticsinfobase.org/abstract.cfm?URI=josaa-22-10-2060
		
		"RGB Working Space Information" by Bruce Lindbloom
		http://www.brucelindbloom.com/WorkingSpaceInfo.html
		
	*/
	calDefRev:function(colorRGB,type) {
		// Apply simulation
		var valores = colorRGB.split(',');
		var amount = 1;
		switch(type) {
			case "Normal":
				return colorRGB;
			case "Achromatope":
				if(valores[0].trim() == valores[1].trim() && valores[0].trim() == valores[2].trim()){
					var dev = valores[0].trim() + ',' + valores[0].trim() + ',' + valores[0].trim();
					return dev;
				}
				var sr = parseInt(valores[0]), // source-pixel
					sg = parseInt(valores[1]),
					sb = parseInt(valores[2]),
					// convert to Monochrome using sRGB WhitePoint	
					dr = (sr * 0.212656 + sg * 0.715158 + sb * 0.072186), // destination-pixel
					dg = dr,
					db = dr;
				// Anomylize colors
				dr = sr * (1.0 - amount) + dr * amount; 
				dg = sg * (1.0 - amount) + dg * amount;
				db = sb * (1.0 - amount) + db * amount;
				// Record values
				var a = dr >> 0;
				var b = dg >> 0
				var c = db >> 0;
				var dev = a + ',' + b + ',' + c;
				return dev;
			default:
				var line = bio_niq_color_colorCheck.ConfusionLines[type],
					confuse_x = line.x,
					confuse_y = line.y, 
					confuse_m = line.m,
					confuse_yint = line.yint;
				break;
		}
		// Simulate: Protanope, Deuteranope, or Tritanope
		var sr = valores[0], // source-pixel
			sg = valores[1],
			sb = valores[2],
			dr = sr, // destination-pixel
			dg = sg,
			db = sb;
		// Convert source color into XYZ color space
		var pow_r = Math.pow(sr, 2.2),
			pow_g = Math.pow(sg, 2.2),
			pow_b = Math.pow(sb, 2.2);
		var X = pow_r * 0.412424 + pow_g * 0.357579 + pow_b * 0.180464, // RGB->XYZ (sRGB:D65)
			Y = pow_r * 0.212656 + pow_g * 0.715158 + pow_b * 0.0721856,
			Z = pow_r * 0.0193324 + pow_g * 0.119193 + pow_b * 0.950444;
		// Convert XYZ into xyY Chromacity Coordinates (xy) and Luminance (Y)
		var chroma_x = X / (X + Y + Z);
		var chroma_y = Y / (X + Y + Z);
		// Generate the “Confusion Line" between the source color and the Confusion Point
		var m = (chroma_y - confuse_y) / (chroma_x - confuse_x); // slope of Confusion Line
		var yint = chroma_y - chroma_x * m; // y-intercept of confusion line (x-intercept = 0.0)
		// How far the xy coords deviate from the simulation
		var deviate_x = (confuse_yint - yint) / (m - confuse_m);
		var deviate_y = (m * deviate_x) + yint;
		// Compute the simulated color’s XYZ coords
		var X = deviate_x * Y / deviate_y;
		var Z = (1.0 - (deviate_x + deviate_y)) * Y / deviate_y;
		// Neutral grey calculated from luminance (in D65)
		var neutral_X = 0.312713 * Y / 0.329016; 
		var neutral_Z = 0.358271 * Y / 0.329016; 
		// Difference between simulated color and neutral grey
		var diff_X = neutral_X - X;
		var diff_Z = neutral_Z - Z;
		diff_r = diff_X * 3.24071 + diff_Z * -0.498571; // XYZ->RGB (sRGB:D65)
		diff_g = diff_X * -0.969258 + diff_Z * 0.0415557;
		diff_b = diff_X * 0.0556352 + diff_Z * 1.05707;
		// Convert to RGB color space
		dr = X * 3.24071 + Y * -1.53726 + Z * -0.498571; // XYZ->RGB (sRGB:D65)
		dg = X * -0.969258 + Y * 1.87599 + Z * 0.0415557;
		db = X * 0.0556352 + Y * -0.203996 + Z * 1.05707;
		// Compensate simulated color towards a neutral fit in RGB space
		var fit_r = ((dr < 0.0 ? 0.0 : 1.0) - dr) / diff_r;
		var fit_g = ((dg < 0.0 ? 0.0 : 1.0) - dg) / diff_g;
		var fit_b = ((db < 0.0 ? 0.0 : 1.0) - db) / diff_b;
		var adjust = Math.max( // highest value
			(fit_r > 1.0 || fit_r < 0.0) ? 0.0 : fit_r, 
			(fit_g > 1.0 || fit_g < 0.0) ? 0.0 : fit_g, 
			(fit_b > 1.0 || fit_b < 0.0) ? 0.0 : fit_b
		);
		// Shift proportional to the greatest shift
		dr = dr + (adjust * diff_r);
		dg = dg + (adjust * diff_g);
		db = db + (adjust * diff_b);
		// Apply gamma correction
		dr = Math.pow(dr, 1.0 / 2.2);
		dg = Math.pow(dg, 1.0 / 2.2);
		db = Math.pow(db, 1.0 / 2.2);
		// Anomylize colors
		dr = sr * (1.0 - amount) + dr * amount; 
		dg = sg * (1.0 - amount) + dg * amount;
		db = sb * (1.0 - amount) + db * amount;
		// Return values
		var a = dr >> 0;
		var b = dg >> 0
		var c = db >> 0;
		var dev = a + ',' + b + ',' + c;
		return dev;
	},
	calDef:function(id,destdetute,destprota,desttrita) {
		var valores = new Array();
		var val = document.getElementById(id).value;
		if(val.indexOf('rgb') > -1) val = val.replace('rgb','');
		if(val.indexOf('(') > -1) val = val.replace('(','');
		if(val.indexOf(')') > -1) val = val.replace(')','');
		if(val.indexOf(':') > -1)
			valores = val.split(':');
		else if(val.indexOf(',') > -1)
			valores = val.split(',');
		else if(val.indexOf('/') > -1)
			valores = val.split('/');
		else if(val.indexOf('.') > -1)
			valores = val.split('.');
		if(val == '-,-,-'){
			document.getElementById(destdetute).value = val;
			document.getElementById(destprota).value = val;
			document.getElementById(desttrita).value = val;
		}else{
			var deute = new bio_niq_color_colorCheck.alterac(bio_niq_color_colorCheck.deuteranopia)
			var prota = new bio_niq_color_colorCheck.alterac(bio_niq_color_colorCheck.protanopia)
			var trita = new bio_niq_color_colorCheck.alterac(bio_niq_color_colorCheck.tritanopia)
			redpre = deute.gammalut[valores[0]];
			greenpre = deute.gammalut[valores[1]];
			blue = deute.gammalut[valores[2]];
			red = redpre * bio_niq_color_colorCheck.rgb2lms[0] + greenpre * bio_niq_color_colorCheck.rgb2lms[1] + blue * bio_niq_color_colorCheck.rgb2lms[2];
			green = redpre * bio_niq_color_colorCheck.rgb2lms[3] + greenpre * bio_niq_color_colorCheck.rgb2lms[4] + blue * bio_niq_color_colorCheck.rgb2lms[5];
			blue = redpre * bio_niq_color_colorCheck.rgb2lms[6] + greenpre * bio_niq_color_colorCheck.rgb2lms[7] + blue * bio_niq_color_colorCheck.rgb2lms[8];
			document.getElementById(destdetute).value = deute.converti(red,green,blue);
			document.getElementById(destprota).value = prota.converti(red,green,blue);
			document.getElementById(desttrita).value = trita.converti(red,green,blue);
		}
	},
	deuteranopia: 0,
	protanopia: 1,
	tritanopia: 2,
	rgb2lms: new Array(0.05059983,0.08585369,0.00952420,0.01893033,0.08925308,0.01370054,0.00292202,0.00975732,0.07145979),
	gammaRGB: 2.1,

	alterac:function(blind) {
		this.gammalut = new Array(256);
		for (i=0 ; i < 256 ; i++) this.gammalut[i]=Math.pow(i,1.0/bio_niq_color_colorCheck.gammaRGB);
		this.blind = blind;
		this.rgb2lms = bio_niq_color_colorCheck.rgb2lms ;
		this.gammaRGB = bio_niq_color_colorCheck.gammaRGB ;

		anchor = new Array(12)
		anchor[0] = 0.08008;
		anchor[1] = 0.1579;
		anchor[2] = 0.5897;
		anchor[3] = 0.1284;
		anchor[4] = 0.2237;
		anchor[5] = 0.3636;
		anchor[6] = 0.9856;
		anchor[7] = 0.7325;
		anchor[8] = 0.001079;
		anchor[9] = 0.0914;
		anchor[10] = 0.007009;
		anchor[11] = 0.0;
		this.anchor = anchor;
		
		lms2rgb = new Array(9);
		lms2rgb[0] = 30.830854;
		lms2rgb[1] = -29.832659;
		lms2rgb[2] = 1.610474;
		lms2rgb[3] = -6.481468;
		lms2rgb[4] = 17.715578;
		lms2rgb[5] = -2.532642;
		lms2rgb[6] = -0.375690;
		lms2rgb[7] = -1.199062;
		lms2rgb[8] = 14.273846;
		this.lms2rgb = lms2rgb ;

		anchor_e = new Array(3);
		anchor_e[0]=bio_niq_color_colorCheck.rgb2lms[0] + bio_niq_color_colorCheck.rgb2lms[1] + bio_niq_color_colorCheck.rgb2lms[2];
		anchor_e[1] =bio_niq_color_colorCheck.rgb2lms[3] + bio_niq_color_colorCheck.rgb2lms[4] + bio_niq_color_colorCheck.rgb2lms[5];
		anchor_e[2] =bio_niq_color_colorCheck.rgb2lms[6] + bio_niq_color_colorCheck.rgb2lms[7] + bio_niq_color_colorCheck.rgb2lms[8];

		switch(blind) {
			case bio_niq_color_colorCheck.deuteranopia:
				this.a1 = anchor_e[1] * anchor[8] - anchor_e[2] * anchor[7];
				this.b1 = anchor_e[2] * anchor[6] - anchor_e[0] * anchor[8];
				this.c1 = anchor_e[0] * anchor[7] - anchor_e[1] * anchor[6];
				this.a2 = anchor_e[1] * anchor[2] - anchor_e[2] * anchor[1];
				this.b2 = anchor_e[2] * anchor[0] - anchor_e[0] * anchor[2];
				this.c2 = anchor_e[0] * anchor[1] - anchor_e[1] * anchor[0];
				this.inflection = (anchor_e[2] / anchor_e[0]);
				break ;
			case bio_niq_color_colorCheck.protanopia:
				this.a1 = anchor_e[1] * anchor[8] - anchor_e[2] * anchor[7];
				this.b1 = anchor_e[2] * anchor[6] - anchor_e[0] * anchor[8];
				this.c1 = anchor_e[0] * anchor[7] - anchor_e[1] * anchor[6];
				this.a2 = anchor_e[1] * anchor[2] - anchor_e[2] * anchor[1];
				this.b2 = anchor_e[2] * anchor[0] - anchor_e[0] * anchor[2];
				this.c2 = anchor_e[0] * anchor[1] - anchor_e[1] * anchor[0];
				this.inflection = (anchor_e[2] / anchor_e[1]);
				break ;
			case bio_niq_color_colorCheck.tritanopia:
				this.a1 = anchor_e[1] * anchor[11] - anchor_e[2] * anchor[10];
				this.b1 = anchor_e[2] * anchor[9]  - anchor_e[0] * anchor[11];
				this.c1 = anchor_e[0] * anchor[10] - anchor_e[1] * anchor[9];
				this.a2 = anchor_e[1] * anchor[5]  - anchor_e[2] * anchor[4];
				this.b2 = anchor_e[2] * anchor[3]  - anchor_e[0] * anchor[5];
				this.c2 = anchor_e[0] * anchor[4]  - anchor_e[1] * anchor[3];
				this.inflection = (anchor_e[1] / anchor_e[0]);
				break;
			default:
				break;
		}
		this.converti = bio_niq_color_colorCheck.convedalto ;
	},
	convedalto:function(red,green,blue) {
		switch(this.blind) {
			case bio_niq_color_colorCheck.deuteranopia:
				tmp = bio_niq_color_colorCheck.cocienteNulo(blue,red);
				if (tmp < this.inflection)
					green = -(this.a1 * red + this.c1 * blue) / this.b1;
				else
					green = -(this.a2 * red + this.c2 * blue) / this.b2;
				break;
			case bio_niq_color_colorCheck.protanopia:
				tmp = bio_niq_color_colorCheck.cocienteNulo(blue,green);
				if (tmp < this.inflection)
					red = -(this.b1 * green + this.c1 * blue) / this.a1;
				else
					red = -(this.b2 * green + this.c2 * blue) / this.a2;
				break;
			case bio_niq_color_colorCheck.tritanopia:
				tmp = bio_niq_color_colorCheck.cocienteNulo(green,red);
				if (tmp < this.inflection)
					blue = -(this.a1 * red + this.b1 * green) / this.c1;
				else
					blue = -(this.a2 * red + this.b2 * green) / this.c2;
				break;
		}
		redpre = red;
		greenpre = green;
		red = redpre * this.lms2rgb[0] + greenpre * this.lms2rgb[1] + blue * this.lms2rgb[2];	
		green = redpre * this.lms2rgb[3] + greenpre * this.lms2rgb[4] + blue * this.lms2rgb[5];
		blue = redpre * this.lms2rgb[6] + greenpre * this.lms2rgb[7] + blue * this.lms2rgb[8];
		red = bio_niq_color_colorCheck.lut_lookup(bio_niq_color_colorCheck.mayor(red,0),this.gammalut);
		green = bio_niq_color_colorCheck.lut_lookup(bio_niq_color_colorCheck.mayor(green,0), this.gammalut);
		blue = bio_niq_color_colorCheck.lut_lookup(bio_niq_color_colorCheck.mayor(blue,0), this.gammalut);
		
		return [red,green,blue];
	},
	lut_lookup:function(value,lut){
		offset = 127;
		step = 64;
		while (step)   {
			if (lut[offset] > value){
				offset -= step;
			}else{
				if (lut[offset + 1] > value)
					return offset;
				offset += step;
			}
			step /= 2;
		}
		if (offset == 254 && lut[255] < value)
			return 255;
		return offset;
	},
	mayor:function(a,b) {
		if (a < b)
			return b;
		else
			return a;
	},
	cocienteNulo:function(numerador,denominador) {
		if (numerador == 0)
		  return 0.0;
		else
		  return numerador/denominador + 0.0;
	},
	comparador:function(){
		var features = "chrome,titlebar,toolbar,centerscreen,resizable=yes,width= 450px,height=110px,scrollbars=no";
		window.openDialog("chrome://colorchecker/content/comparador.xul", "Comparador", features);
	},
	captura:function(){
		bio_niq_color_colorCheck.getColorFromPickerStop();
		var canvas = window.content.document.createElement("canvas");
		//window.content.document.getElementsByTagName('body')[0].appendChild(canvas);
		var remoteWindow = window.content;
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIWebNavigation)
					   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
					   .rootTreeItem
					   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIDOMWindow);					   
					   
		var selectedBrow = mainWindow.getBrowser().selectedBrowser;
		var docViewer = selectedBrow.markupDocumentViewer;
		var zoom = 1;
		
		var selectedBrowDoc = selectedBrow.contentWindow.document;
		var body = selectedBrowDoc.getElementsByTagName('body')[0];
		if(selectedBrow.contentWindow.innerWidth > body.scrollWidth)
			var Wwidth = selectedBrow.contentWindow.innerWidth;
		else
			var Wwidth = body.scrollWidth;
		var Wheight = body.scrollHeight;
		var escala = 1;
		canvas.style.width = Wwidth/escala+"px";
		canvas.style.height = Wheight/escala+"px";
		canvas.style.margin = '10px 10px 5px';
		canvas.style.border = '1px solid #666';
		canvas.width = Wwidth/escala;
		canvas.height = Wheight/escala;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0,Wwidth,Wheight);
		ctx.save();
		ctx.scale(1/escala,1/escala);
		ctx.drawWindow(remoteWindow,0, 0, Wwidth, Wheight,"rgb(0,0,0)");
		ctx.restore();
		var strDataURI = canvas.toDataURL("image/png","");
		var strDownloadMime = "image/octet-stream";
		document.location.href = strDataURI.replace("image/png", strDownloadMime);
	},
	colorpicker:function(dest){
		bio_niqueladas_colorCheck.eliminaSeleccion();
		var remoteWindow = window.content;
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIWebNavigation)
					   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
					   .rootTreeItem
					   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIDOMWindow);

		var docViewer = mainWindow.getBrowser().selectedBrowser.markupDocumentViewer;
		var zoom = 1;

		var canvas = mainWindow.getBrowser().selectedBrowser.contentWindow.document.getElementById('canvas_colorCheck');
		if(canvas)
			canvas.parentNode.removeChild(canvas);
		canvas = remoteWindow.document.createElement("canvas");
		bio_niq_color_colorCheck.colorpickerDest = dest;
		canvas.setAttribute('id','canvas_colorCheck');

		var sample = mainWindow.getBrowser().selectedBrowser.contentWindow.document.getElementById('sample_colorCheck');
		if(sample)
			sample.parentNode.removeChild(sample);
		sample = remoteWindow.document.createElement("div");
		sample.setAttribute('id','sample_colorCheck');

		var body = mainWindow.getBrowser().selectedBrowser.contentWindow.document.getElementsByTagName('body')[0];
		var Wwidth = body.scrollWidth;
		var Wheight = body.scrollHeight;
		canvas.width = Wwidth;
		canvas.height = Wheight;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0,Wwidth,Wheight);
		ctx.save();
		ctx.scale(1,1);
		ctx.drawWindow(remoteWindow,0, 0, Wwidth, Wheight,"rgb(0,0,0)");
		ctx.restore();
		var IMGcache = ctx.getImageData(20, 10, 1, 1);

		body.appendChild(canvas);
		bio_niq_color_colorCheck.whe = 'left';
		canvas.setAttribute('style','cursor:url(chrome://colorchecker/content/img/eyedropper_ico.png),pointer;position:absolute;top:0;left:0;z-index:10000;');
		canvas.addEventListener("mousemove", bio_niq_color_colorCheck.getColorFromPicker, false);
		canvas.addEventListener("mousedown", bio_niq_color_colorCheck.getColorFromPickerStop, false);
		body.appendChild(sample);
		sample.setAttribute('style','background-color: #222;border:1px solid #FFF;box-shadow: 0 0 20px;padding: 10px;position:fixed; ' + bio_niq_color_colorCheck.whe + ': 20px; top: 20px;border-radius: 10px; z-index: 10000;min-height:30px;shadow: 2px 2px 2px #333; float:left; min-width: 200px;color: #FFF;');
		var cubo = document.createElement('div');
		cubo.setAttribute('id','sampleCubeCH')
		cubo.setAttribute('style','border:1px solid #FFF;background-color:rgb('+IMGcache.data[0]+ ',' + IMGcache.data[1]+ ',' + IMGcache.data[2] +');width: 30px;height:30px;float:left;margin-right:10px');
		sample.appendChild(cubo)
		var texto = document.createElement('strong');
		texto.setAttribute('id','sampleTextCH');
		texto.setAttribute('style','font-weight:bold;font-family: sans-serif;font-size: 14px;line-height:30px;text-decoration:none;background-color:transparent;border:none;');
		var ct = document.createTextNode('#FFFFFF || R:255 G:255 B:255');
		texto.appendChild(ct)
		sample.appendChild(texto)
		sample.addEventListener("mouseover", bio_niq_color_colorCheck.changeSamplePos, false);
		cubo.addEventListener("mouseover", bio_niq_color_colorCheck.changeSamplePos, false);
		texto.addEventListener("mouseover", bio_niq_color_colorCheck.changeSamplePos, false);
		
	},
	changeSamplePos: function(){
		var remoteWindow = window.content;
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIWebNavigation)
					   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
					   .rootTreeItem
					   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIDOMWindow);
		
		
		var sample = mainWindow.getBrowser().selectedBrowser.contentWindow.document.getElementById('sample_colorCheck');
		
		if(bio_niq_color_colorCheck.whe == 'left'){
			sample.style.left = 'auto';
			sample.style.right = '20px';
			bio_niq_color_colorCheck.whe = 'right';
		}else{
			sample.style.left = '20px';
			sample.style.right = 'auto';
			bio_niq_color_colorCheck.whe = 'left';
		}
	
	},
	getColorFromPicker:function(e){
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIWebNavigation)
					   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
					   .rootTreeItem
					   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIDOMWindow);

		var selectedBrow = mainWindow.getBrowser().selectedBrowser;
		var docViewer = selectedBrow.markupDocumentViewer;
		var zoom = 1;
		
		var body = selectedBrow.contentWindow;
					   
		var posX = body.scrollX+e.clientX;
		var posY = body.scrollY+e.clientY;
		
		var selectedBrowDoc = selectedBrow.contentWindow.document;

		var canvas = selectedBrowDoc.getElementById('canvas_colorCheck');
		var ctx = canvas.getContext("2d");
		var IMGcache = ctx.getImageData(posX, posY, 1, 1);

		var sample = selectedBrowDoc.getElementById('sample_colorCheck');
		var cubo = selectedBrowDoc.getElementById('sampleCubeCH');
		var R = IMGcache.data[0];
		var G = IMGcache.data[1];
		var B = IMGcache.data[2];
		cubo.style.backgroundColor = 'rgb('+ R + ',' + G + ',' + B +')';
		var texto = selectedBrowDoc.getElementById('sampleTextCH');
		if(texto.childNodes[0])
			texto.removeChild(texto.childNodes[0]);
		var ct = document.createTextNode(bio_niq_color_colorCheck.RGBhexColor(R + ',' + G + ',' + B) + ' || R:'+ R + ' G:' + G + ' B:' + B +')');
		texto.appendChild(ct);

		bio_niq_color_colorCheck.sendColor('rgb('+IMGcache.data[0]+ ',' + IMGcache.data[1]+ ',' + IMGcache.data[2] +')',bio_niq_color_colorCheck.colorpickerDest);

	},
	getColorFromPickerStop:function(e){
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIWebNavigation)
					   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
					   .rootTreeItem
					   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIDOMWindow);
		var canvas = mainWindow.getBrowser().selectedBrowser.contentWindow.document.getElementById('canvas_colorCheck');
		if(canvas)
			canvas.parentNode.removeChild(canvas);
		var sample = mainWindow.getBrowser().selectedBrowser.contentWindow.document.getElementById('sample_colorCheck');
		if(sample)
			sample.parentNode.removeChild(sample);
		bio_niq_color_colorCheck.whe = 'top';
	},
	simulaDef:function(t,val){

		var defc = new bio_niq_color_colorCheck.alterac(t);

		var valores = new Array();
		if(val.indexOf('rgb') > -1) val = val.replace('rgb','');
		if(val.indexOf('(') > -1) val = val.replace('(','');
		if(val.indexOf(')') > -1) val = val.replace(')','');
		if(val.indexOf(':') > -1)
			valores = val.split(':');
		else if(val.indexOf(',') > -1)
			valores = val.split(',');
		else if(val.indexOf('/') > -1)
			valores = val.split('/');
		else if(val.indexOf('.') > -1)
			valores = val.split('.');
			
		redpre = defc.gammalut[valores[0]];
		greenpre = defc.gammalut[valores[1]];
		blue = defc.gammalut[valores[2]];
		red = redpre * bio_niq_color_colorCheck.rgb2lms[0] + greenpre * bio_niq_color_colorCheck.rgb2lms[1] + blue * bio_niq_color_colorCheck.rgb2lms[2];
		green = redpre * bio_niq_color_colorCheck.rgb2lms[3] + greenpre * bio_niq_color_colorCheck.rgb2lms[4] + blue * bio_niq_color_colorCheck.rgb2lms[5];
		blue = redpre * bio_niq_color_colorCheck.rgb2lms[6] + greenpre * bio_niq_color_colorCheck.rgb2lms[7] + blue * bio_niq_color_colorCheck.rgb2lms[8];
		
		return [red,green,blue]
	},
	simula: function(){
		
		bio_niqueladas_colorCheck.eliminaSeleccion();
		
		var vision_tipo = document.getElementById('vision_tipo').value;
		var vision_tipo_index = document.getElementById('vision_tipo').selectedIndex;
		

		var remoteWindow = window.content;
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIWebNavigation)
					   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
					   .rootTreeItem
					   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					   .getInterface(Components.interfaces.nsIDOMWindow);
		var sample = mainWindow.getBrowser().selectedBrowser.contentWindow.document.getElementById('prog_colorCheck');
		var body = mainWindow.getBrowser().selectedBrowser.contentWindow.document.getElementsByTagName('body')[0];
		if(sample)
			sample.parentNode.removeChild(sample);
		sample = remoteWindow.document.createElement("div");
		sample.setAttribute('id','prog_colorCheck');
		sample.setAttribute('style','background-color: rgba(0,0,0,.6);display:block;border:1px solid #FFF;box-shadow: 0 0 20px;padding: 10px;position:fixed;top: 100px;left:50%;margin-left:-135px;border-radius: 5px; z-index: 1000000;shadow: 2px 2px 2px #333; color: #FFF;font-size: 12px;');
		var sampleT = remoteWindow.document.createTextNode('Actualizando contenido e imágenes...');
		var progress = remoteWindow.document.createElement("progress");
		progress.setAttribute('id','progBar_colorCheck');
		progress.setAttribute('value','0');
		progress.setAttribute('style','display:block;width: 250px;margin: auto;');

		sample.appendChild(sampleT);
		sample.appendChild(progress);
		
		body.appendChild(sample);
		
		bio_niq_color_colorCheck.sample_prog = sample;
		
		var documentos = bio_documents_colorCheck.documents();
		
		var totalizador = -1;
		var totalizador_b = -1;
		var totalizador_object = -1;
		var totalizador_canvas = -1;
		var totalizador_conImg = 0;
		bio_niq_color_colorCheck.bio_imagenes_f = new Array();
		bio_niq_color_colorCheck.bio_canvas = new Array();
		bio_niq_color_colorCheck.bio_object = new Array();
		for (var doc_number = 0; doc_number < documentos.length; doc_number++) {
			if(documentos[doc_number].getElementsByTagName('body')[0]){
				var base = documentos[doc_number].getElementsByTagName('body')[0];
			}
			if(documentos[doc_number].getElementsByTagName('head')[0]){
				var head = documentos[doc_number].getElementsByTagName('head')[0];
				if(documentos[doc_number].getElementById('bio_color_css'))
					head.removeChild(documentos[doc_number].getElementById('bio_color_css'));

				if(documentos[doc_number].getElementById('bio_color_canvas'))
					head.removeChild(documentos[doc_number].getElementById('bio_color_canvas'));
			}
			var cad = '';
			if(base){
				var cadXpath = '//canvas[contains(@class,"bio_canvas_disc")]';
				var elementos = bio_general_colorCheck.getElementsByClassName(documentos[doc_number], '*', 'bio_canvas_disc');
				for (var i = elementos.length - 1; i >= 0; i--) {
					elementos[i].parentNode.removeChild(elementos[i]);
				}

				cadXpath = '//*[';
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
				for (var i = 0; i < elementos.length; i++) {
					try{
						if(elementos[i].getAttribute('bio_style')){					
							if(vision_tipo_index == 0){
								var srcT = documentos[doc_number].location.toString();
								if(bio_niq_color_colorCheck.bio_capturas[srcT])
									bio_niq_color_colorCheck.bio_capturas[srcT] = null;
								if(elementos[i].getAttribute('bio_style') == 'false'){
									elementos[i].removeAttribute('bio_style');
									if(elementos[i].getAttribute('style'))
										elementos[i].removeAttribute('style');
									if(elementos[i].getAttribute('bio_style_img_fore')){
										elementos[i].setAttribute('src', elementos[i].getAttribute('bio_style_img_fore'));
										elementos[i].removeAttribute('bio_style_img_fore');
									}
									if(elementos[i].getAttribute('bio_style_f')){
										elementos[i].removeAttribute('bio_style_f');
									}
									if(elementos[i].getAttribute('bio_style_fill')){
										elementos[i].removeAttribute('bio_style_fill');
									}
									if(elementos[i].getAttribute('bio_style_stroke')){
										elementos[i].removeAttribute('bio_style_stroke');
									}
									if(elementos[i].getAttribute('bio_style_f-after')){
										elementos[i].removeAttribute('bio_style_f-after');
									}
									if(elementos[i].getAttribute('bio_style_f-before')){
										elementos[i].removeAttribute('bio_style_f-before');
									}
									if(elementos[i].getAttribute('bio_style_b')){
										elementos[i].removeAttribute('bio_style_b');
									}
									if(elementos[i].getAttribute('bio_style_b-t')){
										elementos[i].removeAttribute('bio_style_b-t');
									}
									if(elementos[i].getAttribute('bio_style_b-r')){
										elementos[i].removeAttribute('bio_style_b-r');
									}
									if(elementos[i].getAttribute('bio_style_b-b')){
										elementos[i].removeAttribute('bio_style_b-b');
									}
									if(elementos[i].getAttribute('bio_style_b-l')){
										elementos[i].removeAttribute('bio_style_b-l');
									}
									if(elementos[i].getAttribute('bio_style_img')){
										elementos[i].removeAttribute('bio_style_img');
									}
									if(elementos[i].getAttribute('bio_style_img-after')){
										elementos[i].removeAttribute('bio_style_img-after');
									}
									if(elementos[i].getAttribute('bio_style_img-before')){
										elementos[i].removeAttribute('bio_style_img-before');
									}
								}else{
									if(elementos[i].getAttribute('bio_style_f')){
										elementos[i].style.setProperty('color', elementos[i].getAttribute('bio_style_f'), 'important');
										elementos[i].removeAttribute('bio_style_f');
									}
									if(elementos[i].getAttribute('bio_style_fill')){
										elementos[i].style.setProperty('fill', elementos[i].getAttribute('bio_style_fill'), 'important');
										elementos[i].removeAttribute('bio_style_fill');
									}
									if(elementos[i].getAttribute('bio_style_stroke')){
										elementos[i].style.setProperty('stroke', elementos[i].getAttribute('bio_style_stroke'), 'important');
										elementos[i].removeAttribute('bio_style_stroke');
									}
									if(elementos[i].getAttribute('bio_style_f-after')){
										elementos[i].style.setProperty('color', elementos[i].getAttribute('bio_style_f-after'), 'important');
										elementos[i].removeAttribute('bio_style_f-after');
									}
									if(elementos[i].getAttribute('bio_style_f-before')){
										elementos[i].style.setProperty('color', elementos[i].getAttribute('bio_style_f-before'), 'important');
										elementos[i].removeAttribute('bio_style_f-before');
									}
									if(elementos[i].getAttribute('bio_style_b')){
										elementos[i].style.setProperty('background-color', elementos[i].getAttribute('bio_style_b'), 'important');
										elementos[i].removeAttribute('bio_style_b');
									}
									if(elementos[i].getAttribute('bio_style_b-t')){
										elementos[i].style.setProperty('border-top-color', elementos[i].getAttribute('bio_style_b-t'), 'important');
										elementos[i].removeAttribute('bio_style_b-t');
									}
									if(elementos[i].getAttribute('bio_style_b-r')){
										elementos[i].style.setProperty('border-right-color', elementos[i].getAttribute('bio_style_b-r'), 'important');
										elementos[i].removeAttribute('bio_style_b-r');
									}
									if(elementos[i].getAttribute('bio_style_b-b')){
										elementos[i].style.setProperty('border-bottom-color', elementos[i].getAttribute('bio_style_b-b'), 'important');
										elementos[i].removeAttribute('bio_style_b-b');
									}
									if(elementos[i].getAttribute('bio_style_b-l')){
										elementos[i].style.setProperty('border-left-color', elementos[i].getAttribute('bio_style_b-l'), 'important');
										elementos[i].removeAttribute('bio_style_b-l');
									}
									if(elementos[i].getAttribute('bio_style_bs')){
										elementos[i].style.setProperty('box-shadow', elementos[i].getAttribute('bio_style_bs'), 'important');
										elementos[i].removeAttribute('bio_style_bs');
									}
									if(elementos[i].getAttribute('bio_style_img')){
										elementos[i].setAttribute('background-image', elementos[i].getAttribute('bio_style_img'));
										elementos[i].removeAttribute('bio_style_img');
									}
									if(elementos[i].getAttribute('bio_style_img-after')){
										elementos[i].setAttribute('background-image', elementos[i].getAttribute('bio_style_img-after'));
										elementos[i].removeAttribute('bio_style_img-after');
									}
									if(elementos[i].getAttribute('bio_style_img-before')){
										elementos[i].setAttribute('background-image', elementos[i].getAttribute('bio_style_img-before'));
										elementos[i].removeAttribute('bio_style_img-before');
									}
									if(elementos[i].getAttribute('bio_style_img_fore')){
										elementos[i].setAttribute('src', elementos[i].getAttribute('bio_style_img_fore'));
										elementos[i].removeAttribute('bio_style_img_fore');
									}
								}
								if(elementos[i].getAttribute('bio_img_cross')){
									elementos[i].setAttribute('crossorigin',elementos[i].getAttribute('bio_img_cross'));
									elementos[i].removeAttribute('bio_img_cross');
								}
							}
							if(elementos[i].getAttribute('class'))
								elementos[i].setAttribute('class',elementos[i].getAttribute('class').replace('bio_canvas',''));
						}
						if(vision_tipo_index > 0){
							if(elementos[i].getAttribute('style')){
								if(!elementos[i].getAttribute('bio_style'))
									elementos[i].setAttribute('bio_style','true');
								else
									if(!elementos[i].getAttribute('bio_style') == 'true')
										elementos[i].setAttribute('bio_style','false');
							}else{
								elementos[i].setAttribute('bio_style','false');
							}
							if(!elementos[i].getAttribute('bio_style_f'))
								var c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('color');
							else
								var c = elementos[i].getAttribute('bio_style_f');
							if(!(c == 'transparent')){
								var colores = c.match(/\(([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]),\s([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]),\s([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])(?=(\,|\)))/gi);
								var cf_disc = c;
								for(var j = 0; j < colores.length; j++){
									var color = colores[j].replace('(','').replace(/\s/g,'');
									var colorDef = bio_niq_color_colorCheck.calDefRev(color,vision_tipo);
									cf_disc = cf_disc.replace(colores[j], '(' + colorDef);
								}
								if(!(cf_disc == c)){
									if(!elementos[i].getAttribute('bio_style_f'))
										elementos[i].setAttribute('bio_style_f',c);
									elementos[i].style.setProperty('color', cf_disc, 'important');
								}
							}
							if(!elementos[i].getAttribute('bio_style_fill'))
								var c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('fill');
							else
								var c = elementos[i].getAttribute('bio_style_fill');
							if(!(c == 'transparent')){
								var colores = c.match(/\(([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]),\s([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]),\s([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])(?=(\,|\)))/gi);
								var cf_disc = c;
								for(var j = 0; j < colores.length; j++){
									var color = colores[j].replace('(','').replace(/\s/g,'');
									var colorDef = bio_niq_color_colorCheck.calDefRev(color,vision_tipo);
									cf_disc = cf_disc.replace(colores[j], '(' + colorDef);
								}
								if(!(cf_disc == c)){
									if(!elementos[i].getAttribute('bio_style_fill'))
										elementos[i].setAttribute('bio_style_fill',c);
									elementos[i].style.setProperty('fill', cf_disc, 'important');
								}
							}
							if(!elementos[i].getAttribute('bio_style_stroke'))
								var c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('stroke');
							else
								var c = elementos[i].getAttribute('bio_style_stroke');
							if(!(c == 'none')){
								var colores = c.match(/\(([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]),\s([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]),\s([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])(?=(\,|\)))/gi);
								var cf_disc = c;
								for(var j = 0; j < colores.length; j++){
									var color = colores[j].replace('(','').replace(/\s/g,'');
									var colorDef = bio_niq_color_colorCheck.calDefRev(color,vision_tipo);
									cf_disc = cf_disc.replace(colores[j], '(' + colorDef);
								}
								if(!(cf_disc == c)){
									if(!elementos[i].getAttribute('bio_style_stroke'))
										elementos[i].setAttribute('bio_style_stroke',c);
									elementos[i].style.setProperty('stroke', cf_disc, 'important');
								}
							}
							if(!elementos[i].getAttribute('bio_style_f-after'))
								var c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], ':after').getPropertyValue('color');
							else
								var c = elementos[i].getAttribute('bio_style_f-after');
							if(!(c == 'transparent')){
								var cfa = c.replace('rgba(','').replace('rgb(','').replace(')','').split(',');
								var cf = cfa[0].trim() + ',' + cfa[1].trim() + ',' + cfa[2].trim();
								var cf_disc = bio_niq_color_colorCheck.calDefRev(cf,vision_tipo);
								if(!(cf_disc == cf)){
									if(!elementos[i].getAttribute('bio_style_f-after'))
										elementos[i].setAttribute('bio_style_f-after',c);
									if(c.indexOf('rgba') >= 0)
										cf_disc = 'rgba(' + cf_disc + ',' + cfa[3] + ')';
									else
										cf_disc = 'rgb(' + cf_disc + ')';
									
									if(elementos[i].getAttribute('id')){
										cad += elementos[i].tagName.toLowerCase() + '#' + elementos[i].getAttribute('id') + ':after {color: ' + cf_disc +' !important}'
									}else{
										cad += elementos[i].tagName.toLowerCase() + '.pos_' + i + ':after {color: ' + cf_disc +' !important}'
										if(elementos[i].className.indexOf('pos_' + i) == -1)
											elementos[i].className += ' ' + 'pos_' + i;
									}
								}
							}
							if(!elementos[i].getAttribute('bio_style_f-before'))
								var c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], ':before').getPropertyValue('color');
							else
								var c = elementos[i].getAttribute('bio_style_f-before');
							if(!(c == 'transparent')){
								var cfa = c.replace('rgba(','').replace('rgb(','').replace(')','').split(',');
								var cf = cfa[0].trim() + ',' + cfa[1].trim() + ',' + cfa[2].trim();
								var cf_disc = bio_niq_color_colorCheck.calDefRev(cf,vision_tipo);
								if(!(cf_disc == cf)){
									if(!elementos[i].getAttribute('bio_style_f-before'))
										elementos[i].setAttribute('bio_style_f-before',c);
									if(c.indexOf('rgba') >= 0)
										cf_disc = 'rgba(' + cf_disc + ',' + cfa[3] + ')';
									else
										cf_disc = 'rgb(' + cf_disc + ')';

									if(elementos[i].getAttribute('id')){
										cad += elementos[i].tagName.toLowerCase() + '#' + elementos[i].getAttribute('id') + ':before {color: ' + cf_disc +' !important}'
									}else{
										cad += elementos[i].tagName.toLowerCase() + '.pos_' + i + ':before {color: ' + cf_disc +' !important}'
										if(elementos[i].className.indexOf('pos_' + i) == -1)
											elementos[i].className += ' ' + 'pos_' + i;
									}
								}								
							}
							if(!elementos[i].getAttribute('bio_style_b'))
								c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('background-color');
							else
								c = elementos[i].getAttribute('bio_style_b');
							if(!(c == 'transparent')){
								var cfa = c.replace('rgba(','').replace('rgb(','').replace(')','').split(',');
								var cf = cfa[0].trim() + ',' + cfa[1].trim() + ',' + cfa[2].trim();
								var cf_disc = bio_niq_color_colorCheck.calDefRev(cf,vision_tipo);
								if(!(cf_disc == cf)){
									if(!elementos[i].getAttribute('bio_style_b'))
										elementos[i].setAttribute('bio_style_b',c);
									if(c.indexOf('rgba') >= 0)
										cf_disc = 'rgba(' + cf_disc + ',' + cfa[3] + ')';
									else
										cf_disc = 'rgb(' + cf_disc + ')';
										
									elementos[i].style.setProperty('background-color', cf_disc, 'important');
								}
							}
							if(!elementos[i].getAttribute('bio_style_b-t'))
								c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('border-top-color');
							else
								c = elementos[i].getAttribute('bio_style_b-t');
							if(!(c == 'transparent')){
								var cfa = c.replace('rgba(','').replace('rgb(','').replace(')','').split(',');
								var cf = cfa[0].trim() + ',' + cfa[1].trim() + ',' + cfa[2].trim();
								var cf_disc = bio_niq_color_colorCheck.calDefRev(cf,vision_tipo);
								if(!(cf_disc == cf)){
									if(!elementos[i].getAttribute('bio_style_b-t'))
										elementos[i].setAttribute('bio_style_b-t',c);
									if(c.indexOf('rgba') >= 0)
										cf_disc = 'rgba(' + cf_disc + ',' + cfa[3] + ')';
									else
										cf_disc = 'rgb(' + cf_disc + ')';
										
									elementos[i].style.setProperty('border-top-color', cf_disc, 'important');
								}
							}
							if(!elementos[i].getAttribute('bio_style_b-r'))
								c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('border-right-color');
							else
								c = elementos[i].getAttribute('bio_style_b-r');						
							if(!(c == 'transparent')){
								var cfa = c.replace('rgba(','').replace('rgb(','').replace(')','').split(',');
								var cf = cfa[0].trim() + ',' + cfa[1].trim() + ',' + cfa[2].trim();
								var cf_disc = bio_niq_color_colorCheck.calDefRev(cf,vision_tipo);
								if(!(cf_disc == cf)){
									if(!elementos[i].getAttribute('bio_style_b-r'))
										elementos[i].setAttribute('bio_style_b-r',c);
									if(c.indexOf('rgba') >= 0)
										cf_disc = 'rgba(' + cf_disc + ',' + cfa[3] + ')';
									else
										cf_disc = 'rgb(' + cf_disc + ')';
										
									elementos[i].style.setProperty('border-right-color', cf_disc, 'important');
								}
							}
							if(!elementos[i].getAttribute('bio_style_b-b'))
								c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('border-bottom-color');
							else
								c = elementos[i].getAttribute('bio_style_b-b');							
							if(!(c == 'transparent')){
								var cfa = c.replace('rgba(','').replace('rgb(','').replace(')','').split(',');
								var cf = cfa[0].trim() + ',' + cfa[1].trim() + ',' + cfa[2].trim();
								var cf_disc = bio_niq_color_colorCheck.calDefRev(cf,vision_tipo);
								if(!(cf_disc == cf)){
									if(!elementos[i].getAttribute('bio_style_b-b'))
										elementos[i].setAttribute('bio_style_b-b',c);
									if(c.indexOf('rgba') >= 0)
										cf_disc = 'rgba(' + cf_disc + ',' + cfa[3] + ')';
									else
										cf_disc = 'rgb(' + cf_disc + ')';
										
									elementos[i].style.setProperty('border-bottom-color', cf_disc, 'important');
								}
							}
							if(!elementos[i].getAttribute('bio_style_b-l'))
								c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('border-left-color');
							else
								c = elementos[i].getAttribute('bio_style_b-l');							
							if(!(c == 'transparent')){
								var cfa = c.replace('rgba(','').replace('rgb(','').replace(')','').split(',');
								var cf = cfa[0].trim() + ',' + cfa[1].trim() + ',' + cfa[2].trim();
								var cf_disc = bio_niq_color_colorCheck.calDefRev(cf,vision_tipo);
								if(!(cf_disc == cf)){
									if(!elementos[i].getAttribute('bio_style_b-l'))
										elementos[i].setAttribute('bio_style_b-l',c);
									if(c.indexOf('rgba') >= 0)
										cf_disc = 'rgba(' + cf_disc + ',' + cfa[3] + ')';
									else
										cf_disc = 'rgb(' + cf_disc + ')';
										
									elementos[i].style.setProperty('border-left-color', cf_disc, 'important');
								}
							}
							if(!elementos[i].getAttribute('bio_style_bs'))
								c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('box-shadow');
							else
								c = elementos[i].getAttribute('bio_style_bs');							
							if(!(c == 'none') && c.indexOf('transparent') == -1){

								var p = c.split('(');
								var l = p[1].split(')');
								var s = l[0].split(',');
								var d = s[0].trim() + ',' + s[1].trim() + ',' + s[2].trim();
								if(c.indexOf('rgba') >= 0)
									cf_disc = 'rgba(' + bio_niq_color_colorCheck.calDefRev(d,vision_tipo) + ',' + s[3] + ')' + l[1];
								else
									cf_disc = 'rgb(' + bio_niq_color_colorCheck.calDefRev(d,vision_tipo) + ')' + l[1];

								if(!(cf_disc == d)){								
									if(!elementos[i].getAttribute('bio_style_bs'))
										elementos[i].setAttribute('bio_style_bs',c);
									elementos[i].style.setProperty('box-shadow', cf_disc, 'important');
								}
								
							}
							if(!elementos[i].getAttribute('bio_style_img-after'))
								c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], ':after').getPropertyValue('background-image').replace('url("','').replace('")','');
							else
								c = elementos[i].getAttribute('bio_style_img-after');						
							if(!(c == 'none')){
								if(!elementos[i].getAttribute('bio_style_img-after'))
									elementos[i].setAttribute('bio_style_img-after',c);
								if(c.indexOf('linear-gradient') >= 0){
									var p = c.split('linear-gradient');
									if(p[1].indexOf('rgba') >= 0){
										var sep = 'rgba(';
									}else{
										var sep = 'rgb(';
									}
									var l = p[1].split(sep);
									var tm = p[0] + 'linear-gradient' ;
									for (var a = 0; a < l.length; a++) {
										if(l[a].indexOf(')') > 0){
											var t = l[a].replace('(','').replace('))','');
											var tp = '';
											if(t.indexOf('),','') >= 0){
												t = t.replace('),','');
											}else{
												var tt = t.split(')');
												t = tt[0];
												if(tt[1])
													tp = tt[1];
											}
												
											l[a] = bio_niq_color_colorCheck.calDefRev(t,vision_tipo);
											tm += ' ' + sep + l[a] + ') ' + tp + ', ';
										}else{
											tm += ' ' + l[a] + ' ';
										}
									}
									tm += ')';
									tm = tm.replace('gradient (','gradient(').replace('), )','))').replace('),  )','))').replace('),)','))').replace(', ),',',').replace(')))',')').replace(', ,',',').replace(', )',')');

									if(elementos[i].getAttribute('id')){
										cad += elementos[i].tagName.toLowerCase() + '#' + elementos[i].getAttribute('id') + ':after {background-image: ' + tm +' !important}'
									}else{
										cad += elementos[i].tagName.toLowerCase() + '.pos_' + i + ':after {background-image: ' + tm +' !important}'
										if(elementos[i].className.indexOf('pos_' + i) == -1)
											elementos[i].className += ' ' + 'pos_' + i;
									}

								}else{
									var cadt = '';
									if(elementos[i].getAttribute('id')){
										cadt += elementos[i].tagName.toLowerCase() + '#' + elementos[i].getAttribute('id') + ':after {background-image: ';
									}else{
										cadt += elementos[i].tagName.toLowerCase() + '.pos_' + i + ':after {background-image: ';
										if(elementos[i].className.indexOf('pos_' + i) == -1)
											elementos[i].className += ' ' + 'pos_' + i;
									}
									totalizador++;
									bio_niq_color_colorCheck.bio_imagenes_f[totalizador] = new Array();
									bio_niq_color_colorCheck.bio_imagenes_f[totalizador] = [bio_niq_color_colorCheck.rutaImg(c,elementos[i]),elementos[i],'fondo:after',vision_tipo,cadt];
								}
							}
							if(!elementos[i].getAttribute('bio_style_img-before'))
								c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], ':before').getPropertyValue('background-image').replace('url("','').replace('")','');
							else
								c = elementos[i].getAttribute('bio_style_img-before');						
							if(!(c == 'none')){
								if(!elementos[i].getAttribute('bio_style_img-before'))
									elementos[i].setAttribute('bio_style_img-before',c);
								if(c.indexOf('linear-gradient') >= 0){
									var p = c.split('linear-gradient');
									if(p[1].indexOf('rgba') >= 0){
										var sep = 'rgba(';
									}else{
										var sep = 'rgb(';
									}
									var l = p[1].split(sep);
									var tm = p[0] + 'linear-gradient' ;
									for (var a = 0; a < l.length; a++) {
										if(l[a].indexOf(')') > 0){
											var t = l[a].replace('(','').replace('))','');
											var tp = '';
											if(t.indexOf('),','') >= 0){
												t = t.replace('),','');
											}else{
												var tt = t.split(')');
												t = tt[0];
												if(tt[1])
													tp = tt[1];
											}
												
											l[a] = bio_niq_color_colorCheck.calDefRev(t,vision_tipo);
											tm += ' ' + sep + l[a] + ') ' + tp + ', ';
										}else{
											tm += ' ' + l[a] + ' ';
										}
									}
									tm += ')';
									tm = tm.replace('gradient (','gradient(').replace('), )','))').replace('),  )','))').replace('),)','))').replace(', ),',',').replace(')))',')').replace(', ,',',').replace(', )',')');

									if(elementos[i].getAttribute('id')){
										cad += elementos[i].tagName.toLowerCase() + '#' + elementos[i].getAttribute('id') + ':before {background-image: ' + tm +' !important}'
									}else{
										cad += elementos[i].tagName.toLowerCase() + '.pos_' + i + ':before {background-image: ' + tm +' !important}'
										if(elementos[i].className.indexOf('pos_' + i) == -1)
											elementos[i].className += ' ' + 'pos_' + i;
									}
								}else{
									var cadt = '';
									if(elementos[i].getAttribute('id')){
										cadt += elementos[i].tagName.toLowerCase() + '#' + elementos[i].getAttribute('id') + ':before {background-image: ';
									}else{
										cadt += elementos[i].tagName.toLowerCase() + '.pos_' + i + ':before {background-image: ';
										if(elementos[i].className.indexOf('pos_' + i) == -1)
											elementos[i].className += ' ' + 'pos_' + i;
									}
									totalizador++;
									bio_niq_color_colorCheck.bio_imagenes_f[totalizador] = new Array();
									bio_niq_color_colorCheck.bio_imagenes_f[totalizador] = [bio_niq_color_colorCheck.rutaImg(c,elementos[i]),elementos[i],'fondo:before',vision_tipo,cadt];
								}
							}
							if(!elementos[i].getAttribute('bio_style_img'))
								c = documentos[doc_number].defaultView.getComputedStyle(elementos[i], null).getPropertyValue('background-image');
							else
								c = elementos[i].getAttribute('bio_style_img');						
							if(!(c == 'none')){
								if(!elementos[i].getAttribute('bio_style_img'))
									elementos[i].setAttribute('bio_style_img',c);

								elementos[i].style.setProperty('background-image', c, 'important');
								
								var colores = elementos[i].getAttribute('style').match(/\(([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]),\s([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5]),\s([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])(?=(\,|\)))/gi);
								var tm = c;
								for(var j = 0; j < colores.length; j++){
									var color = colores[j].replace('(','').replace(/\s/g,'');
									var colorDef = bio_niq_color_colorCheck.calDefRev(color,vision_tipo);
									elementos[i].setAttribute('style',elementos[i].getAttribute('style').replace(colores[j], '(' + colorDef));
								}
								var cImg = elementos[i].getAttribute('style').match(/url\([^\)]+\)/gi);
								if(cImg){
									for(var j = 0; j < cImg.length; j++){
										var immm = cImg[j].replace('url("','').replace('")','');
										totalizador++;
										bio_niq_color_colorCheck.bio_imagenes_f[totalizador] = new Array();
										bio_niq_color_colorCheck.bio_imagenes_f[totalizador] = [bio_niq_color_colorCheck.rutaImg(immm,elementos[i]),elementos[i],'fondo',vision_tipo,''];
									}
								}
							}
							if(elementos[i].getAttribute('src') && (elementos[i].tagName.toLowerCase() == 'img' || elementos[i].tagName.toLowerCase() == 'input' || elementos[i].tagName.toLowerCase() == 'button')){
								if(elementos[i].getAttribute('bio_style_img_fore')){
									var ruta = elementos[i].getAttribute('bio_style_img_fore');
								}else{
									var ruta = elementos[i].getAttribute('src');
									elementos[i].setAttribute('bio_style_img_fore',ruta);
								}
								if(!(elementos[i].getAttribute('crossorigin') == null)){
									elementos[i].setAttribute('bio_img_cross',elementos[i].getAttribute('crossorigin'));
									elementos[i].removeAttribute('crossorigin');
								}
								totalizador++;
								bio_niq_color_colorCheck.bio_imagenes_f[totalizador] = new Array()
								bio_niq_color_colorCheck.bio_imagenes_f[totalizador] = [bio_niq_color_colorCheck.rutaImg(ruta,elementos[i]),elementos[i],'primerPlano',vision_tipo,'']
							}
							if(elementos[i].tagName.toLowerCase() == 'canvas' || elementos[i].tagName.toLowerCase() == 'video'){
								totalizador_canvas++;
								bio_niq_color_colorCheck.bio_canvas[totalizador_canvas] = new Array()
								bio_niq_color_colorCheck.bio_canvas[totalizador_canvas] = [elementos[i],vision_tipo];
								cad += 'canvas.bio_canvas,video.bio_canvas{display:none;width:0;height0}';
							}
						}else{
							if(elementos[i].getAttribute('bio_style'))
								elementos[i].removeAttribute('bio_style');
						}
					} catch (e) {
						
					}
				}
				/*
				elementos = new Array();
				elementos = documentos[doc_number].getElementsByTagName('embed');
				for (var i = 0; i < elementos.length; i++) {
					if(elementos[i].getAttribute('class'))
						elementos[i].setAttribute('class',elementos[i].getAttribute('class').replace('bio_canvas',''));
					if(vision_tipo_index > 0){
						if(elementos[i].getAttribute('src')){
							cad += 'canvas.bio_canvas,video.bio_canvas{display:none;width:0;height0}';
							var src = elementos[i].getAttribute('src');
							totalizador_object++;
							bio_niq_color_colorCheck.bio_object[totalizador_object] = new Array()
							bio_niq_color_colorCheck.bio_object[totalizador_object] = [elementos[i],'src',vision_tipo];
							cad += 'object.bio_canvas,embed.bio_canvas{display:none;width:0;height0}';
						}
					}
				}
				elementos = new Array();
				elementos = documentos[doc_number].getElementsByTagName('object');
				for (var i = 0; i < elementos.length; i++) {
					if(elementos[i].getAttribute('class'))
						elementos[i].setAttribute('class',elementos[i].getAttribute('class').replace('bio_canvas',''));
					if(vision_tipo_index > 0){
						if(elementos[i].getAttribute('data')){
							cad += 'canvas.bio_canvas,video.bio_canvas{display:none;width:0;height0}';
							var data = elementos[i].getAttribute('data');
							totalizador_object++;
							bio_niq_color_colorCheck.bio_object[totalizador_object] = new Array()
							bio_niq_color_colorCheck.bio_object[totalizador_object] = [elementos[i],'data',vision_tipo];
							cad += 'object.bio_canvas,embed.bio_canvas{display:none;width:0;height0}';
						}else{
							subelementos = elementos[i].getElementsByTagName('embed');
							for (var i = 0; i < subelementos.length; i++) {
								if(subelementos[i].getAttribute('class'))
									subelementos[i].setAttribute('class',subelementos[i].getAttribute('class').replace('bio_canvas',''));
								if(vision_tipo_index > 0){
									if(subelementos[i].getAttribute('src')){
										cad += 'canvas.bio_canvas,video.bio_canvas{display:none;width:0;height0}';
										var src = subelementos[i].getAttribute('src');
										totalizador_object++;
										bio_niq_color_colorCheck.bio_object[totalizador_object] = new Array()
										bio_niq_color_colorCheck.bio_object[totalizador_object] = [subelementos[i],'src',vision_tipo];
										cad += 'object.bio_canvas,embed.bio_canvas{display:none;width:0;height0}';
									}
								}
							}

						}
					}
				}
				*/

				if(head && cad){
					if(documentos[doc_number].getElementById('bio_color_css'))
						head.removeChild(documentos[doc_number].getElementById('bio_color_css'));
					var style_new = documentos[doc_number].createElement('style');
					style_new.setAttribute('id','bio_color_css');
					style_new.setAttribute('rel','stylesheet');
					var style_cad = documentos[doc_number].createTextNode(cad);
					style_new.appendChild(style_cad);
					head.appendChild(style_new);
				}

			}
		}
		progress.setAttribute('max',bio_niq_color_colorCheck.bio_imagenes_f.length + bio_niq_color_colorCheck.bio_canvas.length + bio_niq_color_colorCheck.bio_object.length);
		bio_niq_color_colorCheck.bio_imagenes_disc = new Array();
		if(bio_niq_color_colorCheck.bio_imagenes_f.length){
			bio_niq_color_colorCheck.sample_prog = sample;
			bio_niq_color_colorCheck.sustituyeImg_disc(bio_niq_color_colorCheck.bio_imagenes_f[0]);
			progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_imagenes_f.length);
		}else if (bio_niq_color_colorCheck.bio_imagenes_f.length == 0 && bio_niq_color_colorCheck.bio_canvas.length){
			bio_niq_color_colorCheck.sample_prog = sample;
			bio_niq_color_colorCheck.sustituyeCanvas_disc(bio_niq_color_colorCheck.bio_canvas[0]);
			progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_canvas.length);
		}else if (bio_niq_color_colorCheck.bio_imagenes_f.length == 0 && bio_niq_color_colorCheck.bio_canvas.length == 0 && bio_niq_color_colorCheck.bio_object.length){

			bio_niq_color_colorCheck.sample_prog = sample;
			bio_niq_color_colorCheck.sustituyeObject_disc(bio_niq_color_colorCheck.bio_object[0]);
			progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_object.length);
		}
		if(bio_niq_color_colorCheck.bio_imagenes_f.length == 0 && bio_niq_color_colorCheck.bio_canvas.length == 0 && bio_niq_color_colorCheck.bio_object.length == 0){
			body.removeChild(sample);
		}
	},
	getRoot: function(who){
		while (who && who.nodeType!= 9) who= who.parentNode;
		return who;
	},
	rutaImg: function(src,elem_des){
		var dom = bio_niq_color_colorCheck.getRoot(elem_des);
		var srcT = dom.location.toString().split('/');
		if(src.indexOf('http') == -1 && !(src.indexOf('data:') == 0) && !(src.indexOf('chrome://') == 0)){
			if(src.indexOf('/') == 0){
				if(src.indexOf('//') == 0){
					src = dom.location.toString().split('/')[0] + src;
				}else{
					src = dom.location.toString().split('/')[0] + '//' + dom.domain + src;
				}
			}else{
				var sc = '';
				for(var i = 0; i < srcT.length - 1; i++){
					sc += srcT[i] + '/';
				}				
				src = sc + '/' + src;
			}
		}
		return src;
	},
	sustituyeImg_disc: function(elArr){
		var progress = bio_niq_color_colorCheck.sample_prog.getElementsByTagName('progress')[0];
		var src = elArr[0];
		var elem_des = elArr[1];
		var tipo_des = elArr[2];
		var tipo = elArr[3];
		var se = elArr[4];
		var dom = bio_niq_color_colorCheck.getRoot(elem_des);
		try{
				if(bio_niq_color_colorCheck.bio_imagenes_disc[src]){
					if(tipo_des == 'fondo'){
						elem_des.setAttribute('style',elem_des.getAttribute('style').replace(src,bio_niq_color_colorCheck.bio_imagenes_disc[src]));
						//elem_des.style.setProperty('background-image', 'url("' + bio_niq_color_colorCheck.bio_imagenes_disc[src] + '")', 'important');
					}
					if(tipo_des == 'primerPlano')
						elem_des.setAttribute('src', bio_niq_color_colorCheck.bio_imagenes_disc[src]);
					if(tipo_des == 'fondo:after' || tipo_des == 'fondo:before'){
						var dom = bio_niq_color_colorCheck.getRoot(elem_des);;
						var st = dom.getElementById('bio_color_css');
						if(!st){
							st = dom.createElement('style');
							st.setAttribute('id','bio_color_css');
							st.setAttribute('rel','stylesheet');
						}
						var style_cad = dom.createTextNode(se + 'url("' + bio_niq_color_colorCheck.bio_imagenes_disc[src] + '")!important;}');
						st.appendChild(style_cad);
						if(dom.getElementsByTagName('head')[0])
							dom.getElementsByTagName('head')[0].appendChild(st);
					}
						

					if(bio_niq_color_colorCheck.bio_imagenes_f.length){
						var tmpArr = new Array();
						tmpArr = bio_niq_color_colorCheck.bio_imagenes_f.shift();
						if(bio_niq_color_colorCheck.bio_imagenes_f.length)
							bio_niq_color_colorCheck.sustituyeImg_disc(bio_niq_color_colorCheck.bio_imagenes_f[0]);					

					}
					progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_imagenes_f.length);
					if(bio_niq_color_colorCheck.bio_imagenes_f.length == 1 || progress.getAttribute('value') == progress.getAttribute('max')){					
						if (bio_niq_color_colorCheck.bio_canvas.length){
							bio_niq_color_colorCheck.sustituyeCanvas_disc(bio_niq_color_colorCheck.bio_canvas[0]);
							progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_canvas.length);
						}else if (bio_niq_color_colorCheck.bio_object.length){
							bio_niq_color_colorCheck.sustituyeObject_disc(bio_niq_color_colorCheck.bio_object[0]);
							progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_object.length);
						}else{
							bio_niq_color_colorCheck.delProgress();
						}
					}
					if(bio_niq_color_colorCheck.bio_imagenes_f.length == 0 && bio_niq_color_colorCheck.bio_canvas.length == 0 && bio_niq_color_colorCheck.bio_object.length == 0){
							bio_niq_color_colorCheck.delProgress();
					}
				}else{
					var imagenCanvas = new Image();
					imagenCanvas.src = src;

					imagenCanvas.onload = function() {
						var canvas = document.createElementNS("http://www.w3.org/1999/xhtml","canvas");
						canvas.setAttribute("height", imagenCanvas.height);
						canvas.setAttribute("width", imagenCanvas.width);
						var ctx = canvas.getContext("2d");
						ctx.drawImage(imagenCanvas, 0, 0);

						var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
						var pixelData = pixels.data;
						
						for (var i = 0; i < pixelData.length; i+=4) { 
							var rr = pixelData[i+0];
							var gg = pixelData[i+1];
							var bb = pixelData[i+2];
							var tt = pixelData[i+3];

							var n =	bio_niq_color_colorCheck.calDefRev(rr + ',' + gg + ',' + bb,tipo).split(',');

							pixelData[parseInt(i+0)]=n[0];
							pixelData[parseInt(i+1)]=n[1];
							pixelData[parseInt(i+2)]=n[2];
							pixelData[parseInt(i+3)]=tt;
							
						}
						
						if(bio_niq_color_colorCheck.bio_imagenes_f.length == 0){					
							if (bio_niq_color_colorCheck.bio_canvas.length){
								bio_niq_color_colorCheck.sustituyeCanvas_disc(bio_niq_color_colorCheck.bio_canvas[0]);
								progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_canvas.length);
							}else if (bio_niq_color_colorCheck.bio_object.length){
								bio_niq_color_colorCheck.sustituyeObject_disc(bio_niq_color_colorCheck.bio_object[0]);
								progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_object.length);
							}else{
								bio_niq_color_colorCheck.delProgress();
							}
						}
							
						pixels.data = pixelData;
						ctx.putImageData(pixels, 0, 0);
						var strDataURI = canvas.toDataURL("image/png","");
						
						if(tipo_des == 'fondo'){
							elem_des.setAttribute('style',elem_des.getAttribute('style').replace(src,strDataURI));
							//elem_des.style.setProperty('background-image', 'url("' + strDataURI + '")', 'important');
						}else if(tipo_des == 'primerPlano'){
							elem_des.setAttribute('src', strDataURI);
						}else if(tipo_des == 'fondo:after' || tipo_des == 'fondo:before'){
							var st = dom.getElementById('bio_color_css');
							if(!st){
								st = dom.createElement('style');
								st.setAttribute('id','bio_color_css');
								st.setAttribute('rel','stylesheet');
							}
							var style_cad = dom.createTextNode(se + 'url("' + strDataURI + '")!important;}');
							st.appendChild(style_cad);
							if(dom.getElementsByTagName('head')[0])
								dom.getElementsByTagName('head')[0].appendChild(st);	
						}

						bio_niq_color_colorCheck.bio_imagenes_disc[this.src] = strDataURI;
						
						if(i  == pixelData.length && bio_niq_color_colorCheck.bio_imagenes_f.length){
							var tmpArr = new Array();
							tmpArr = bio_niq_color_colorCheck.bio_imagenes_f.shift();
							if(bio_niq_color_colorCheck.bio_imagenes_f.length)
								bio_niq_color_colorCheck.sustituyeImg_disc(bio_niq_color_colorCheck.bio_imagenes_f[0]);					

						}
						progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_imagenes_f.length);
						if((bio_niq_color_colorCheck.bio_imagenes_f.length == 1 || progress.getAttribute('value') == progress.getAttribute('max'))){						
							if (bio_niq_color_colorCheck.bio_canvas.length){
								bio_niq_color_colorCheck.sustituyeCanvas_disc(bio_niq_color_colorCheck.bio_canvas[0]);
								progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_canvas.length);
							}else if (bio_niq_color_colorCheck.bio_object.length){
								bio_niq_color_colorCheck.sustituyeObject_disc(bio_niq_color_colorCheck.bio_object[0]);
								progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_object.length);
							}else{
								bio_niq_color_colorCheck.delProgress();
							}
						}
						return;
					}
					imagenCanvas.onerror = function(e) {
						if(bio_niq_color_colorCheck.bio_imagenes_f.length){
							var tmpArr = new Array();
							tmpArr = bio_niq_color_colorCheck.bio_imagenes_f.shift();
							bio_niq_color_colorCheck.sustituyeImg_disc(bio_niq_color_colorCheck.bio_imagenes_f[0]);					

						}
						progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_imagenes_f.length);
						if(bio_niq_color_colorCheck.bio_imagenes_f.length == 1){
							if (bio_niq_color_colorCheck.bio_canvas.length){
								bio_niq_color_colorCheck.sustituyeCanvas_disc(bio_niq_color_colorCheck.bio_canvas[0]);
								progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_canvas.length);
							}else if (bio_niq_color_colorCheck.bio_object.length){
								bio_niq_color_colorCheck.sustituyeObject_disc(bio_niq_color_colorCheck.bio_object[0]);
								progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_object.length);
							}else{
								bio_niq_color_colorCheck.delProgress();
							}
						}
					}
					if(bio_niq_color_colorCheck.bio_imagenes_f.length == 0 && bio_niq_color_colorCheck.bio_canvas.length == 0 && bio_niq_color_colorCheck.bio_object.length == 0){
						bio_niq_color_colorCheck.delProgress();
					}
				}
			} catch (e) {
				if(bio_niq_color_colorCheck.bio_imagenes_f.length){
					var tmpArr = new Array();
					tmpArr = bio_niq_color_colorCheck.bio_imagenes_f.shift();
					bio_niq_color_colorCheck.sustituyeImg_disc(bio_niq_color_colorCheck.bio_imagenes_f[0]);					

				}
				progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_imagenes_f.length);
				if(bio_niq_color_colorCheck.bio_imagenes_f.length == 1 || progress.getAttribute('value') == progress.getAttribute('max')){
					if (bio_niq_color_colorCheck.bio_canvas.length){
						bio_niq_color_colorCheck.sustituyeCanvas_disc(bio_niq_color_colorCheck.bio_canvas[0]);
						progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_canvas.length);
					}else if (bio_niq_color_colorCheck.bio_object.length){
						bio_niq_color_colorCheck.sustituyeObject_disc(bio_niq_color_colorCheck.bio_object[0]);
						progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_object.length);
					}else{
						bio_niq_color_colorCheck.delProgress();
					}
				}
			}
			if(bio_niq_color_colorCheck.bio_imagenes_f.length == 0 && bio_niq_color_colorCheck.bio_canvas.length == 0 && bio_niq_color_colorCheck.bio_object.length == 0){
				bio_niq_color_colorCheck.delProgress();
			}
	},
	sustituyeCanvas_disc: function(elArr){
		var progress = bio_niq_color_colorCheck.sample_prog.getElementsByTagName('progress')[0];
		try{

			var elem_des = elArr[0];
			var tipo = elArr[1];

						//var canvas = bio_niq_color_colorCheck.getRoot(elem_des).cloneNode(true);
						if(elem_des.tagName.toLowerCase() == 'canvas'){
							var canvas = elem_des;
							var ctx = canvas.getContext("2d");
						}else{

							var canvas = document.createElementNS("http://www.w3.org/1999/xhtml","canvas");
							var ctx = canvas.getContext("2d");

							var w = elem_des.clientWidth;
							var h = elem_des.clientHeight;
							canvas.width = w;
							canvas.height = h;
							ctx.drawImage(elem_des, 0, 0, w, h);

						}

						var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
						var pixelData = pixels.data;
						
						for (var i = 0; i < pixelData.length; i+=4) { 
							var rr = pixelData[i+0];
							var gg = pixelData[i+1];
							var bb = pixelData[i+2];
							var tt = pixelData[i+3];

							var n =	bio_niq_color_colorCheck.calDefRev(rr + ',' + gg + ',' + bb,tipo).split(',');

							pixelData[parseInt(i+0)]=n[0];
							pixelData[parseInt(i+1)]=n[1];
							pixelData[parseInt(i+2)]=n[2];
							pixelData[parseInt(i+3)]=tt;
							
						}
							
						pixels.data = pixelData;

						var canvasTmp = document.createElementNS("http://www.w3.org/1999/xhtml","canvas");
						canvasTmp.setAttribute("height", canvas.height);
						canvasTmp.setAttribute("width", canvas.width);
						canvasTmp.setAttribute("class", 'bio_canvas_disc');
						var ctxTmp = canvasTmp.getContext("2d");
						var pixelsTmp = ctxTmp.getImageData(0, 0, canvasTmp.width, canvasTmp.height);
						var pixelDataTmp = pixelData;

						ctxTmp.putImageData(pixels, 0, 0);

						elem_des.parentNode.insertBefore(canvasTmp,elem_des);
						if(elem_des.getAttribute('class'))
							elem_des.setAttribute('class',elem_des.getAttribute('class') + ' bio_canvas');
						else
							elem_des.setAttribute('class','bio_canvas');
						
						if(bio_niq_color_colorCheck.bio_canvas.length == 0)
							bio_niq_color_colorCheck.delProgress();
						if(i  == pixelData.length && bio_niq_color_colorCheck.bio_canvas.length){
							var tmpArr = new Array();
							tmpArr = bio_niq_color_colorCheck.bio_canvas.shift();
							if(bio_niq_color_colorCheck.bio_canvas.length)
								bio_niq_color_colorCheck.sustituyeCanvas_disc(bio_niq_color_colorCheck.bio_canvas[0]);					

						}
						progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_canvas.length);
						if(bio_niq_color_colorCheck.bio_canvas.length == 1 || progress.getAttribute('value') == progress.getAttribute('max')){
							if (bio_niq_color_colorCheck.bio_object.length){
								bio_niq_color_colorCheck.sustituyeObject_disc(bio_niq_color_colorCheck.bio_object[0]);
								progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_object.length);
							}else{
								bio_niq_color_colorCheck.delProgress();
							}
						}
						return;

			} catch (e) {
				if(bio_niq_color_colorCheck.bio_canvas.length){
					var tmpArr = new Array();
					tmpArr = bio_niq_color_colorCheck.bio_canvas.shift();
					if(bio_niq_color_colorCheck.bio_canvas.length)
						bio_niq_color_colorCheck.sustituyeCanvas_disc(bio_niq_color_colorCheck.bio_canvas[0]);					

				}
				progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_canvas.length);
				if(bio_niq_color_colorCheck.bio_canvas.length == 1 || progress.getAttribute('value') == progress.getAttribute('max')){
					if (bio_niq_color_colorCheck.bio_object.length){
						bio_niq_color_colorCheck.sustituyeObject_disc(bio_niq_color_colorCheck.bio_object[0]);
						progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_object.length);
					}else{
						bio_niq_color_colorCheck.delProgress();
					}
				}
			}
	},
	sustituyeObject_disc: function(elArr){
		var progress = bio_niq_color_colorCheck.sample_prog.getElementsByTagName('progress')[0];
		var elem_des = elArr[0];
		var elem_att = elArr[1];
		var tipo = elArr[2];
		
		var documentos = bio_documents_colorCheck.documents();
		
		var dom = bio_niq_color_colorCheck.getRoot(elem_des);
		
		var srcT = dom.location.toString();
		try{
			var canvas = document.createElementNS("http://www.w3.org/1999/xhtml","canvas");
			var remoteWindow = dom.defaultView.content;
			var mainWindow = dom.defaultView.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						   .getInterface(Components.interfaces.nsIWebNavigation)
						   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
						   .rootTreeItem
						   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						   .getInterface(Components.interfaces.nsIDOMWindow);					   
						   
		
			var selectedBrowDoc = dom.defaultView.document;
			var body = selectedBrowDoc.getElementsByTagName('body')[0];
			if(dom.defaultView.innerWidth > body.scrollWidth)
				var Wwidth = dom.defaultView.innerWidth;
			else
				var Wwidth = body.scrollWidth;

		var Wheight = body.scrollHeight;
		var escala = 1;
		canvas.style.width = Wwidth/escala+"px";
		canvas.style.height = Wheight/escala+"px";
		canvas.style.margin = '10px 10px 5px';
		canvas.style.border = '1px solid #666';
		canvas.width = Wwidth/escala;
		canvas.height = Wheight/escala;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0,Wwidth,Wheight);
		ctx.save();
		ctx.scale(1/escala,1/escala);
		ctx.drawWindow(remoteWindow,0, 0, Wwidth, Wheight,"rgb(0,0,0)");
		ctx.restore();
		var strDataURI = canvas.toDataURL("image/png","");
		var strDownloadMime = "image/octet-stream";
		document.location.href = strDataURI.replace("image/png", strDownloadMime);
		return


				
			var Wheight = body.scrollHeight;
			var ctx = canvas.getContext("2d");
			canvas.width = Wwidth;
			canvas.height = Wheight;
			ctx.clearRect(0, 0,Wwidth,Wheight);
			ctx.save();
			ctx.scale(1,1);
			var elem_desBox = elem_des.getBoundingClientRect();
			var canwidth = elem_desBox.right-elem_desBox.left;
			var canheight = elem_desBox.bottom-elem_desBox.top;
			ctx.drawWindow(remoteWindow,elem_desBox.left, elem_desBox.top, Wwidth, Wheight,"rgba(0,0,0,0)");
			ctx.restore();
			var strDataURI = canvas.toDataURL("image/png","");
			if(!bio_niq_color_colorCheck.bio_capturas[srcT])
				bio_niq_color_colorCheck.bio_capturas[srcT] = strDataURI;


			var imagenCanvas = new Image();
			imagenCanvas.src = bio_niq_color_colorCheck.bio_capturas[srcT];
			imagenCanvas.onload = function() {
				var canvasTmp = document.createElementNS("http://www.w3.org/1999/xhtml","canvas");
				canvasTmp.setAttribute("height", canheight);
				canvasTmp.setAttribute("width", canwidth);
				canvasTmp.width = canwidth;
				canvasTmp.height = canheight;
				canvasTmp.setAttribute("class", 'bio_canvas_disc');
				var ctxTmp = canvasTmp.getContext("2d");
				ctxTmp.drawImage(imagenCanvas,0, 0, canwidth, canheight,0,0, canwidth, canheight);
				ctxTmp.restore();

				var pixels = ctxTmp.getImageData(0, 0, canvasTmp.width, canvasTmp.height);
				var pixelData = pixels.data;
				pixels.data = pixelData;
				for (var i = 0; i < pixelData.length; i+=4) { 
					var rr = pixelData[i+0];
					var gg = pixelData[i+1];
					var bb = pixelData[i+2];
					var tt = pixelData[i+3];
					var n =	bio_niq_color_colorCheck.calDefRev(rr + ',' + gg + ',' + bb,tipo).split(',');
					pixelData[parseInt(i+0)]=n[0];
					pixelData[parseInt(i+1)]=n[1];
					pixelData[parseInt(i+2)]=n[2];
					pixelData[parseInt(i+3)]=tt;
				}
				pixels.data = pixelData;
				ctxTmp.putImageData(pixels, 0, 0);
				elem_des.parentNode.insertBefore(canvasTmp,elem_des);
			}

			if(elem_des.getAttribute('class'))
				elem_des.setAttribute('class',elem_des.getAttribute('class') + ' bio_canvas');
			else
				elem_des.setAttribute('class','bio_canvas');
			if(bio_niq_color_colorCheck.bio_object.length == 1 || progress.getAttribute('value') == progress.getAttribute('max')){
				bio_niq_color_colorCheck.delProgress();
			}
		} catch (e) {
			if(bio_niq_color_colorCheck.bio_object.length){
				var tmpArr = new Array();
				tmpArr = bio_niq_color_colorCheck.bio_object.shift();
				if(bio_niq_color_colorCheck.bio_object.length)
					bio_niq_color_colorCheck.sustituyeObject_disc(bio_niq_color_colorCheck.bio_object[0]);					
				}
			progress.setAttribute('value',progress.getAttribute('max') - bio_niq_color_colorCheck.bio_object.length);
			
		}
		if(bio_niq_color_colorCheck.bio_object.length <= 1 ||  progress.getAttribute('value') == progress.getAttribute('max')){
			bio_niq_color_colorCheck.delProgress();
		}
	},
	delProgress: function(){
		if(bio_niq_color_colorCheck.sample_prog)
			bio_niq_color_colorCheck.sample_prog.parentNode.removeChild(bio_niq_color_colorCheck.sample_prog);
		bio_niq_color_colorCheck.sample_prog = null;
	},
	sustituyeImg: function(src,elem_des,tipo_des,tipo){
		var imagenCanvas = new Image();
		imagenCanvas.src = src;
		imagenCanvas.onload = function() {
			var canvas = document.createElementNS("http://www.w3.org/1999/xhtml","canvas");
			canvas.setAttribute("height", imagenCanvas.height);
			canvas.setAttribute("width", imagenCanvas.width);
			var ctx = canvas.getContext("2d");
			ctx.drawImage(imagenCanvas, 0, 0);

			var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
			var pixelData = pixels.data;
			
			for (var i = 0; i < pixelData.length; i+=4) { 
				var rr = pixelData[i+0];
				var gg = pixelData[i+1];
				var bb = pixelData[i+2];
				var tt = pixelData[i+3];

				var n =	bio_niq_color_colorCheck.calDefRev(rr + ',' + gg + ',' + bb,tipo).split(',');
				pixelData[parseInt(i+0)]=n[0];
				pixelData[parseInt(i+1)]=n[1];
				pixelData[parseInt(i+2)]=n[2];
				pixelData[parseInt(i+3)]=tt;
			} 
			pixels.data = pixelData;
			ctx.putImageData(pixels, 0, 0);
			var strDataURI = canvas.toDataURL("image/png","");
			if(tipo_des == 'fondo')
				elem_des.style.setProperty('background-image', 'url("' + strDataURI + '")', 'important');
			if(tipo_des == 'primerPlano'){
				elem_des.setAttribute('src', strDataURI);
			}
			return 1;
		}
	},
	addStylesheetRules: function(rules) {
		  var styleEl = document.createElement('style');
		  document.head.appendChild(styleEl);
		  // Apparently some version of Safari needs the following line? I dunno.
		  styleEl.appendChild(document.createTextNode(''));
		  var s = styleEl.sheet;
		  for(var selector in rules) {
			var props = rules[selector];
			var propStr = '';
			for(var propName in props) {
			  var propVal = props[propName];
			  var propImportant = '';
			  if(propVal[1] === true) {
				// propVal is an array of value/important, rather than a string.
				propVal = propVal[0];
				propImportant = ' !important'
			  }
			  propStr += propName + ':' + propVal + propImportant + ';\n';
			}
			s.insertRule(selector + '{' + propStr + '}', s.cssRules.length);
		  }
		},
	colorPicker: function(cl,dest){
		document.getElementById(dest).value = cl;
		bio_niq_color_colorCheck.hexRGB(dest,'rgb_' + dest);
		bio_niq_color_colorCheck.aplicaColor();
	},
	canvasW : null,
	canvasH : null,
	loadCanvas:function(inic){
		var vision_tipo = document.getElementById('vision_tipo').value;
		var imagenCanvas = new Image();
		imagenCanvas.src = 'chrome://colorchecker/content/img/colorwheel_' + vision_tipo  + '.png';
		imagenCanvas.onload = function() {
			var canvas = document.getElementById('canvas_color');
			var rects = canvas.parentNode.parentNode.getClientRects();
			var widthCanvas = 0;
			var heightCanvas = 0;
			var sumCanvasL = 0;
			var sumCanvasT = 0;
			for (var i = 0; i != rects.length; i++) {
				var rect = rects[i];
				widthCanvas += rect.width;
				heightCanvas += rect.height-30;
				sumCanvasL += rect.left;
				sumCanvasT += rect.top;
			}
			if(!bio_niq_color_colorCheck.canvasW){
				bio_niq_color_colorCheck.canvasW = widthCanvas;
				bio_niq_color_colorCheck.canvasH = heightCanvas - sumCanvasT;
			}
			canvas.width = bio_niq_color_colorCheck.canvasW;
			canvas.height = bio_niq_color_colorCheck.canvasH;
			canvas.addEventListener("mousedown", bio_niq_color_colorCheck.getColorFromCanvas, false);
			canvas.addEventListener("mouseup", bio_niq_color_colorCheck.resetgetColorFromCanvas, false);
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0,0,canvas.width,canvas.height);
			ctx.drawImage(imagenCanvas, 0, 0,canvas.width,canvas.height);
			// Record data
			ctx.putImageData(imageData, 0, 0);
			ctx.save();
			ctx.scale(1,1);
		}
	},
	getColorFromCanvas:function(e){
		var posX = e.clientX;
		var posY = e.clientY;
		var canvas = document.getElementById('canvas_color');
		canvas.addEventListener("mousemove", bio_niq_color_colorCheck.getColorFromCanvas, false);
		var rects = canvas.getClientRects();
		var sumL = 0;
		var sumT = 0;
		for (var i = 0; i != rects.length; i++) {
			var rect = rects[i];
			sumL += rect.left;
			sumT += rect.top;
		}
		var ctx = canvas.getContext("2d");
		var IMGcache = ctx.getImageData(posX-sumL, posY-sumT, 1, 1);
		var rgbColor = 'rgb('+IMGcache.data[0]+ ',' + IMGcache.data[1]+ ',' + IMGcache.data[2] +')';
		bio_niq_color_colorCheck.sendColor('rgb('+IMGcache.data[0]+ ',' + IMGcache.data[1]+ ',' + IMGcache.data[2] +')',bio_niq_color_colorCheck.colorWheelDest);
		bio_niq_color_colorCheck.getColorFromPickerStop();
		
	},
	resetgetColorFromCanvas:function(e){
		var canvas = document.getElementById('canvas_color');
		canvas.removeEventListener("mousemove", bio_niq_color_colorCheck.getColorFromCanvas, false);
	}
}
