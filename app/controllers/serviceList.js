app.controller('serviceListController', function($scope, $location, Notification, Services) {
	$scope.loading = true;
	$scope.services = null;

	// Data refresher {{{
	$scope.refresh = function() {
		var query = {populate: 'server'};
		if ($location.search().server) query.server = $location.search().server;

		Services.query(query).$promise.then(function(data) {
			$scope.services = data;
			$scope.loading = false;
		});
	};
	$scope.refresh();
	// }}}

	// Editing {{{
	$scope.deleteService = function(service) {
		Services.delete({id: service._id}).$promise.then(function() {
			Notification.success('<i class="fa fa-trash"></i> Service <strong>' + service.title + '</strong> has been deleted');
			$scope.refresh();
		});
	};
	// }}}
});
