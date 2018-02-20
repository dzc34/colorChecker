var bio_documents_colorCheck = {
	contents:function(act,previos) {
		var documentos = new Array();
		if(previos)
			documentos = previos;
		if (!act) {
			documentos.push(window.content);
			act = window.content;
		}
		if(act.document.getElementsByTagName('frame').length){
			for(var i = 0; i < act.document.getElementsByTagName('frame').length; i++){
				if(!act.frames[i].document.getElementsByTagName('frame').length)
					documentos.push(act.frames[i]);
				if(act.frames[i].document.getElementsByTagName('frame').length || act.frames[i].document.getElementsByTagName('iframe').length)
					bio_documents_colorCheck.contents(act.frames[i],documentos);
			}
		}else {
			if(act.document.getElementsByTagName('iframe').length){
				for(var i = 0; i < act.document.getElementsByTagName('iframe').length; i++){
					if(act.document.getElementsByTagName('iframe')[i].getAttribute('class') != 'niq_valid')
						documentos.push(act.frames[i]);
					if(act.frames[i].document.getElementsByTagName('frame').length || act.frames[i].document.getElementsByTagName('iframe').length)
						bio_documents_colorCheck.contents(act.frames[i],documentos);
				}
			}
		}
		return documentos;
	},
	documents:function(act,previos) {
		var documentos = new Array();
		if(previos)
			documentos = previos;
		if (!act) {
			documentos.push(window.content.document);
			act = window.content;
		}
		if(act.document.getElementsByTagName('frame').length){
			for(var i = 0; i < act.document.getElementsByTagName('frame').length; i++){
				if(!act.frames[i].document.getElementsByTagName('frame').length)
					documentos.push(act.frames[i].document);
				if(act.frames[i].document.getElementsByTagName('frame').length || act.frames[i].document.getElementsByTagName('iframe').length)
					bio_documents_colorCheck.documents(act.frames[i],documentos);
			}
		}else {
			if(act.document.getElementsByTagName('iframe').length){
				for(var i = 0; i < act.document.getElementsByTagName('iframe').length; i++){
					if(act.document.getElementsByTagName('iframe')[i].getAttribute('class') != 'niq_valid')
						documentos.push(act.frames[i].document);
					if(act.frames[i].document.getElementsByTagName('frame').length || act.frames[i].document.getElementsByTagName('iframe').length)
						bio_documents_colorCheck.documents(act.frames[i],documentos);
				}
			}
		}
		return documentos;
	},
	tipodocuments:function(act,previos) {
		var tipodocumentos = new Array();
		if(previos) tipodocumentos = previos;
		if (!act) {
			tipodocumentos.push('Principal');
			act = window.content;
		}
		if(act.document.getElementsByTagName('frame').length){
			for(var i = 0; i < act.document.getElementsByTagName('frame').length; i++){
				if(!act.frames[i].document.getElementsByTagName('frame').length)
					tipodocumentos.push('Frame');
				if(act.frames[i].document.getElementsByTagName('frame').length || act.frames[i].document.getElementsByTagName('iframe').length)
					bio_documents_colorCheck.tipodocuments(act.frames[i],tipodocumentos);
			}
		}else {
			if(act.document.getElementsByTagName('iframe').length){
				for(var i = 0; i < act.document.getElementsByTagName('iframe').length; i++){
					if(act.document.getElementsByTagName('iframe')[i].getAttribute('class') != 'niq_valid')
						tipodocumentos.push('Iframe');
					if(act.frames[i].document.getElementsByTagName('frame').length || act.frames[i].document.getElementsByTagName('iframe').length)
						bio_documents_colorCheck.tipodocuments(act.frames[i],tipodocumentos);
				}
			}
		}
		return tipodocumentos;
	}
}
