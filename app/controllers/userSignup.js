app.controller('userSignupController', function($scope, $rootScope, $q, Users, Committees, $timeout) {
	// Loading boolean used for interface loading throbbers
	$scope.isLoading = true;

	// Delegate signup options
	$scope.committees = null;
	$scope.countries = null;
	$scope.refresh = function() {
		$q.all([
			Committees.query({
				status: 'active',
				select: 'code,title,description',
			}).$promise.then(function(data) {
				$scope.committees = data;
			}, function(err) {
				$scope.errors.push({text: 'Could not fetch committee information. please try again later'});
			})
		]).finally(function() {
			// FIXME - Implement countries ng model
			$scope.countries = [];
			$scope.isLoading = false;
		});
	};
	$scope.refresh();

	// .signup {{{
	$scope.signup = null;
	$scope.errors = [];
	$scope.reset = function() {
		$scope.signup = {
			name: '',
			email: '',
			password: '',
			password2: '',
			roaming: false,
			committee: '',
			country: ''
		};
		$scope.errors = [];
	};
	$scope.reset();
	// }}}

	// Validation {{{
	$scope.validate = function() {
		var errors = [];
		if (!$scope.signup.name) errors.push({text: 'Please provide your name'});
		if (!$scope.signup.email) errors.push({text: 'Please provide your email address'});
		if (!$scope.signup.password) errors.push({text: 'Please provide a password'});
		if (!$scope.signup.password2) errors.push({text: 'Please provide a confirmation password'});
		if ($scope.signup.password != $scope.signup.password2) errors.push({text: 'Your passwords do not match'});
		if (!$scope.signup.romaing && !$scope.signup.committee) errors.push({text: 'Please provide a committee to join'});
		if (!$scope.signup.romaing && !$scope.signup.country) errors.push({text: 'Please provide a country to represent'});
		$scope.errors = errors;
	};
	// }}}

	$scope.submit = function() {
		$scope.validate();
		if ($scope.errors && $scope.errors.length) return;
		$scope.signup.username = $scope.signup.email;

		// FIXME - JS - On user signup, document needs to be linked to active event, from which the user signed up from
		Users.signup({}, $scope.signup).$promise
			.then(function(user) {
				$rootScope.$broadcast('preLogin', {
					username: $scope.signup.username,
					password: $scope.signup.password
				});
				$scope.reset();
				$('#modal-signup').modal('hide');
			}, function(err) {
				var errText = err.data ? err.data : err.toString();
				if (/duplicate key error index: .*?username/.test(errText)) {
					$scope.errors.push({text: 'That username is already in use'});
				} else {
					$scope.errors.push({text: 'Unknown error: ' + errText});
				}
			});
	};
});
