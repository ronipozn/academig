// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../../../user/services/user-service';

declare var $: any;

@Component({
  selector: 'univeristy-vector-map',
  templateUrl: './map.component.html'
})

export class UniversityMapComponent implements OnInit {

  country: string;

  constructor(private userService: UserService,
              private router: Router) { }

  ngOnInit() {
    var that = this;

    $('#worldMap').vectorMap({
      map: 'world_en',
      // backgroundColor: 'transparent',
      // borderColor: '#818181',
      // borderOpacity: 0.25,
      borderWidth: 1,
      color: '#ffffff',
      // enableZoom: true,
      // zoomOnScroll: true,
      hoverColor: '#b3b3b3',
      hoverOpacity: null,
      normalizeFunction: 'linear',
      scaleColors: ['#b6d6ff', '#005ace'],
      selectedColor: '#c9dfaf',
      // selectedRegions: null,
      showTooltip: false,
      onRegionClick: function(element, code, region){
       that.onSearch(region);
      },
      onRegionOver: function(event, code, region) {
       that.country = region;
      },
      onRegionOut: function(event, code, region) {
       that.country = null;
      },
    });
  }

  onSearch(country: string) {
    this.userService.searchRefinements['countries'] = [country];
    this.router.navigate(['./search']);
  }

}
