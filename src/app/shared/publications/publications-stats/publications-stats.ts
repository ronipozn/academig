import {Component, Input} from '@angular/core';
import * as Chartist from 'chartist';

declare const $: any;

@Component({
  selector: 'publications-stats',
  templateUrl: 'publications-stats.html'
})
export class PublicationsStatsComponent {
  @Input() statsData: number[];
  @Input() yearUniqs: any;
  @Input() mode: number = 0;

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

    const websiteViewsChart = new Chartist.Bar('#websiteViewsChart', dataWebsiteViewsChart, optionsWebsiteViewsChart, responsiveOptions);
    this.startAnimationForBarChart(websiteViewsChart);
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
