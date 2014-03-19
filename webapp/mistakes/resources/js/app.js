angular.module('Mistakes', ['Mistakes.services', 'Mistakes.controllers', 'Mistakes.directives', 'ngRoute'])
    .config(function($sceProvider){
        $sceProvider.enabled(false);
    })
    .config(function($routeProvider) {
    	$routeProvider
    	    .when('/', {
    	        controller: 'RootCtrl',
    	        templateUrl: 'resources/partials/home.html',
    	        resolve: {
                         me: function(MaterialProvider) {
                            return MaterialProvider.getMe();
                         },
    	            navigatorMap: function(MaterialProvider) {
    	        	    return MaterialProvider.getNavigatorMap();
    	            },
    	            allUserProblemMap: function(MaterialProvider) {
    	            	    return MaterialProvider.getAllUserProblemMap();
    	            }
    	        }
    	    })
    	    .when('/chapter/:cid/lesson/:lid', {
    	        controller: 'HomeCtrl',
    	        templateUrl: 'resources/partials/home.html',
                     resolve: {
                        me: function(MaterialProvider) {
                            return MaterialProvider.getMe();
                        },
                        navigatorMap: function(MaterialProvider) {
                            return MaterialProvider.getNavigatorMap();
                        },
                        allUserProblemMap: function(MaterialProvider) {
                            return MaterialProvider.getAllUserProblemMap();
                        }
                    }
    	    })   
                 .otherwise({redirectTo: '/'})
    })

