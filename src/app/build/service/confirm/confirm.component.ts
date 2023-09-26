import {Component, Input} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'confirm',
  templateUrl: 'confirm.html',
  styleUrls: ['confirm.css']
})
export class ConfirmComponent {
  fragment: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => this.fragment = fragment);
  }
}
