;(function(){
  "use strict";

  window.initSpiderfyMap = function() {
    //init map
    var map = L.map('spiderfy-issue', {
      maxZoom: 10
    });

    //init tile layer
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

    //set center
    map.setView([48.85, 2.35], 10);

    //init clusters group layer
    var mcg = L.markerClusterGroup({
      spiderfyOnMaxZoom: true
    }).addTo(map);

    //generate random markers
    for (var i = 0; i < 100; i += 1) {
      var marker = L.marker(getRandomLatLng()).addTo(mcg);

      marker.bindPopup('Hello, I am popup.');
    }

    function getRandomLatLng() {
      return [
        48.8 + 0.1 * Math.random(),
        2.25 + 0.2 * Math.random()
      ];
    }
  }
})();
