/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
//  C:\Users\agusr\AppData\Local\Google\Chrome\Application\chrome.exe --user-data-dir="D:/workspace" --disable-web-security  
 
function initMap() {
  let waypointMarker = null;

  let distance=0;
  let markers=[];
  let waypointResult=[];
  let directionsResult =null;
  let directionsIndex=0;

  const routeSegmentPanel = document.getElementById("routesegment-panel");
  const directionPanel = document.getElementById("direction-panel");

  const palcesCache = new Map();

  const addWayPointResult = function (results){
    if (results[0]) {
      const address =results[0].formatted_address;
      
      waypointResult.push({
        place_id: results[0].place_id ,
        address:  address,
        location: results[0].geometry.location,
        stopover: true 
      });
    } 
  }

  const addPalcesCache = function (results){
    if (results[0]) {
      const address =results[0].formatted_address;
      const place_id = results[0].place_id ;
      palcesCache.set(results[0].place_id ,results[0]);
      console.log("palces cache")
      console.log(palcesCache)
      // check waypoint result
      const data = waypointResult.filter(wp => wp.place_id==place_id );
      if(data){
        if(data.address != address){
          console.log("old data");
          console.log(data)
          data.address=address;  
          renderWaypointsPanel();
        }
      }
    } 
  }
  
  const options = {
    zoom: 5,
    center:new google.maps.LatLng( 0, 116.0191821 ),
  };
  const geocoder = new google.maps.Geocoder();
  const map = new google.maps.Map(document.getElementById("map"), options);
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    draggable: true,
    map,
    panel: directionPanel,
  });
  

  // const origin = "Perth, WA";
  // const destination = "Sydney, NSW";
  directionsRenderer.addListener("directions_changed", () => {
    const directions = directionsRenderer.getDirections();
    if (directions) {
      directionsResult = directions;
      setupWaypoint();
      computeTotalDistance();
      renderRouteSegment();
    }
  });
  
  const advReqOptions={
    provideRouteAlternatives:false,
    optimizeWaypoints:true,
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidFerries:false,
    avoidHighways:false,
    avoidTolls:false
  };

  
  const addMarker=function( latlng ){
    let a=arguments;
    let args={
      position:latlng,
      map:map
    };
    if( typeof( a[1] )=='object' && Object.keys( a[1] ).length > 0 ){
      args=Object.assign( args, a[1] );
    }
    let marker=new google.maps.Marker( args );
    return marker;
  };

  const clickhandler=function(e){
    if( waypointResult.length >=2 ){
      if(confirm("Add Waypoint")){
        waypointMarker=addMarker( e.latLng,{ draggable:false } );
      }
      else{
        return;
      }
    }else{
      markers.push( addMarker( e.latLng,{ draggable:true} ) );
    }
    let route={};

    if( waypointResult.length >= 2 || markers.length == 2 ){
       
      const waypoints  = [];
      if(waypointResult.length >= 2){
        const destinationIndex = waypointResult.length-1;
        for( let i = 1 ; i < destinationIndex; i++){
          if(waypointResult[i].stopover){
            waypoints.push(
              {
               stopover: true,
               location : waypointResult[i].location,
              }
             );
          }
        }
        waypoints.push(
          {
           stopover: true,
           location : waypointMarker.getPosition() ,
          }
         );
         route={
          start:waypointResult[0].location,
          finish:waypointResult[destinationIndex].location,
          waypoints: waypoints,
        };
      }else{
        route={
          start:markers[0].getPosition(),
          finish:markers[1].getPosition(),
        };
      }
      
      const calculate=()=>new Promise(( resolve, reject )=>{
        let oReq=Object.assign(
          advReqOptions,
          {
            origin:route.start,
            destination:route.finish,
            waypoints : route.waypoints,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
          }
        );

        directionsService.route( oReq, ( response, status )=>{
          if( status === google.maps.DirectionsStatus.OK ){
            for( let i = 0 ; i < markers.length; i++){
              markers[i].setMap( null );
            }
            if(waypointMarker) {
              waypointMarker.setMap( null );
              waypointMarker=null;
            }
            
            directionsRenderer.setDirections( response );
            let res=response.routes[0];
            for( let k=0; k < res.legs.length; k++ ) {
              distance+=Number( res.legs[k].distance.value );
            }
            resolve( distance )
          }
          reject( status )
        });	

      });


      calculate()
        .then(res=>console.log( 'Distance: %dm',res ))
        .catch(err=>{
          console.warn(err);
          if(directionsResult){
            for( let i = 0 ; i < markers.length; i++){
              markers[i].setMap( null );
            }
            if(waypointMarker) {
              waypointMarker.setMap( null );
              waypointMarker=null;
            }
            
            directionsRenderer.setDirections( directionsResult );
          }else{
            for( let i = 0 ; i < markers.length; i++){
              markers[i].setMap( null );
            }
            markers=[];
            alert("Invalid marker origin or destination")
          }
        })
    }
  };

  const addwaypoint=function(e){
    directionsRenderer.set('directions', null);
    markers=[];
    if(waypointResult.length < 1){
      return
    }
 
    markers.push( addMarker( 
      new google.maps.LatLng( waypointResult[0].lat,waypointResult[0].lng),{ draggable:false } 
      ));

    if(waypointResult.length < 2){
      return
    }
    markers.push( addMarker( 
      new google.maps.LatLng( waypointResult[waypointResult.length-1].lat,waypointResult[waypointResult.length-1].lng),{ draggable:false } 
      ));
  };

  function computeTotalDistance() {
    let total = 0;
    const myroute = directionsResult.routes[directionsIndex];
  
    if (!myroute) {
      return;
    }
  
    for (let i = 0; i < myroute.legs.length; i++) {
      total += myroute.legs[i].distance.value;
    }
  
    total = total / 1000;
    document.getElementById("total").innerHTML = total + " km";
  }

  function renderRouteSegment() {
   
    const route = directionsResult.routes[0];
    if (!route) {
      return;
    }

    if(routeSegmentPanel){
      let summaryPanelHtml = "";
      // For each route, display summary information.
      for (let i = 0; i < route.legs.length; i++) {
        const routeSegment = i + 1;
        summaryPanelHtml +=
          "<b>Route Segment: " + routeSegment + "</b><br>";
        summaryPanelHtml += route.legs[i].start_address + " <br> Ke <br> ";
        summaryPanelHtml += route.legs[i].end_address + "<br>";
        summaryPanelHtml += route.legs[i].distance.text + "<br><br>";
      }
      routeSegmentPanel.innerHTML = summaryPanelHtml;
    }

  }

  function setupWaypoint() {
    const route = directionsResult.routes[directionsIndex];
    if (!route) {
      return;
    }
    waypointResult=[];
    let geocoded_waypoints=directionsResult.geocoded_waypoints;
    for (let i = 0; i < geocoded_waypoints.length ; i++){
      waypointResult.push({ place_id: geocoded_waypoints[i].place_id,stopover:true })
    }
    
    let w = 0;
    for (let i = 0; i < route.legs.length ; i++) {
      if(i==0){
        waypointResult[w].address=route.legs[i].start_address;
        waypointResult[w].location=route.legs[i].start_location;
        w++;
      }
      for (let j = 0 ; j < route.legs[i].via_waypoint.length;j++ ){
        waypointResult[w].location=route.legs[i].via_waypoint[j].location;
        waypointResult[w].stopover=false;
        w++;
      }
      waypointResult[w].address=route.legs[i].end_address;
      waypointResult[w].location=route.legs[i].end_location;
      w++;   
    }
    console.log(waypointResult)
    renderWaypointsPanel();

    for (let i = 0; i < waypointResult.length ; i++){
      const placeId = geocoded_waypoints[i].place_id
      if(!palcesCache.has(placeId)){
        geocoder.geocode({ placeId: placeId },addPalcesCache);
      }
      
    }
  }
  
  function renderWaypointsPanel(){

    let strContent = "";
    let label='A';
    const destinationIndex = waypointResult.length-1;

    let waypoint=waypointResult[0];
    strContent+= "Origin (";
    strContent+= label;
    strContent+= ")";
    strContent+= ":";
    strContent+='<input id="wp_place_id_'+waypoint.place_id+'"  name="waypoint" value="';
    if(waypoint.address){
      strContent+=waypoint.address;
    }else{
      strContent+=waypoint.location.lat;
      strContent+=",";
      strContent+=waypoint.location.lng;
    }
    strContent+='">'
    strContent+='<br>';
    label= String.fromCharCode(label.charCodeAt(0)+1);

    for(let i=1;i < destinationIndex;i++){
      waypoint=waypointResult[i];
      if(waypoint.stopover){
        
        strContent+= "stopover (";
        strContent+= label;
        strContent+= ")";
        strContent+= ":";
        strContent+='<input id="wp_place_id_'+waypoint.place_id+'"  name="waypoint" value="';
        if(waypoint.address){
          strContent+=waypoint.address;
        }else{
          strContent+=waypoint.location.lat;
          strContent+=",";
          strContent+=waypoint.location.lng;
        }
        strContent+='">'
        strContent+='<br>';
        label= String.fromCharCode(label.charCodeAt(0)+1);
      }else{
        //strContent+= label;
        strContent+= " via :";
        if(waypoint.address){
          strContent+=waypoint.address;
        }else{
          strContent+=waypoint.location.toString();
        }
        strContent+='<br>';
      }
    }

    waypoint=waypointResult[destinationIndex];
    strContent+= "Destination (";
    strContent+= label;
    strContent+= ")";
    strContent+='<input id="wp_place_id_'+waypoint.place_id+'"  name="waypoint" value="';
    if(waypoint.address){
      strContent+=waypoint.address;
    }else{
      strContent+=waypoint.location.lat;
      strContent+=",";
      strContent+=waypoint.location.lng;
    }
    strContent+='">'
    strContent+='<br>';
    label= String.fromCharCode(label.charCodeAt(0)+1);
    //console.debug( strContent);
    document.getElementById("waypoints-panel").innerHTML = strContent;
  }
  google.maps.event.addListener( map, 'click', clickhandler );
  //document.getElementById("btn-add-waypoints").addEventListener("click", addwaypoint);
  function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
}

window.initMap = initMap;
