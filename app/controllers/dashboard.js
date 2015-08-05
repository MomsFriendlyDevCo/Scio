app.controller('dashboardController', function($scope, $q, $timeout, Plugins, Servers, Services, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.servers = null;
	$scope.serviceCount = null;
	$scope.pluginCount = null;
	$scope.tickCount = null;
	$scope.timeline = null;

	// Charts {{{
	$scope.chartConfig = {
		options: {
			chart: {
				type: 'line',
			},
			legend: {
				enabled: false,
			},
		},

		series: [], // Will be replaced by data via refresh()

		title: {text: false},

		yAxis: {
			title: {text: false},
		},

		xAxis: {
			type: 'datetime',
			title: {text: 'Date'}
		},

		loading: true,
	};

	$scope.donutConfig = {
		options: {
			chart: {
				type: 'pie',
				options3d: {
					enabled: true,
					alpha: 45,
				},
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: false,
						distance: 15,
						format: '<b>{point.name}</b>: {point.percentage:.1f} %',
						style: {
							color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
						}
					},
					innerSize: 50,
					depth: 30,
				},
			},
			tooltip: {
				formatter: function() {
					return '<strong>' + this.point.name + '</strong><br/>' + this.point.y;
				},
			},
		},
		title: {text: false},
		series: [{
			data: [] // Populated on refresh()
		}]
	};
	// }}}
	
	// Data refresher {{{
	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);
		$scope.loadingSilent = true;
		$q.all([
			Servers.query({enabled: true}).$promise
				.then(function(data) {
					$scope.servers = data
					// Calculate donut chart data {{{
					var donutStatus = [];
					_.forEach(Settings.statuses, function(status, id) {
						var matchingServers = _.filter($scope.servers, {status: id});
						donutStatus.push({
							name: status.label,
							y: matchingServers ? matchingServers.length : 0,
							color: status.color,
						});
					});
					$scope.donutConfig.series[0].data = donutStatus;
					// }}}
				}),
			Servers.chartAll().$promise
				.then(function(data) {
					$scope.chartConfig.loading =false;
					$scope.chartConfig.series = data.series
						.map(function(series) {
							series.data = series.data.map(function(item) {
								if (Settings.statuses[item[1]])
									item[1] = Settings.statuses[item[1]].value;
								return item;
							});
							return series;
						});
				}),
			Servers.timeline().$promise
				.then(function(data) {
					$scope.timeline = data
						// Decorators {{{
						.map(function(tick) {
							// Populate server from ref {{{
							tick.server = _.find($scope.servers, {ref: tick.serverRef});
							// }}}
							return tick;
						})
						// }}}
				}),
			Services.count().$promise
				.then(function(data) {
					$scope.serviceCount = data.count;
				}),
			Plugins.count().$promise
				.then(function(data) {
					$scope.pluginCount = data.count;
				}),
			Services.tickCount({since: '-1 day'}).$promise
				.then(function(data) {
					$scope.tickCount = data.count;
				}),
		]).finally(function() {
			$scope.loading = false;
			$scope.loadingSilent = false;
			$scope.lastRefresh = moment().format('D/MM/YYYY HH:mm:ss');
			if (Settings.poll.dashboard)
				$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.dashboard);
		});
	};
	$scope.refresh();
	// }}}
});
