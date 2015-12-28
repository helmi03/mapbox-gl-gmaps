function MapboxGL(options) {
    var self = this;
    this.options = options;
    var _mapgl;

    this.draw = function() {
        if (!self._mapgl || !self._div) {
            return;
        }
        var map = self._map;
        var bounds = map.getBounds();
        var overlayProjection = self.getProjection();
        var sw = overlayProjection.fromLatLngToDivPixel(bounds.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(bounds.getNorthEast());

        var div = self._div;
        var size = {x:(ne.x - sw.x), y:(sw.y - ne.y)};
        var gl = self._mapgl;
        var tr = gl.transform;
        tr.zoom = self._map.getZoom()-1;
        var center = self._map.getCenter();
        tr.center = mapboxgl.LngLat.convert([center.lng(), center.lat()])

        div.style.left = sw.x + 'px';
        div.style.top = ne.y + 'px';
        if (gl.transform.width !== size.x || gl.transform.height !== size.y) {
            div.style.width  = size.x + 'px';
            div.style.height = size.y + 'px';
            gl.resize();
        } else {
            // gl.update();
        }
    };

    this.onAdd = function() {
        var map = this.getMap();
        this._map = map;

        var mapgld = document.createElement('div');
        mapgld.style.height = "100%";
        mapgld.style.width = "100%";
        mapgld.style.position = "absolute";
        this._div = mapgld;
        var panes = this.getPanes();
        panes.overlayMouseTarget.appendChild(mapgld);

        mapboxgl.accessToken = this.options.token;
        mapboxgl.util.getJSON('https://api.mapbox.com/styles/v1/mapbox/streets-v8?access_token=' + mapboxgl.accessToken, function (err, style) {
            if (err) throw err;

            style.layers.forEach(function (layer) {
                layer.interactive = true;
            });
            var mapgl = new mapboxgl.Map({
                container: mapgld, // container id
                style: style //stylesheet location
            });
            self._mapgl = mapgl;
            var drawme = self.draw;
            drawme();
            mapgl.on('mousemove', function (e) {
                mapgl.featuresAt(e.point, {radius: 5}, function (err, features) {
                    if (err) throw err;
                    // document.getElementById('features').innerHTML = JSON.stringify(features, null, 2);
                    for (var i=0;i<features.length;i++) {
                        if (features[i].layer.id='road-motorway') {
                            // console.debug(e.lngLat, JSON.stringify(features, null, 2));
                        }
                    }
                });
            });
            map.addListener('center_changed', drawme);
            map.addListener('bound_changed', drawme);
            map.addListener('zoom_changed', drawme);
        });
    };

    this.onRemove = function() {
        self._mapgl.remove();
        self._mapgl = null;
        this._div.parentNode.removeChild(this._div);
    };

    this.hide = function() {
        if (this._div) {
            this._div.style.visibility = 'hidden';
        }
    };

    this.show = function() {
        if (this._div) {
            this._div.style.visibility = 'visible';
        }
    };

    this.toggle = function() {
        if (this._div) {
            if (this._div.style.visibility === 'hidden') {
                this.show();
            } else {
                this.hide();
            }
        }
    };

    this.toggleDOM = function() {
        if (this.getMap()) {
            // Note: setMap(null) calls OverlayView.onRemove()
            this.setMap(null);
        } else {
            this.setMap(this._map);
        }
    };
}

MapboxGL.prototype = new google.maps.OverlayView();
