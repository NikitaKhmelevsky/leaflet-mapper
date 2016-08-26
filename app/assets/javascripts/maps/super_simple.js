;(function(){
  "use strict";

  window.initSuperSimple = function() {
    var map = L.map('super-simple').setView([51.505, -0.09], 13);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

    L.marker([51.5, -0.09]).addTo(map)
      .bindPopup('Wololo')
    ;
  }
})();
