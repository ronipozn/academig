import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {OpenPositionDetails, OpenPositionService} from '../../../services/position-service';

import {itemsAnimation} from '../../../animations/index';

import * as Chartist from 'chartist';
import * as moment from 'moment';

@Component({
  selector: 'position-stats',
  templateUrl: 'position-stats.html',
  styleUrls: ['position-stats.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PositionStatsComponent {
  @Input() parentId: string;
  @Input() projId: string;
  @Input() created_on: string;

  stats: number[][][];
  tab: number

  statsChannels = ["Organic", "Facebook", "Twitter", "Linkedin", "Slack", "Academig Newsletter"];
  // "Total"
  statsColors = ["#00BCD4", "#F44336", "#FF9800", "#D17905", "#453D3F", "#59922B", "#000000"];

  constructor(private titleService: Title, private openPositionService: OpenPositionService) {}

  async ngOnInit() {
    this.stats = await this.openPositionService.getPositionStats(this.projId, this.parentId);
    this.updateCharts(0);
  }

  updateCharts(tab: number) {
    this.tab = tab;

    var dates: string[] = [];
    var series: number[][] = [];
    var sums: number[] = [];

    this.stats.forEach((stat, index) => {
      series[index] = stat.map(r => (r ? Number(r[this.tab]) : 0));
      dates[index] = moment(this.created_on).add((index+1)*2, 'weeks').format("DD MMM YYYY");
    });

    // https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
    series = series[0].map((col, i) => series.map(row => row[i]));

    series.forEach((s, index) => {
      sums[index]=s.reduce((a, b) => a + b, 0)
    });

    // console.log("series",series)
    // console.log("sums",sums)

    this.barChart(dates, series);
    this.pieChart(sums);
  }

  barChart(dates: string[], series: number[][]) {
    const dataColouredBarsChart = {
      labels: dates, // ['\'06'],
      series: series
    };

    const optionsColouredBarsChart: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 10
      }),
      axisY: {
        showGrid: true,
        offset: 40
      },
      axisX: {
        showGrid: false,
      },
      low: 0,
      high: 500,
      showPoint: true,
      height: '300px'
    };

    const colouredBarsChart = new Chartist.Line('#colouredBarsChart', dataColouredBarsChart, optionsColouredBarsChart);

    this.startAnimationForLineChart(colouredBarsChart);
  }

  pieChart(sums: number[]) {
    const total = sums.reduce((a, b) => a + b, 0);

    const dataPreferences = {
      labels: sums.map(sum => (sum*100/total).toFixed(1) + '%'),
      series: sums
    };

    const optionsPreferences = {
      height: '230px'
    };

    new Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
  }

  startAnimationForLineChart(chart: any) {
    let seq: number, delays: number, durations: number;
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

}
