var colorCheckerconfig = {
	fntLg : '',
	fntSm : '',
	prefs: null,
	startup: function(){
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.colorchecker.");
		this.prefs.addObserver('', this, false);
		this.fntLg = this.prefs.getIntPref('fntLg');
		this.fntSm = this.prefs.getIntPref('fntSm');
		this.refreshInformation();
	},
	shutdown: function(){
		this.prefs.removeObserver('', this);
	},
	observe: function(subject, topic, data){
		if (topic != 'nsPref:changed'){
			return;
		}
		this.refreshInformation();
	},
	setStyle: function(prop,value){
		bio_niqueladas_colorCheck.loading(1);
		this.prefs.setIntPref(prop, value);
		this.getStyles();
		return true;
	},
	setMode: function(value){
		this.refreshInformation();
		return true;
	},
	getStyles: function(){
		colorCheckerconfig.fntLg = this.prefs.getIntPref('fntLg');
		colorCheckerconfig.fntSm = this.prefs.getIntPref('fntSm');
	},
	refreshInformation: function(){
		colorCheckerconfig.fntLg = this.prefs.getIntPref('fntLg');
		colorCheckerconfig.fntSm = this.prefs.getIntPref('fntSm');
		//bio_niqueladas_colorCheck.jarl();
	},
	actLista: function(){
		document.getElementById('Sm').selectedItem = document.getElementById('s' + this.prefs.getIntPref('fntSm'));
		document.getElementById('Lg').selectedItem = document.getElementById('l' + this.prefs.getIntPref('fntLg'));
	}
}
window.addEventListener('load', function(e) { colorCheckerconfig.startup(); }, false);
window.addEventListener('unload', function(e) { colorCheckerconfig.shutdown(); }, false);
