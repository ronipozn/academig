import {Component} from '@angular/core';
// import { SebmGoogleMap, SebmGoogleMapMarker, SebmGoogleMapInfoWindow } from 'angular2-google-maps/core';

@Component({
  selector: 'placeholders-map',
  templateUrl: 'placeholders-map.html',
  styleUrls: ['placeholders-map.css']
})
export class PlaceholdersMapComponent {

  // initial center position for the map
  lat = 51.678418;
  lng = 7.809007;

  lat2 = 51.678418;
  lng2 = 7.803027;

  // google maps zoom level
  zoom = 8;

  markers: marker[] = [
	  {
		  lat: 51.673858,
		  lng: 7.815982,
		  label: 'A',
		  draggable: true
	  },
	  {
		  lat: 51.373858,
		  lng: 7.215982,
		  label: 'B',
		  draggable: false
	  },
	  {
		  lat: 51.723858,
		  lng: 7.895982,
		  label: 'C',
		  draggable: true
	  }
  ]

  clickedMarker(label: string, index: number) {
    // console.log(`clicked the marker: ${label || index}`)
  }

  // mapClicked($event: MouseEvent) {
  //   this.markers.push({
  //     lat: $event.coords.lat,
  //     lng: $event.coords.lng
  //   });
  // }

  markerDragEnd(m: marker, $event: MouseEvent) {
    // console.log('dragEnd', m, $event);
  }
}
// just an interface for type safety.
interface marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}
