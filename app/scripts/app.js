/* exported VnAppRouteProvider */

angular.module('Volusion.templates', []);
angular.module('Volusion.services', []);
angular.module('Volusion.controllers', []);

angular.module('methodApp', [
	'ngAnimate',
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ngTouch',

	// Third party modules
	'ui.bootstrap',
	'pascalprecht.translate',
	'snap',
	'textAngular',
	'ui.router',

	// Volusion modules
	'config',
	'seo',
	'angulartics',
	'Volusion.toolboxCommon',
	'Volusion.controllers',
	'Volusion.services'
])

  .config(['$routeProvider', '$locationProvider', 'translateProvider', 'vnAppConfigProvider', 'vnDataEndpointProvider', 'ENV',
	  function ($routeProvider, $locationProvider, translateProvider, vnAppConfigProvider, vnDataEndpointProvider, ENV) {

		  'use strict';

		  $locationProvider.html5Mode(true);

		  vnAppConfigProvider.setApiPath(ENV.host, ENV.apiEndpoint);
		  vnDataEndpointProvider.setApiUrl(vnAppConfigProvider.getApiPath());

		  var translateOptions = {
			  urlPrefix          : vnAppConfigProvider.getPrefix(),
			  region             : vnAppConfigProvider.getRegion(),
			  lang               : vnAppConfigProvider.getLang(),
			  country            : vnAppConfigProvider.getCountry(),
			  disableTranslations: vnAppConfigProvider.getTranslations()
		  };

		  translateProvider.configure(translateOptions);


		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'views/home.html',
				controller : 'HomeCtrl',
				resolve    : {
					translations: ['translate', function (translate) {
						translate.addParts('home');
						translate.addParts('product');
					}]
				}
			})
			.state('login', {
				url: '/login',
				templateUrl: 'login/login.html',
				controller : 'LoginCtrl'
			})
			.state('checkout', {
				url: 'checkout',
				templateUrl: 'checkout/checkout.html',
				controller : 'CheckoutCtrl'
			})
			.state('thank-you', {
				url: '/thank-you',
				templateUrl: 'thank-you/thank-you.html',
				controller : 'ThankYouCtrl'
			})
			.state('product', {
				url: '/p/:slug',
				templateUrl: 'views/product.html',
				controller : 'ProductCtrl',
				resolve    : {
					translations: ['translate', function (translate) {
						return translate.addParts('product');
					}]
				}
			})
			.state('category', {
				url: '/c/:slug',
				templateUrl   : 'views/category.html',
				controller    : 'CategoryCtrl',
				resolve       : {
					params      : ['vnAppRoute', '$location', function (vnAppRoute, $location) {
						return vnAppRoute.resolveParams($location.search());
					}],
					translations: ['translate', function (translate) {
						translate.addParts('product');
					}]
				}
			})
			.state('search', {
				url: '/search',
				templateUrl   : 'views/search.html',
				controller    : 'SearchCtrl',
				reloadOnSearch: false,
				resolve       : {
					params      : ['vnAppRoute', '$location', function (vnAppRoute, $location) {
						return vnAppRoute.resolveParams($location.search());
					}],
					translations: ['translate', function (translate) {
						translate.addParts('product');
					}]
				}
			})
			.state('allProducts', {
				url: '/all-products',
				templateUrl   : 'views/search.html',
				controller    : 'SearchCtrl',
				reloadOnSearch: false,
				resolve       : {
					params      : ['vnAppRoute', '$location', function (vnAppRoute, $location) {
						return vnAppRoute.resolveParams($location.search());
					}],
					translations: ['translate', function (translate) {
						translate.addParts('product');
					}]
				}
			})
			.state('themeSettings', {
				url: '/theme-settings',
				templateUrl: 'views/theme-settings.html',
				controller : 'ThemeSettingsCtrl'
			})
			.state('article', { // Articles must be last or the prior /search and /theme-settings will never be picked up
				url: '/:slug',
				templateUrl: 'views/article.html',
				controller : 'PageCtrl',
                resolve: {
                    article: ['vnApi', '$route', function (vnApi, $route) {
                        return vnApi.Article().get({slug: $route.current.params.slug}).$promise;
                    }]
                }
			});

			function getCartState(){
				return {
					url: '/cart',
					onEnter: ['$rootScope', function($rootScope) {
						$rootScope.openCart();
				    }],
				    onExit: ['$rootScope', function($rootScope) {
						$rootScope.closeCart();
				    }]
				};
			}

			//Register cart states for all pages
			$stateProvider
				.state('home.cart', getCartState())
				.state('product.cart', getCartState())
				.state('category.cart', getCartState())
				.state('search.cart', getCartState())
				.state('allProducts.cart', getCartState())
				.state('themeSettings.cart', getCartState())
				.state('article.cart', getCartState());
			
	}])

.run(['snapRemote', '$rootScope', '$window', 'themeSettings', 'vnCart', 'translate', 'vnModalService', 'vnViewPortWatch', '$state',
	function (snapRemote, $rootScope, $window, themeSettings, vnCart, translate, vnModalService, vnViewPortWatch, $state) {

		'use strict';

		$rootScope.defaultProductImage = '/images/theme/tcp-no-image.jpg';

		vnCart.init();

		translate.addParts('message');

		vnViewPortWatch.setBreakpoints([{
			name      : 'Non-Desktop',
			mediaQuery: 'screen and (max-width: 991px)',
			onMatch   : function () {
				$rootScope.isInDesktopMode = false;
			},
			onUnmatch : function () {
				snapRemote.close();
				$rootScope.isInDesktopMode = true;
			}
		}]);

		$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
			if(toState.name !== 'category.cart'){
				snapRemote.close();
			}
		});

		$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
			$rootScope.currentState = toState.name;
		});

		$rootScope.$on('VN_HTTP_500_ERROR', function () {
			vnModalService.showError('views/server-error.html');
		});
}]);
