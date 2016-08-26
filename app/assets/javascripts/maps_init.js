;$(function(){
  "use strict";
  
  L.Icon.Default.imagePath = '/images/leaflet/images';
  
  if ($('#hardcore-map-wrapper').length > 0) {
    var hardCoreMap = new HardCoreMap({
      appContainerSelector: '#hardcore-map-wrapper',
      map_id: 'hardcore-map'
    });

    hardCoreMap.init();
  }

  if ($('#spiderfy-issue-wrapper').length > 0) {
    initSpiderfyMap();
  }

  if ($('#super-simple-wrapper').length > 0) {
    initSuperSimple();
  }
});
