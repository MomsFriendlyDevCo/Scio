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
		.state('services-view', {
			url: '/services/:id',
			views: {main: {templateUrl: '/partials/services/view.html'}}
		})
		// }}}
		// Users {{{
		.state('login', {
			url: '/login',
			views: {main: {templateUrl: '/partials/users/login.html'}}
		})
		.state('logout', {
			url: '/logout',
			views: {main: {templateUrl: '/partials/users/logout.html'}}
		})
		.state('signup', {
			url: '/signup',
			views: {main: {templateUrl: '/partials/users/signup.html'}}
		})
		// }}}
});
