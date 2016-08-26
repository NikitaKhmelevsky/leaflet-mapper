;$(function(){
  "use strict";

  if ($('#hardcore-map-wrapper').length > 0) {
    var hardCoreMap = new HardCoreMap({
      appContainerSelector: '#hardcore-map-wrapper',
      map_id: 'hardcore-map'
    });

    hardCoreMap.init();
  }
});
