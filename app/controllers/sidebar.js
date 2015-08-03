app.controller('sidebarController', function($scope, $rootScope) {
	$scope.area = null;

	$rootScope.$on('$stateChangeStart', function(e, newState, newParams, oldState, oldParams) {
		switch (newState.name) {
			case 'servers':
			case 'services':
				$scope.area = newState.name;
				break;
			default:
				$scope.area = null;
		}
	});
});
