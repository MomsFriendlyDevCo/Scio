app.controller('mapController', function($scope, $timeout, Servers, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.map = null;

	// Data refresher {{{
	$scope.treeWalker = function(node) {
		if (!node.name)
			node.name = node.address || 'Untitled';
		if (node.children)
			node.children = node.children.map($scope.treeWalker);
		return node;
	};

	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);
		$scope.loadingSilent = true;
		Servers.tree().$promise
			.then(function(data) {
				$scope.map = data.map($scope.treeWalker);
			})
			.finally(function() {
				$scope.loading = false;
				$scope.loadingSilent = false;
				$scope.lastRefresh = moment().format('D/MM/YYYY HH:mm:ss');
				if (Settings.poll.map)
					$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.map);
			});
	};
	$scope.refresh();
	// }}}
});
