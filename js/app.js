var app = angular.module("myApp", ["ui.router", "fx.sharepoint.lists"]).config([
  //Router
  "$stateProvider",
  "$urlRouterProvider",
  function ($stateProvider, $urlRouterProvider, $scope) {
    $urlRouterProvider.otherwise("/home");
    $stateProvider
      .state("home", {
        url: "/home",
        templateUrl: "form/home.html",
        controller: "controller"
      })
      .state("editUser", {
        url: "/editUser/:userID",
        templateUrl: "form/editUser.html",
        controller: "EditCtrl"
      })
      .state("addUser", {
        url: "/addUser",
        templateUrl: "form/add.html",
        controller: "AddCtrl"
      })
      .state("listUser", {
        url: "/listUser",
        templateUrl: "form/listUser.html",
        controller: "ListCtrl"
      });
  }
]);
//Service
angular.module("myApp").factory('UserService', ['$SPList', function ($list) {
  var list = new $list({
    listName: 'Student',
    siteUrl: '/',
    fields: [
      'Id',
      'Title',
      'Name',
      'MSSV',
      { name: 'Age', type: 'String' },
      'Address',
      { name: "Class", type: "lookup", expand: ['Id', "Title"], readonly: true },
      'Photo'
    ]
  });
  return list;
}

]);
angular.module("myApp").factory('ClassService', ['$SPList', function ($list) {
  var list = new $list({
    listName: 'Class',
    siteUrl: '/',
    fields: [
      'Id',
      'Title',
    ]
  });
  return list;
}

]);
// Controller
angular.module("myApp").controller('controller', ['$scope', 'UserService', 'ClassService', '$window', function ($scope, $doc, $classService, $window) {
  //pagination
  var itemLimit = 4;// $top: so luong tra ve tren moi trang , $orderby: loc du lieu 
  $doc.getAll({
    params: {
      $orderby: "Id asc",
      $top: itemLimit,
    }
  }).then(function (result) {
    $scope.names = result;
  });

  $scope.next = function () {
    if ($scope.names.hasNext() == true) { // tra ve boolen true neu con phan tu
      $scope.nextview = "!disabled";
      $scope.names.getNext() // lay phan tu ke tiep
        .then(function (result) {
          $scope.names = result;
        })
    } else {
      $scope.nextview = "disabled";
    }
  };
  $scope.previous = function () {
    if ($scope.names.hasPrevious() == true) { // tra ve boolen
      $scope.preview = "!disabled";
      $scope.names.getPrevious()
        .then(function (result) {
          $scope.names = result;
        })
    }
    else {
      $scope.preview = "disabled";

    }
  };
  //Search
  $scope.searchUser = function () {
    $doc.getAll({
      params: {
        $filter: "substringof('" + $scope.search + "', Name) or MSSV eq '" + $scope.search + "' "
      }
    }).then(function (result) {
      $scope.names = result;

    })
  };
  // Xoa 
  $scope.removeUser = function (user) {
    if (confirm(" Are you sure want to delete " + user.Name + " ?")) {
      $doc.remove(user.ID)
        .then(function () {
          $window.location.reload();
        });
    }
  };
  $scope.refreshSearch = function(){
    $window.location.reload();
  }


}]);
// Edit Controller
app.controller('EditCtrl', ['$scope', 'UserService', 'ClassService', '$stateParams', '$window', '$location', function ($scope, $doc, $classService, $stateParams, $window, $location) {
  var userID = $stateParams.userID;
  $doc.get(userID).then(function (result) {
    $scope.user = result;
  })
  $scope.saveUser = function (user) {
    $classService.save(user.Class).then(function () {

    }).then(function () {
      $doc.save(user).then(function () {
        $location.url("/home");
      })
    })
  };
  // Add Controller 
}])
app.controller('AddCtrl', ['$scope', 'UserService', '$window', '$location', function ($scope, $doc, $window, $location) {
  $scope.addUser = function () {
    var user = $scope.user;
    $doc.save(user).then(function () {
      $location.url("/home");
    });
    $window.alert("Add new successfully!");
  };
}])
// List controller
app.controller('ListCtrl', ['$scope', 'UserService', 'ClassService', function ($scope, $doc) {
  var itemLimit = 5;
  $doc.getAll({
    params: {
      $orderby: "Id asc",
      $top: itemLimit,
    }
  })
    .then(function (result) {
      $scope.names = result;
    });
  $scope.next = function () {
    if ($scope.names.hasNext() == true) { // tra ve boolen true neu con phan tu
      $scope.nextview = "!disabled";
      $scope.names.getNext() // lay phan tu ke tiep
        .then(function (result) {
          $scope.names = result;
        })
    } else {
      $scope.nextview = "disabled";
    }
  };
  $scope.previous = function () {
    if ($scope.names.hasPrevious() == true) { // tra ve boolen
      $scope.preview = "!disabled";
      $scope.names.getPrevious()
        .then(function (result) {
          $scope.names = result;
        })
    }
    else {
      $scope.preview = "disabled";
    }
  };
  // search theo $filter : substringof search voi kieu Strinng 
  $scope.searchUser = function () {

    $doc.getAll({
      params: {
        $filter: "substringof('" + $scope.search + "', Name) or MSSV eq '" + $scope.search + "' "
      }
    }).then(function (result) {
      $scope.names = result;

    })
  };
}])