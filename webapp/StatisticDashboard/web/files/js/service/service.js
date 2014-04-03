/**
 * Created by solomon on 14-4-2.
 */
angular.module('mixpanel.service',[])

.value('apiKey',"1291ff9d8ceb337db6a0069d88079474")
.value('apiSecret',"05b9aae8d5305855b1cdfec0db2db140")

.factory('MixpanelProvider',function(apiKey,apiSecret){

    var mixpanel = function(schema, args, api_secret){

        var sigGenerator = function(args, api_secret){
            args.sort();
            return CryptoJS.MD5(args.join('')+api_secret);
        };

        var sig = sigGenerator(args,api_secret);

        args.push("sig="+sig);

        var apiUrl = schema + "?" + args.join('&');
        return apiUrl;
    };

    return {
        mixpanel: mixpanel,
        apiKey: apiKey,
        apiSecret: apiSecret
    }
});
