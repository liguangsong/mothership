/**
 * Created by solomon on 14-2-25.
 */

/*\
 |*|
 |*|  :: cookies.js ::
 |*|
 |*|  A complete cookies reader/writer framework with full unicode support.
 |*|
 |*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
 |*|
 |*|  This framework is released under the GNU Public License, version 3 or later.
 |*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
 |*|
 |*|  Syntaxes:
 |*|
 |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
 |*|  * docCookies.getItem(name)
 |*|  * docCookies.removeItem(name[, path], domain)
 |*|  * docCookies.hasItem(name)
 |*|  * docCookies.keys()
 |*|
 \*/

var docCookies = {
    getItem: function (sKey) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!sKey || !this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: /* optional method: you can safely remove it! */ function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }
};

var token;
var userId;
var superProperties = {};
var cookieSchema = "MixpanelSP";

/**
 * Cookie内容严格按照 key1:value1|key2:value2|key3:value3| 的格式来存储
 */
function getSP(){
    var sp = {};

    if (document.cookie.length>0 && docCookies.hasItem(cookieSchema)){

        var cookieContent = docCookies.getItem(cookieSchema);
        console.log("------------->"+cookieContent);

        var previousIndex = 0;
        do{
            var cusorIndex = cookieContent.indexOf("|",previousIndex);
            var property = cookieContent.substring(previousIndex,cusorIndex);
            var propertyName = property.substring(0,property.indexOf(":"));
            var propertyValue = property.substring(property.indexOf(":")+1,property.lastIndex);
            sp[propertyName] = propertyValue;
            previousIndex = cusorIndex+1;
        }while(cookieContent.indexOf("|",previousIndex)>-1)
        console.log("currentSP ==> " + JSON.stringify(sp))
    }else{
        console.log("there's no super properties now");
    }
    return sp;
}

function saveCookie(){
    console.log("-------------->Saving Cookie<----------------");
    var spStrings = "";
    if(JSON.stringify(superProperties)!='{}'){
        for (var key in superProperties){
            spStrings += key + ":" + superProperties[key] + "|";
        }
        docCookies.setItem(cookieSchema, spStrings, undefined, "/");
    }else{
        console.log("sp is empty");
        docCookies.removeItem(cookieSchema);
    }
}

function generateMixpanelJson(eventName, properties){
    var map_header = {
        "distinct_id": userId,
        //"ip":"192.168.3.100",
        "token": token,
        "time": new Date().getTime()
    };

    // add super properties to properties to be tracked.
    var map_all_properties = {};
    if(properties!=undefined){
        for(var key in properties){
            map_all_properties[key] = properties[key];
        }
    }

    var sp = getSP();
    if(JSON.stringify(sp)!='{}'){
        for (var key in sp){
            map_all_properties[key] = sp[key];
        }
    }

    var map_data = {
        "event": eventName,
        "properties": map_all_properties
    };

    var mixpanelJson = {"headers": map_header, "data": map_data};

    console.log(eventName+"-=-=-=-=-=-=> "+JSON.stringify(mixpanelJson));

    return mixpanelJson;
}

var offline_mixpanel = {

    setMixpanelTokenAndUserId: function(mixpanelToken,id){
        token = mixpanelToken;
        userId = id;
    },

    track: function(eventName, properties){
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            url: "/tracks",
            data: JSON.stringify(generateMixpanelJson(eventName,properties)),
            success: function(data, textStatus, jqXHR) {
                //console.log("Post "+'\"'+eventName+'\"'+"==>" + JSON.stringify(data));
            },
            dataType: "json",
            complete: function(jqXHR,textStatus){
                //console.log("post result ==> " + textStatus);
            }
        });
    },

    register: function(properties){
        superProperties = getSP();
        for (var key in properties){
            superProperties[key] = properties[key];
        }
        //console.log("after registerSP ==>" + JSON.stringify(superProperties));
        saveCookie();
    },

    unregister: function(property){
        superProperties = getSP();
        if(JSON.stringify(superProperties)!='{}'){
            for(var key in superProperties){
                if(property == key){
                    delete superProperties[key];
                }
            }
        }
        saveCookie();
    }
} 