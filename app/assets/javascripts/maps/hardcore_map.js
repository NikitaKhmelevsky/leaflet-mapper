;(function(){
  "use strict";

  window.HardCoreMap = HardCoreMap;

  function HardCoreMap (options) {
    var self = this;

    //properties
    self.map;

    self.DEFAULT_COORDS = {
      lat: 40.696688,
      lng: -73.523855
    };

    self.TIMEOUT = 5000;

    self.map_id = options.map_id   || 'hardcore-map';

    self.minZoom = 4;
    self.maxZoom = 13;
    self.zoom    = options.zoom    || 7;
    self.center  = { lat: null, lng: null };

    self.$appContainer = $(options.appContainerSelector);

    self.timer;

    self.markersData;

    //cluster layer
    self.markerClusterGroup = {};

    self.init = function () {
      self.defineCenter()
        .then(function () {
          self.initMap();
          self.updateMarkers();
        })
      ;
    };

    self.defineCenter = function() {
      var d = $.Deferred();

      var coordinates = Cookies.getJSON('coordinates');
      
      if (coordinates) {
        self.center = { lat: coordinates.lat, lng: coordinates.lng };
        d.resolve();
      } else {
        self.getHTMLGeoPosition().done(function (pos) {
          Cookies.set('coordinates', JSON.stringify({ lat: pos.lat, lng: pos.lng }));
          self.center = { lat: pos.lat, lng: pos.lng};
          d.resolve();
        });
      }

      return d.promise();
    };

    self.getHTMLGeoPosition = function() {
      var d = $.Deferred();

      var pos = self.DEFAULT_COORDS;
      // Try HTML5 geolocation.
      try { //to fix ipad geolocation bug
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function (position) {
              d.resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            function(error) {
              //return defualt coords
              d.resolve(pos);
            },
            { maximumAge: 600000, timeout: self.TIMEOUT }
          );
        } else {
          //return default coords
          d.resolve(pos);
        }
        setTimeout(function () {
          if(!pos){
            d.resolve(pos);
          }
        }, self.TIMEOUT + 1000);
      } catch(error) {
        d.resolve(pos);
      }

      return d.promise();
    };

    self.defineElasticsearchZoom = function() {
      var zoom = 3;

      var currentZoom = self.map.getZoom();

      if(currentZoom >= 5 && currentZoom <= 8){
        zoom = 4;
      }
      else if(currentZoom >= 9 && currentZoom <= 11){
        zoom = 5;
      }
      else if(currentZoom >= 12 && currentZoom <= 14){
        zoom = 6;
      }
      else if(currentZoom >= 15 && currentZoom <= 17){
        zoom = 7;
      }
      else if(currentZoom >= 18){
        zoom = 8;
      }

      return zoom;
    };

    self.updateMarkersWithTimer = function() {
      if (self.timer) { clearTimeout(self.timer) }

      self.timer = setTimeout(function(){
        self.updateMarkers();
      }, 1000);
    };

    self.updateMarkers = function() {
      var d = $.Deferred();

      self.loadMarkers()
        .then(function() {
          self.markerClusterGroup.clearLayers();

          $.each(self.markersData, function(key, cluster) {
            var coordinates = geohash.decode(cluster.key);

            if (cluster.doc_count > 0) {
              self.createMarker(cluster, coordinates);
            }
          });
        })
      ;

      return d.promise();
    };

    self.createMarker = function(markerData, coordinates) {
      var markersCount = markerData.doc_count,
          icon         = undefined,
          marker       = undefined
      ;

      if (markersCount === 1) {
        icon = self.singleMarkerIconConstructor();
      } else {
        icon = self.simpleClusterIconConstructor(markersCount);
      }

      marker = L.marker([coordinates.latitude, coordinates.longitude], {icon: icon});

      marker.markersCount = markersCount;

      self.markerClusterGroup.addLayer(marker);
    };

    self.singleMarkerIconConstructor = function() {
      var width = 28;

      return new L.DivIcon({
        iconSize: [width, width],
        html: '<div class="cluster" style="text-align:center;border-radius: 50%;width:' + width + 'px;height:' + width + 'px;line-height:' + width + 'px;color: white;background-color: #9d9d9d">1</div>',
        className: 'cluster-icon'
      });
    };

    self.simpleClusterIconConstructor = function(markersCount) {
      var width = self.countSimpleClusterWidth(markersCount);

      return new L.DivIcon({
        iconSize: [width, width],
        html: '<div class="cluster" style="text-align:center;border-radius: 50%;width:' + width + 'px;height:' + width + 'px;line-height:' + width + 'px;color: white;background-color: #E69138">' + markersCount + '</div>',
        className: 'cluster-icon'
      });
    };

    self.countSimpleClusterWidth = function(markersCount) {
      var width = 28;
      var countLength = markersCount.toString().length;

      if (countLength > 3) {
        width += 5 * (countLength - 3);
      }
      return width;
    };

    self.clusterIconConstructor = function(cluster) {
      var markers = cluster.getAllChildMarkers();
      var markersCount = 0;

      markers.forEach(function(m){ markersCount = markersCount + m.markersCount; });

      return self.simpleClusterIconConstructor(markersCount);
    };

    self.loadMarkers = function() {
      var bounds = self.map.getBounds();

      return $.get(
        '/clusters.json',
        {
          bounds: {
            top_left: {
              lat: bounds.getNorthWest().lat,
              lng: bounds.getNorthWest().lng
            },
            bottom_right: {
              lat: bounds.getSouthEast().lat,
              lng: bounds.getSouthEast().lng
            }
          },
          //zoom: self.map._zoom
          zoom: self.defineElasticsearchZoom()
        },
        function(data) {
          console.log(data);
          self.markersData = data.aggregations.grid.buckets;
        }
      )
    };

    self.initMarkerClusterGroup = function() {
      self.markerClusterGroup = new L.MarkerClusterGroup({
        chunkedLoading:      true, //to resolve slow script issue
        spiderfyOnMaxZoom:   true,
        zoomToBoundsOnClick: true,
        showCoverageOnHover: true,
        iconCreateFunction: function(cluster) {
          return self.clusterIconConstructor(cluster);
        }
      }).addTo(self.map);

      // self.markerClusterGroup = new L.layerGroup().addTo(self.map);
    };

    self.initMap = function() {
      self.map = L.map(self.map_id, {
        center: [self.center.lat, self.center.lng],
        zoom:   self.zoom,
        minZoom: self.minZoom,
        maxZoom: self.maxZoom,
        attributionControl: false,
        scrollWheelZoom: true//false for prod
      });

      var googleLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        id: 'mapbox.streets'
      });

      self.map.addLayer(googleLayer);

      self.initMarkerClusterGroup();

      self.map.on('zoomend dragend', function() {
        console.log(self.map.getZoom());
        self.updateMarkersWithTimer();
      });
    };
  }


  // geohash.decode(cluster.key);
})();
