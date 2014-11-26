blossom.controller('footerCtrl', ['$scope', function($scope){

    var date = new Date();
    $scope.year = date.getFullYear();

}]);