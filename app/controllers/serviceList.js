app.controller('serviceListController', function($scope, Notification, Services) {
	$scope.loading = true;
	$scope.services = null;

	// Data refresher {{{
	$scope.refresh = function() {
		Services.query({populate: 'server'}).$promise.then(function(data) {
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
