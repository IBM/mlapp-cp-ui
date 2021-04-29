<template>
  <div id="map">
    <div id="mapid"></div>
    <div id="marker_popup" style="display: none;">
        <p class="close_marker_popup" onclick="close_marker_popup();">X</p>
        <div>xxx</div>
        <div class="buttons">
            <input class="call" type="button" value="aaa">
        </div>
    </div>            
  </div>
</template>

<style>
    #map{
        position: absolute;
        width: 100%;
        height: 100%;
    }
    #mapid { 
        height: 100%; 
    }

    #marker_popup{
        display: block;
        width: 300px;
        margin-left: -50px;
        margin-top: -150px;
        position: fixed;
        background-color: #fff;
        border: 1px solid #000;
        text-align: right;
        padding: 10px;
        z-index: 1000;
        color: #000;
    }
</style>


<script>
  // import global_counties from './../../../../counties'

  // import Vue from "vue";
  
  // export default {
  //   data: () => ({
  //     counties: global_counties.us,
  //     map: null
  //   }),

  //   computed: {
      
  //   },

  //   created () {
  //     this.initialize();
  //   },

  //   mounted () {
  //     this.map = L.map('mapid').setView([38.5,-98], 4);
  //     L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=ZW03Y1ESfPKPQEPIBIaW', {
  //         attribution: '',
  //         attributionControl: false
  //     }).addTo(this.map);
      
  //     var self = this;

  //     var BigPointLayer = L.CanvasLayer.extend({
  //       render: function() {
  //         var canvas = this.getCanvas();
  //         var ctx = canvas.getContext('2d');
  //         ctx.clearRect(0, 0, canvas.width, canvas.height);

  //         for(var i=0;i<self._data.counties.length;i++){
  //             var coordinates = self._data.counties[i].geometry.coordinates[0];              
  //             ctx.beginPath();
  //             // var r = a*self._data.min_heat[0] + (1-a)*self._data.max_heat[0];
  //             // var g = a*self._data.min_heat[1] + (1-a)*self._data.max_heat[1];
  //             // var b = a*self._data.min_heat[2] + (1-a)*self._data.max_heat[2];
  //             var a = Math.random();
  //             ctx.fillStyle = 'rgba(255,80,80,'+a+')';
  //             var first_point = self._data.map.latLngToContainerPoint(new L.LatLng(coordinates[0][1],coordinates[0][0]));
  //             ctx.moveTo(first_point.x, first_point.y);
  //             for (var j=1;j<coordinates.length;j++){
  //               var point = self._data.map.latLngToContainerPoint(new L.LatLng(coordinates[j][1],coordinates[j][0]));
  //               ctx.lineTo(point.x, point.y);
  //             }
  //             ctx.closePath();
  //             ctx.fill();                
  //         }
  //       }
  //     });

  //   var layer = new BigPointLayer();
  //   layer.addTo(this.map);

      
  //     // L.marker([32.0853,34.7818]).addTo(mymap).on('click', function(e) {
  //     //     document.getElementById("marker_popup").style.top = "500" + "px"
  //     //     document.getElementById("marker_popup").style.left = "500" + "px"
  //     //     document.getElementById("marker_popup").style.display = "block";
  //     // });

  //   },

  //   methods: {
  //     initialize () {
          
  //     }, 
  //   }

  //   }
</script>
