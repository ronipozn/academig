import { Injectable }                  from '@angular/core';
import { Observable }                  from 'rxjs/Observable';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';

export interface Time {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Injectable()
export class TimerService {

  constructor() { }

  private createTimeObject(date: Date): Time {

    const now = new Date().getTime();
    const distance = date.getTime() - now;

    let time: Time = {days: 0, hours: 0, minutes: 0, seconds: 0};
    time.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    time.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    time.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    time.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    return time;
  }

  timer(date: Date): Observable<Time> {
      return Observable.interval(1000)
        .map(() => this.createTimeObject(date))
  }
}
