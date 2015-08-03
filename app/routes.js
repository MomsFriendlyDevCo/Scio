app.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider
		.otherwise('/');

	$stateProvider
		.state('home', {
			url: '/',
			views: {main: {templateUrl: '/partials/dashboard.html'}}
		})
		// Servers {{{
		.state('servers', {
			url: '/servers',
			views: {main: {templateUrl: '/partials/servers/list.html'}}
		})
		.state('servers-view', {
			url: '/servers/:id',
			views: {main: {templateUrl: '/partials/servers/view.html'}}
		})
		// }}}
		// Services {{{
		.state('services', {
			url: '/services',
			views: {main: {templateUrl: '/partials/services/list.html'}}
		})
		// }}}
});
