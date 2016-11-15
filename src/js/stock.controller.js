angular.module('StockApp', ['angularCharts', 'ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
                $routeProvider
                        // Home
                        .when("/", {controller: "stockController"
                        })
                        .otherwise({redirectTo: '/'})
            }])

        .controller('stockController', ["$scope", "socketService", "$http", "$rootScope", function ( $scope, socketService, $http, $rootScope) {


                $rootScope.mypageloading = false;
                $scope.sortEntity = '';
                $scope.filter;
                $scope.error = '';
                var TIME_DOWN = 0,
                        TIME_UP = 1,
                        CLOSE_DOWN = 2,
                        CLOSE_UP = 3;


                //Socket Connection
                socketService.init();

                $rootScope.$on("WATCH_ERROR_UPDATED", function () {
                    var data = socketService.SocketData.io_watch.error;
                    if (0 !== data)
                    {
                        $scope.error = data;
                    }
                });

                $rootScope.$on("WATCH_DATA_UPDATED", function () {
                    $scope.error = '';
                    var data = socketService.SocketData.io_watch.data;
                    if (0 !== data)
                    {
                        var stockData = data.split(',');
                        var dateinms = new Date(Number(stockData[0]));
                        var date = dateinms.toLocaleDateString();
                        var chartObejct = {
                            x: stockData[0],
                            y: [Number(stockData[4])],
                            tooltip: "this is tooltip",
                            date: date,
                            open: stockData[1],
                            high: stockData[2],
                            low: stockData[3],
                            close: stockData[4],
                            volume: stockData[5]
                        };
                        $scope.data.data.push(chartObejct);
                        console.log('old $scope.newStockTime = ' + $scope.newStockTime);
                        
                        $scope.newStockTime = Number(chartObejct.x);
                        {
                            console.log('$scope.newStockTime = ' + $scope.newStockTime);
                        }
                        $scope.$apply();

                        
                    }
                });

                //Chart functions
                $scope.config = {
                    title: '',
                    tooltips: true,
                    labels: false,
                    mouseover: function () {
                    },
                    mouseout: function () {
                    },
                    click: function () {
                    },
                    legend: {
                        display: false,
                        //could be 'left, right'
                        position: 'right'
                    }
                };

                $scope.data = {
                    series: ['Price', 'Year'],
                    data: []
                };


                //Historical Data Starts
                $scope.getHistory = function () {
                    $rootScope.mypageloading = true;
                    $http.get($rootScope.serverUrl + '/api/historical').then(successCallback, errorCallback);
                };
                function successCallback(response) {
                    $rootScope.mypageloading = false;
                    $scope.error = '';
                    var stockData = response.data;
                    if (stockData.length > 10)
                    {


//                        $scope.$apply();
                    }
                    angular.forEach(stockData, function (object) {
                        var array = object.split(',');
                        var dateinms = new Date(Number(array[0]));
                        var date = dateinms.toLocaleDateString();
                        var chartObejct = {
                            x: Number(array[0]),
                            y: [Number(array[4])],
                            tooltip: Number(array[4]),
                            date: date,
                            open: Number(array[1]),
                            high: Number(array[2]),
                            low: Number(array[3]),
                            close: Number(array[4]),
                            volume: array[5]
                        }
                        $scope.data.data.push(chartObejct);
                    });
                }
                function errorCallback(response) {
                    $rootScope.mypageloading = false;
                    $scope.error = response;
                }
                //Historical Data Ends

                //Sorting function
                $scope.changeFilter = function (to) {
                    $scope.filter = to;
                };
                $scope.getFilter = function () {
                    switch ($scope.filter) {
                        case TIME_DOWN:
                            $scope.sortEntity = 'Time (Down)';
                            return '-x';
                        case TIME_UP:
                            $scope.sortEntity = 'Time (Up)';
                            return 'x';
                        case CLOSE_DOWN:
                            $scope.sortEntity = 'Close (Down)';
                            return '-close';
                        case CLOSE_UP:
                            $scope.sortEntity = 'Close (Up)';
                            return 'close';
                    }
                };


                //Subscribe - Unsubscribe functions starts
                $scope.sub = function () {
                    socketService.sub();


                };
                $scope.unsub = function () {
                    socketService.unsub();
                };
                //Subscribe - Unsubscribe functions Ends
            }])

        .directive('myPageLoader', function () {
            return {
                template: '<img id="loadingif"  src="src/img/page-loader.gif" />'
            };
        })

        .service("socketService", ["$rootScope", function ($rootScope) {

                $rootScope.serverUrl = "http://kaboom.rksv.net";

                function connect(socket) {
                    socket.on("connect", function () {
                        SocketData.io_watch = {}
                    }), socket.on("error", function (n) {
                        SocketData.io_watch.error = n, $rootScope.$broadcast("WATCH_ERROR_UPDATED")
                    }), socket.on("data", function (n, i) {
                        i(success), SocketData.io_watch.data = n, $rootScope.$broadcast("WATCH_DATA_UPDATED")
                    })
                }

                function subSocket() {
                    socket.emit("sub", {
                        state: !0
                    })
                }

                function unsubSocket() {
                    socket.emit("unsub", {
                        state: !1
                    })
                }

                var socket, success = 1,
                        SocketData = {},
                        initSocket = function () {
                            socket = io($rootScope.serverUrl + "/watch");
                            connect(socket);
                        };
                return {
                    SocketData: SocketData,
                    init: function () {
                        return initSocket()
                    },
                    sub: function () {
                        return subSocket()
                    },
                    unsub: function () {
                        return unsubSocket()
                    }
                }
            }]);


 