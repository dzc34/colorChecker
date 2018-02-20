const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;
var tabListenerNiq = {
	QueryInterface: function(aIID) {
		if (aIID.equals(Components.interfaces.nsIWebProgressListener) || aIID.equals(Components.interfaces.nsISupportsWeakReference) || aIID.equals(Components.interfaces.nsISupports))
			return this;
		throw Components.results.NS_NOINTERFACE;
	},
	onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus, aDownload){
		return 0;
	},
	onLocationChange: function(aProgress, aRequest, aURI){
		return 0;
	},
	onProgressChange: function(aWebProgress,aRequest,aCurSelfProgress,aMaxSelfProgress,aCurTotalProgress,aMaxTotalProgress) {
		return 0;
	},
 	onStatusChange: function(aWebProgress,aRequest,aStatus,aMessage) {return 0;},
	onSecurityChange: function() {return 0;},
	onLinkIconAvailable: function() {return 0;},
}
