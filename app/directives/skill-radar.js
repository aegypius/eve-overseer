angular
  .module('eve-overseer')
  .directive('skillRadar', function () {
    return {
      restrict: 'ACE',
      replace: true,
      scope: true,
      templateUrl: '/templates/skill-radar.html',
      controller: ['$scope', 'Skill', function ($scope, Skill) {
        $scope.myData = {
          labels: [],
          datasets: [
            {
              label: "My dataset",
              fillColor: "rgba(51,51,51,0.2)",
              strokeColor: "rgba(51,51,51,1)",
              pointColor: "rgba(51,51,51,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(51,51,51,1)",
              pointLabelFontFamily : "'Abel'",
                        //Number - Point label font size in pixels
              pointLabelFontSize : 14,
              data: []
            }
          ]
        };

        $scope.someOptions = {
          scaleShowLine : true,
          responsive: true,
          // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
          maintainAspectRatio: true,
          //Boolean - Whether we show the angle lines out of the radar
          angleShowLineOut : true,

          //Boolean - Whether to show labels on the scale
          scaleShowLabels : true,

          // Boolean - Whether the scale should begin at zero
          scaleBeginAtZero : true,
          scaleOverride: true,
          scaleSteps: 10,
    // Number - The value jump in the hard coded scale
//scaleStepWidth: null,
    // Number - The scale starting value
          scaleStartValue: 0,
          scaleStepWidth:10,
          //String - Colour of the angle line
          angleLineColor : "rgba(255,0,0,.1)",

          //Number - Pixel width of the angle line
          angleLineWidth : 1,

          //String - Point label font declaration
          pointLabelFontFamily : "'Abel'",

          //String - Point label font weight
          pointLabelFontStyle : "bold",

          //Number - Point label font size in pixels
          pointLabelFontSize : 14,

          //String - Point label font colour
          pointLabelFontColor : "#3071A9",

          //Boolean - Whether to show a dot for each point
          pointDot : false,

          //Number - Radius of each point dot in pixels
          pointDotRadius : 1,

          //Number - Pixel width of point dot stroke
          pointDotStrokeWidth : 1,

          //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
          pointHitDetectionRadius : 2,

          //Boolean - Whether to show a stroke for datasets
          datasetStroke : true,

          //Number - Pixel width of dataset stroke
          datasetStrokeWidth : 2,

          //Boolean - Whether to fill the dataset with a colour
          datasetFill : true,
        };
        if ($scope.listIdGroup == undefined) {

          $scope.listIdGroup = {
            NotAff : {}
          };
        }

        // ,
        // {
        //   label: "Max",
        //   fillColor: "rgba(99,0,0,0.2)",
        //   strokeColor: "rgba(99,0,0,1)",
        //   pointColor: "rgba(99,0,0,1)",
        //   pointStrokeColor: "#fff",
        //   pointHighlightFill: "#fff",
        //   pointHighlightStroke: "rgba(99,0,0,1)",
        //   pointLabelFontFamily : "'Abel'",
        //             //Number - Point label font size in pixels
        //   pointLabelFontSize : 14,
        //   data: []//15872000 ,4352000  ,3840000  ,7168000  ,20480000 ,12800000 ,24064000 ,7424000  ,47360000 ,19456000 ,7424000  ,11776000 ,48384000 ,150528000,21504000 ,11776000 ,5376000  ,15872000 ,24064000 ,27904000
        // }

        var calculateRadar = function(character){
           if (undefined !== character) {
            $scope.myData = {
              labels: [],
              datasets: [
                {
                  label: "My dataset",
                  fillColor: "rgba(51,51,51,0.2)",
                  strokeColor: "rgba(51,51,51,1)",
                  pointColor: "rgba(51,51,51,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(51,51,51,1)",
                  pointLabelFontFamily : "'Abel'",
                            //Number - Point label font size in pixels
                  pointLabelFontSize : 14,
                  data: []
                }
              ]
            };

            Skill.query({id: character.id, filter: 'all'}, function (groups) {
              $scope.groups = groups;
              var limit = 5;
              angular.forEach(groups, function(group) {
                console.log($.inArray($scope.listIdGroup.NotAff, group.id), group.id);
                if(-1==$.inArray($scope.listIdGroup.NotAff, group.id)) {

                // if (limit>0) {
                  group.points = group.skills.map(function(skill){
                    if (skill.points==null) skill.points = 0;
                    return parseInt(skill.points,10);
                  }).reduce(function(a,b){return a+b});

                  group.Totalpoints = group.skills.map(function(skill){

                    return parseInt(skill.rank,10)*256000;
                  }).reduce(function(a,b){return a+b});

                  $scope.myData.labels.push(group.name);

                  $scope.myData.datasets[0].data.push(((group.points*100)/group.Totalpoints).toFixed(2));
                }
              });
              console.log($scope.myData);
            });
          }
        }
        $scope.$watch('listIdGroup.NotAff', function (item) {
          if (undefined !== $scope.character) {
            // group.id not in list we add it
            console.log($.inArray($scope.listIdGroup.NotAff, item), item);
            if(-1!=$.inArray($scope.listIdGroup.NotAff, item)) {
              $scope.listIdGroup.NotAff.push(item);
            } else {

            }
            console.log($scope.listIdGroup);
            calculateRadar($scope.character);
          }
        });

        $scope.$watch('character', function (character) {
          console.log($scope.listIdGroup.NotAff);
          calculateRadar(character);


        });
      }]
    };
  })
;
