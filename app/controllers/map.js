app.controller('mapController', function($scope, $timeout, Servers, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.map = null;

	// Data refresher {{{
	$scope.treeWalker = function(node) {
		var newNode = {
			name: node.name || node.address || 'Untitled',
			size: _.random(1, 9999),
		};

		if (node.children)
			newNode.children = node.children.map($scope.treeWalker);

		return newNode;
	};

	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);
		$scope.loadingSilent = true;
		Servers.tree().$promise
			.then(function(data) {
				$scope.map = {
					name: 'Root',
					children: data.map($scope.treeWalker),
				};
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
