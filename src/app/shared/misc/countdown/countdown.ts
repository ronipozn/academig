import {Component, Input} from '@angular/core';

import { Observable, timer, NEVER, BehaviorSubject, fromEvent, of } from 'rxjs';
import { map, tap, takeWhile, share, startWith, switchMap, filter } from 'rxjs/operators';

import {complexName} from '../../services/shared-service';

@Component({
    selector: 'countdown',
    templateUrl: 'countdown.html',
    styleUrls: ['countdown.css']
})
export class CountdownComponent {
  // @Input() timeleft: number;
  @Input() deadline: number;
  @Input() mode: number = 0;

  counters: number[] = [0,0,0,0];

  timeleft: number;

  ngOnInit() {
    const toggle$ = new BehaviorSubject(true);

    this.timeleft = Math.floor((new Date(this.deadline).getTime()-Date.now())/1000);

    // console.log('timeleft',this.timeleft)

    const K = 1000;
    const INTERVAL = K;
    const MINUTES = 1;
    // const TIME = MINUTES * K * 60;
    const TIME = this.timeleft * K;

    let current: number;
    let time = TIME;

    const toMinutesDisplay = (ms: number) => Math.floor(ms / K / 60);
    const toSecondsDisplay = (ms: number) => Math.floor(ms / K) % 60;

    const toSecondsDisplayString = (ms: number) => {
      const seconds = toSecondsDisplay(ms);
      return seconds < 10 ? `0${seconds}` : seconds.toString();
    };

    const currentSeconds = () => time / INTERVAL;
    const toMs = (t: number) => t * INTERVAL
    const toRemainingSeconds = (t: number) => currentSeconds() - t;

    const remainingSeconds$ = toggle$.pipe(
      switchMap((running: boolean) => (running ? timer(0, INTERVAL) : NEVER)),
      map(toRemainingSeconds),
      takeWhile(t => t >= 0),
    );

    const ms$ = remainingSeconds$.pipe(
      map(toMs),
      tap(t => current = t)
    );

    const minutes$ = ms$.pipe(
      map(toMinutesDisplay),
      map(s => s.toString()),
      startWith(toMinutesDisplay(time).toString())
    );

    const seconds$ = ms$.pipe(
      map(toSecondsDisplayString),
      startWith(toSecondsDisplayString(time).toString())
    );

    // update DOM
    // const minutesElement = document.querySelector('.minutes');
    // const secondsElement = document.querySelector('.seconds');
    const toggleElement = document.querySelector('.timer');

    this.updateDom(minutes$, 2);
    this.updateDom(seconds$, 3);

    // set click events
    // fromEvent(toggleElement, 'click').subscribe(() => {
    //   toggle$.next(!toggle$.value);
    // });

    // update current time on clicks
    // toggle$.pipe(
    //   filter((toggled: boolean) => !toggled)
    // ).subscribe(() => {
    //   time = current;
    // });

    // remainingSeconds$.subscribe({
    //   complete: () => this.updateDom(of('Contest finished!'), toggleElement)
    // });
  }

  updateDom(source$: Observable<string>, i: number) {
  // updateDom(source$: Observable<string>, element: Element) {
    // source$.subscribe((value) => element.innerHTML = value);
    source$.subscribe((value) => this.counters[i] = Number(value));
  }
}
