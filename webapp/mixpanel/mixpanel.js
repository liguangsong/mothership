var headID = document.getElementsByTagName("head")[0];
var originApiUri = "../mixpanel/api/mixpanel_api.js";
var mockApiUri = "../mixpanel/api/mock_mixpanel_api.js";
var packageUri = "../mixpanel/package/mixpanel_package.js";

loadScript(loadScript(loadScript(function(){console.log("------------------>Have load all mixpanel files!!!")},originApiUri),mockApiUri),packageUri);

function loadScript(scriptLoaded,uri){
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.onload=scriptLoaded;
    newScript.src = uri;
    headID.appendChild(newScript);
}