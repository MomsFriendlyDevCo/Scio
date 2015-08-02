// App global controller (also $rootScope)
app.controller('globalController', function($scope, $rootScope, Users) {
	// .user {{{
	$scope.user = null;
	Users.profile().$promise.then(function(data) {
		$scope.user = data;
	});
	// }}}

	// Nav {{{
	$scope.toggleSidenav = function(value) {
		if (value === undefined) { // Toggle
			$('#sidebar').toggleClass('toggled');
			$('#menu-trigger').toggleClass('open');
		} else if (value) { // Force visible
			if ($('#sidebar').hasClass('toggled')) return;
			$('#sidebar').addClass('toggled');
			$('#menu-trigger').addClass('open');
		} else { // Force hide
			if (!$('#sidebar').hasClass('toggled')) return;
			$('#sidebar').removeClass('toggled');
			$('#menu-trigger').removeClass('open');
		}
	};
	// }}}

	// FIX: Close sidebar on navigate {{{
	$rootScope.$on('$stateChangeSuccess', e => {
		$scope.toggleSidenav(false);
	});
	// }}}
});
