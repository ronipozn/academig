import {Component, Input, OnInit, AfterViewInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import { TableData } from '../md-table/md-table.component';
// import { LegendItem, ChartType } from '../md/md-chart/md-chart.component';

import * as Chartist from 'chartist';

declare const $: any;

import {privateAnalyticsItems, Analytics, PrivateService} from '../../../shared/services/private-service';

@Component({
  selector: 'private-analytics-list',
  templateUrl: 'analytics-list.html',
  styleUrls: ['analytics-list.css']
})
export class PrivateAnalyticsListComponent implements OnInit, AfterViewInit {

  public tableData: TableData;
  public tableMembersData: TableData;
  public tableSeminarsData: TableData;

  @Input() groupId: string;
  @Input() sourceType: number; // 0 - regular, 1 - wall
  @Input() showEditBtn: number;

  // activeTab: number;
  // streamRetrieved: boolean[] = [];
  //
  // overallAnalytics: privateAnalyticsItems;
  //
  // publicationsAnalytics: Analytics[]
  // resourcesAnalytics: Analytics[]
  // projectsAnalytics: Analytics[]
  // positionsAnalytics: Analytics[]
  //
  // resourcesIds: number[] = [];

  weeksArray: string[];
  weekSelected: string;

  constructor(private privateService: PrivateService) {}

  // constructor(private navbarTitleService: NavbarTitleService) { }
  public ngOnInit() {
    this.weeksArray= ['May 31, 2020','May 24, 2020','May 17, 2020','May 10, 2020'];
    this.weekSelected = 'May 31, 2020'

    this.tableData = {
      headerRow: ['ID', 'Name', 'Salary', 'Country', 'City'],
      dataRows: [
            ['US', 'USA', '2.920	', '53.23%'],
            ['DE', 'Germany', '1.300', '20.43%'],
            ['AU', 'Australia', '760', '10.35%'],
            ['GB', 'United Kingdom	', '690', '7.87%'],
            ['RO', 'Romania', '600', '5.94%'],
            ['BR', 'Brasil', '550', '4.34%']
        ]
      };

    this.tableMembersData = {
      headerRow: [ '', 'Name', 'Description', 'Date', 'Action'],
      dataRows: [ // awards
        ['New Member', 'Julia Kora', 'Joined from Miller Lab', '15.05.2020', 'Wish goodluck'],
        ['Gradudated', 'Curaçao Polo', 'Finished her Phd', '23.05.2020', 'Congrat'],
        ['Member achievement', 'Toto Yago', 'Grant', '29.05.2020', 'Congrat'],
        ['Alumni achievement', 'Roti Navon', 'Nature publication', '22.05.2020', 'Congrat'],
        ['Birthday', 'Mike Prince', '', '23.05.2020', 'Wish happy birthday'],
      ]
    };

    this.tableSeminarsData = {
      headerRow: [ '', 'Presentor', 'Description', 'Date', 'Action'],
      dataRows: [
        ['Next seminar', 'Tatyana Pozner', 'Janus-faced spatacsin (SPG11): involvement in neurodelopment and multisystem neurodegeneration', '15 May, 2020', 'Wish goodluck'],
        ['Last seminar', 'Evelyn Maya', 'hereditary spastic paraplegia', '07 May, 2020', 'Congrat'],
      ]
    };

    /* ----------========== Daily Sales Chart initialization ==========---------- */

    const dataDailySalesChart = {
      labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      series: [ [12, 17, 7, 17, 23, 18, 38] ]
    };

    const optionsDailySalesChart = {
      lineSmooth: Chartist.Interpolation.cardinal({ tension: 0 }),
      low: 0,
      high: 50, // we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
    };
    const dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);
    this.startAnimationForLineChart(dailySalesChart);

    /* ----------========== Completed Tasks Chart initialization ==========---------- */

    const dataCompletedTasksChart = {
      labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
      series: [ [230, 750, 450, 300, 280, 240, 200, 190] ]
    };
    const optionsCompletedTasksChart = {
      lineSmooth: Chartist.Interpolation.cardinal({ tension: 0 }),
      low: 0,
      high: 1000, // we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0}
    };
    const completedTasksChart = new Chartist.Line('#completedTasksChart', dataCompletedTasksChart, optionsCompletedTasksChart);
    this.startAnimationForLineChart(completedTasksChart);

    /* ----------========== Emails Subscription Chart initialization ==========---------- */

    const dataWebsiteViewsChart = {
      labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      series: [ [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895] ]
    };
    const optionsWebsiteViewsChart = {
      axisX: { showGrid: false },
      low: 0,
      high: 1000,
      chartPadding: { top: 0, right: 5, bottom: 0, left: 0}
    };
    const responsiveOptions: any = [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function (value) {
            return value[0];
          }
        }
      }]
    ];
    const websiteViewsChart = new Chartist.Bar('#websiteViewsChart', dataWebsiteViewsChart, optionsWebsiteViewsChart, responsiveOptions);
    this.startAnimationForBarChart(websiteViewsChart);

    /* ----------========== Publications Reads ==========---------- */

    const dataPublicationsReadsChart = {
      labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      series: [ [12, 17, 7, 17, 23, 18, 38] ]
    };

    const optionsPublicationsReadsChart = {
      lineSmooth: Chartist.Interpolation.cardinal({ tension: 0 }),
      low: 0,
      high: 50, // we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
    };
    const publicationsReadsChart = new Chartist.Line('#publicationsReadsChart', dataPublicationsReadsChart, optionsPublicationsReadsChart);
    this.startAnimationForLineChart(publicationsReadsChart);

    /* ----------========== Full Text Reads ==========---------- */

    const dataPublicationsFullChart = {
      labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
      series: [ [230, 750, 450, 300, 280, 240, 200, 190] ]
    };
    const optionsPublicationsFullChart = {
      lineSmooth: Chartist.Interpolation.cardinal({ tension: 0 }),
      low: 0,
      high: 1000, // we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0}
    };
    const publicationsFullChart = new Chartist.Line('#publicationsFullChart', dataPublicationsFullChart, optionsPublicationsFullChart);
    this.startAnimationForLineChart(publicationsFullChart);

    /* ----------========== Citations ==========---------- */

    const dataCitationsViewsChart = {
      labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      series: [ [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895] ]
    };
    const optionsCitationsViewsChart = {
      axisX: { showGrid: false },
      low: 0,
      high: 1000,
      chartPadding: { top: 0, right: 5, bottom: 0, left: 0}
    };
    // const responsiveOptions: any = [
    //   ['screen and (max-width: 640px)', {
    //     seriesBarDistance: 5,
    //     axisX: {
    //       labelInterpolationFnc: function (value) {
    //         return value[0];
    //       }
    //     }
    //   }]
    // ];
    const citationsViewsChart = new Chartist.Bar('#citationsViewsChart', dataCitationsViewsChart, optionsCitationsViewsChart, responsiveOptions);
    this.startAnimationForBarChart(citationsViewsChart);

    /* ----------=============================---------- */
    /* ----------=============================---------- */
    /* ----------=============================---------- */
    /* ----------=============================---------- */

    $('#worldMap').vectorMap({
      map: 'world_en',
      backgroundColor: 'transparent',
       borderColor: '#818181',
       borderOpacity: 0.25,
       borderWidth: 1,
       color: '#b3b3b3',
       enableZoom: true,
       hoverColor: '#eee',
       hoverOpacity: null,
       normalizeFunction: 'linear',
       scaleColors: ['#b6d6ff', '#005ace'],
       selectedColor: '#c9dfaf',
       selectedRegions: null,
       showTooltip: true,
       onRegionClick: function(element, code, region)
       {
         var message = 'You clicked "' + region + '" which has the code: ' + code.toUpperCase();
         alert(message);
       }
    });

      // if (this.groupId) {
      // // this.titleService.setTitle("Analytics - ");
      //   this.streamRetrieved = [false, false, false, false, false];
      //   this.activeTab = 0;
      //   this.overallAnalyticsFunc(this.activeTab)
      // }
  }

  overallAnalyticsFunc(tabNum: number): void {
    // this.activeTab = tabNum;

    // if (this.streamRetrieved[tabNum]==false) {
    //   this.subscriptionTab=this.privateService.getOverallAnalyticById(this.groupId).subscribe(
    //     data => this.overallAnalytics=data,
    //     err => console.log("Can't get Overall Analytics Data. Error code: %s, URL: %s ", err.status, err.url),
    //     () => {
    //            this.streamRetrieved[tabNum]=true
    //          }
    //   );
    // }
  }

  analyticsFunc(tabNum: number): void {
    // this.activeTab = tabNum;

    // if (this.streamRetrieved[tabNum] == false) {
      // this.subscriptionTab=this.privateService.getAnalyticById(this.groupId,tabNum).subscribe(
      //   data => {
      //     if (Array.isArray(data)){
      //       if (tabNum==1) {this.publicationsAnalytics=data;}
      //       if (tabNum==2) {this.resourcesAnalytics=data;}
      //       if (tabNum==3) {this.projectsAnalytics=data;}
      //       if (tabNum==4) {this.positionsAnalytics=data;}
      //     }
      //     else{
      //       if (tabNum==1) {this.publicationsAnalytics.push(data);}
      //       if (tabNum==2) {this.resourcesAnalytics.push(data);}
      //       if (tabNum==3) {this.projectsAnalytics.push(data);}
      //       if (tabNum==4) {this.positionsAnalytics.push(data);}
      //     }
      //   },
      //   err => console.log("Can't get Analytics Data. Error code: %s, URL: %s ", err.status, err.url),
      //   () => {
      //          this.streamRetrieved[tabNum]=true
      //          if (tabNum==1) {console.log(this.publicationsAnalytics)}
      //          if (tabNum==2) {console.log(this.resourcesAnalytics)}
      //          if (tabNum==3) {console.log(this.projectsAnalytics)}
      //          if (tabNum==4) {console.log(this.positionsAnalytics)}
      //         }
      // );
    // }
  }

  ngAfterViewInit() {
    const breakCards = true;
    if (breakCards === true) {
      // We break the cards headers if there is too much stress on them :-)
      $('[data-header-animation="true"]').each(function(){
        const $fix_button = $(this);
        const $card = $(this).parent('.card');
        $card.find('.fix-broken-card').click(function(){
            const $header = $(this).parent().parent().siblings('.card-header, .card-image');
            $header.removeClass('hinge').addClass('fadeInDown');

            $card.attr('data-count', 0);

            setTimeout(function(){
                $header.removeClass('fadeInDown animate');
            }, 480);
        });

        $card.mouseenter(function(){
            const $this = $(this);
            const hover_count = parseInt($this.attr('data-count'), 10) + 1 || 0;
            $this.attr('data-count', hover_count);
            if (hover_count >= 20) {
                $(this).children('.card-header, .card-image').addClass('hinge animated');
            }
        });
      });
    }
  }

  startAnimationForLineChart(chart: any) {
   let seq: any, delays: any, durations: any;
   seq = 0;
   delays = 80;
   durations = 500;
   chart.on('draw', function(data: any) {
   if (data.type === 'line' || data.type === 'area') {
     data.element.animate({
       d: {
         begin: 600,
         dur: 700,
         from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
         to: data.path.clone().stringify(),
         easing: Chartist.Svg.Easing.easeOutQuint
       }
     });
   } else if (data.type === 'point') {
       seq++;
       data.element.animate({
         opacity: {
           begin: seq * delays,
           dur: durations,
           from: 0,
           to: 1,
           easing: 'ease'
         }
       });
     }
   });
   seq = 0;
  }

  startAnimationForBarChart(chart: any) {
   let seq2: any, delays2: any, durations2: any;
   seq2 = 0;
   delays2 = 80;
   durations2 = 500;
   chart.on('draw', function(data: any) {
     if (data.type === 'bar') {
         seq2++;
         data.element.animate({
           opacity: {
             begin: seq2 * delays2,
             dur: durations2,
             from: 0,
             to: 1,
             easing: 'ease'
           }
         });
     }
   });
   seq2 = 0;
  }

}
