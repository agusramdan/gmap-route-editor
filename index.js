/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
//  C:\Users\agusr\AppData\Local\Google\Chrome\Application\chrome.exe --user-data-dir="D://workspace" --disable-web-security  
 
 function initMap() {
  let markers=[];
  let distance=0;
  let markerWaypoints=[];
  let viaWaypoints=[];
  let directionsReslutl ;

  const options = {
    zoom: 5,
    center:new google.maps.LatLng( 0, 116.0191821 ),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  const map = new google.maps.Map(document.getElementById("map"), options);
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    draggable: true,
    map,
    panel: document.getElementById("panel"),
 
  });
  

  // const origin = "Perth, WA";
  // const destination = "Sydney, NSW";
  directionsRenderer.addListener("directions_changed", () => {
    const directions = directionsRenderer.getDirections();
    if (directions) {
      directionsReslutl = directions;
      computeTotalDistance(directions);
      renderRouteSegment(directions);
      renderWaypoint(directions)
    }
  });
  
  const advReqOptions={
    provideRouteAlternatives:true,
    optimizeWaypoints:true,
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
  const rightClickAddWaypoint = function (e){
 
    var lat = e.latLng.lat();
    var lng = e.latLng.lng();
    // populate yor box/field with lat, lng
    if(confirm("add waypoint ")){
      markerWaypoints.push( addMarker( e.latLng,{ draggable:true } ) )
    }
 
  };

  const clickhandler=function(e){
    if( markers.length == 2 ){
      if(confirm("add waypoint")){
        markerWaypoints.push( addMarker( e.latLng,{ draggable:true } ) )
      }
      else{
        return;
      }
    
    }else{
      markers.push( addMarker( e.latLng,{ draggable:true } ) );
    }
    
    if( markers.length==2 ){
      const waypoints = [];

      for( let i = 0 ; i < markerWaypoints.length; i++){
        waypoints.push({stopover: true,location : markerWaypoints[i].getPosition()})
      }

      // for( let i = 0 ; i < viaWaypoints.length; i++){
      //   waypoints.push({stopover: false,location : viaWaypoints[i]})
      // }

      
      let route={
        start:markers[0].getPosition(),
        finish:markers[1].getPosition(),
        waypoints: waypoints,
      };

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
            markers[0].setMap( null );
            markers[1].setMap( null );
            for( let i = 0 ; i < markerWaypoints.length; i++){
              markerWaypoints[i].setMap( null );
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
        .catch(err=>console.warn(err))
    }
  };

  function computeTotalDistance(result) {
    let total = 0;
    const myroute = result.routes[0];
  
    if (!myroute) {
      return;
    }
  
    for (let i = 0; i < myroute.legs.length; i++) {
      total += myroute.legs[i].distance.value;
    }
  
    total = total / 1000;
    document.getElementById("total").innerHTML = total + " km";
  }

  function renderRouteSegment(response) {
   
    const route = response.routes[0];
    if (!route) {
      return;
    }
    
    document.getElementById("origin").innerHTML=route.legs[0].start_address
    document.getElementById("destination").innerHTML=route.legs[route.legs.length-1].end_address

    const summaryPanel = document.getElementById("routesegment-panel");
    
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
    summaryPanel.innerHTML = summaryPanelHtml;
  }
  
  function renderWaypoint(response) {
    const route = response.routes[0];
    if (!route) {
      return;
    }
    const summaryPanel = document.getElementById("waypoint-panel");
    
    let summaryPanelHtml = "";// " geocoded_waypoints : " +response.geocoded_waypoints.length + "<BR>";
    // For each route, display summary information.
    viaWaypoints=[];
    for (let i = 0; i < route.legs.length ; i++) {
      const  routeSegment =  i+1;
      for (let j = 0 ; j < route.legs[i].via_waypoint.length;j++ ){
        const viaWaypoint = route.legs[i].via_waypoint[j].location;
        viaWaypoints.push(viaWaypoint);
        summaryPanelHtml += " via : "
        summaryPanelHtml += viaWaypoint.toString() + "<br><br>"; 
      }
      if(routeSegment != route.legs.length){
        summaryPanelHtml += " Stoppoint : "
        summaryPanelHtml += route.legs[i].end_address + "<br><br>"; 
      }
      
    }
    summaryPanel.innerHTML = summaryPanelHtml;
  }
  google.maps.event.addListener( map, "rightclick", rightClickAddWaypoint);
  google.maps.event.addListener( map, 'click', clickhandler );

}




window.initMap = initMap;
