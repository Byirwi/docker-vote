var app = angular.module('catsvsdogs', []);
var socket = io.connect({transports:['polling']});

var bg1 = document.getElementById('background-stats-1');
var bg2 = document.getElementById('background-stats-2');

app.controller('statsCtrl', function($scope){
  $scope.aPercent = 0;
  $scope.bPercent = 0;
  $scope.total = 0;
  $scope.updateCount = 0;
  $scope.lastUpdate = "Never";
  $scope.connectionState = "connecting";

  var hasScoreListener = false;
  var fallbackTimer = null;

  var applyScope = function (fn) {
    if ($scope.$$phase) {
      fn();
    } else {
      $scope.$apply(fn);
    }
  };

  var renderScores = function (a, b, source) {
    var percentages = getPercentages(a, b);

    bg1.style.width = percentages.a + "%";
    bg2.style.width = percentages.b + "%";

    applyScope(function () {
      $scope.aPercent = percentages.a;
      $scope.bPercent = percentages.b;
      $scope.total = a + b;
      $scope.updateCount += 1;
      $scope.lastUpdate = new Date().toLocaleTimeString() + " (" + source + ")";
      if (source === "socket") {
        $scope.connectionState = "live";
      } else if ($scope.connectionState !== "live") {
        $scope.connectionState = "fallback";
      }
    });
  };

  var updateScores = function(){
    if (hasScoreListener) {
      return;
    }

    hasScoreListener = true;

    socket.on('scores', function (json) {
       var data = JSON.parse(json);
       var a = parseInt(data.a || 0, 10);
       var b = parseInt(data.b || 0, 10);

       renderScores(a, b, "socket");
    });
  };

  var fetchScores = function () {
    var request = new XMLHttpRequest();
    request.open('GET', '/api/scores?ts=' + Date.now(), true);
    request.onreadystatechange = function () {
      if (request.readyState !== 4) {
        return;
      }

      if (request.status !== 200) {
        applyScope(function () {
          if ($scope.connectionState !== "live") {
            $scope.connectionState = "fallback-error(" + request.status + ")";
          }
        });
        return;
      }

      try {
        var data = JSON.parse(request.responseText || '{}');
        var a = parseInt(data.a || 0, 10);
        var b = parseInt(data.b || 0, 10);
        renderScores(a, b, "http");
      } catch (e) {
        applyScope(function () {
          if ($scope.connectionState !== "live") {
            $scope.connectionState = "fallback-parse-error";
          }
        });
      }
    };
    request.send();
  };

  var startFallbackPolling = function () {
    if (fallbackTimer !== null) {
      return;
    }

    fetchScores();
    fallbackTimer = setInterval(fetchScores, 2000);
  };

  socket.on('connect', function () {
    applyScope(function () {
      $scope.connectionState = "connected";
    });
  });

  socket.on('disconnect', function () {
    applyScope(function () {
      $scope.connectionState = "disconnected";
    });
  });

  var init = function(){
    document.body.style.opacity=1;
    updateScores();
    startFallbackPolling();
  };

  init();
});

function getPercentages(a, b) {
  var result = {};

  if (a + b > 0) {
    result.a = Math.round(a / (a + b) * 100);
    result.b = 100 - result.a;
  } else {
    result.a = result.b = 50;
  }

  return result;
}