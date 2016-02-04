var map;
var aYears = ["2010", "2011", "2012", "2013", "2014"];

function setYearOptions(){
    $.each(aYears, function (i) {
        $('#yearList').append(new Option(aYears[i]))
    });
    $("#yearList").val(year)
}

function loadGeoData(input){
    $('.loading').show();
    map.data.addGeoJson(input)
    $('.loading').hide();
}

function zoomChanged(){
    var zoomLevel = map.getZoom();
    var sMapType;
    if(zoomLevel > 10) {
        map.setMapTypeId('local');
    } else {
        map.setMapTypeId('county');
    }
}

function initialize() {
    var latlng = new google.maps.LatLng(52.477568, -1.685511);
    cacheCenter = latlng;
    var mapOptions = {
        zoom: 7,
        center: latlng,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.TOP_RIGHT

        }
    };

    map = new google.maps.Map($(".mapCanvas")[0], mapOptions);

    var styledMapOptions = {map: map, name: 'county'};
    var styledMapOptionsLocal = {map: map, name: 'local'};

    var sMapType = new google.maps.StyledMapType(mapStyles,styledMapOptions);
    map.mapTypes.set('county', sMapType);
    map.setMapTypeId('county');

    var sMapTypeLocal = new google.maps.StyledMapType(mapStylesLocal,styledMapOptionsLocal);
    map.mapTypes.set('local', sMapTypeLocal);

    google.maps.event.addListener(map, 'zoom_changed', function() {
        zoomChanged()
    });

    map.data.addListener('click', function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        featureClick(event,lat, lng)
    });    
    
    loadGeoData(topojson.feature(oTTWarea, oTTWarea.objects.TTW));
    setYearOptions()
    addPolygonColors(oDeficiencyData[year]);
    addKeyD3()
}

var oKeyColors = setKeyColors()
google.maps.event.addDomListener(window, 'load', initialize);