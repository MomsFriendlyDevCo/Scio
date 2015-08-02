app.controller('serverListController', function($scope, Notification, Servers) {
	$scope.loading = true;
	$scope.servers = null;

	// Data refresher {{{
	$scope.refresh = function() {
		Servers.query().$promise.then(function(data) {
			$scope.servers = data;
			$scope.loading = false;
		});
	};
	$scope.refresh();
	// }}}

	// Editing {{{
	$scope.deleteServer = function(server) {
		Servers.delete({id: server._id}).$promise.then(function() {
			Notification.success('<i class="fa fa-trash"></i> Server <strong>' + server.title + '</strong> has been deleted');
			$scope.refresh();
		});
	};
	// }}}
});
