import {Component, Input} from '@angular/core';
import * as Chartist from 'chartist';

declare const $: any;

@Component({
  selector: 'compare-stats',
  templateUrl: 'compare-stats.html'
})
export class CompareStatsComponent {
  // @Input() statsData: number[];
  @Input() yearUniqs: any;
  @Input() index: number = 0;

  totalSum: number = 0;
  fiveYearsSum: number = 0;

  public ngOnInit() {
    let labels: string[] = [];
    let series: number[] = [];

    for (const [key, value] of Object.entries(this.yearUniqs)) {
      labels.push(key);
      series.push(Number(value));
      this.totalSum+=Number(value);
      if (Number(key)>=2015) this.fiveYearsSum+=Number(value);
    }

    const dataWebsiteViewsChart = {
      labels: labels.slice(-7),
      series: [series.slice(-7)]
    };
    const optionsWebsiteViewsChart = {
      axisX: { showGrid: false },
      low: 0,
      high: Math.max(...series.slice(-5))+5,
      chartPadding: { top: 0, right: 5, bottom: 0, left: 0}
    };
    const responsiveOptions: any = [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: { labelInterpolationFnc: function (value) { return value[0]; } }
      }]
    ];

    if (this.index==0) {
      const websiteViewsChart0 = new Chartist.Bar('#websiteViewsChart0', dataWebsiteViewsChart, optionsWebsiteViewsChart, responsiveOptions);
      this.startAnimationForBarChart(websiteViewsChart0);
    } else if (this.index==1) {
      const websiteViewsChart1 = new Chartist.Bar('#websiteViewsChart1', dataWebsiteViewsChart, optionsWebsiteViewsChart, responsiveOptions);
      this.startAnimationForBarChart(websiteViewsChart1);
    } else if (this.index==2) {
      const websiteViewsChart2 = new Chartist.Bar('#websiteViewsChart2', dataWebsiteViewsChart, optionsWebsiteViewsChart, responsiveOptions);
      this.startAnimationForBarChart(websiteViewsChart2);
    }
  }

  startAnimationForBarChart(chart: any) {
   let seq: any, delays: any, durations: any;
   seq = 0;
   delays = 80;
   durations = 500;
   chart.on('draw', function(data: any) {
     if (data.type === 'bar') {
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
}
