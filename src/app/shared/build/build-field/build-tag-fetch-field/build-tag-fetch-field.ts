import {Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl, FormGroup} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable, from, of} from 'rxjs';
import {startWith, catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';

import {PeopleService} from '../../../services/people-service';
import {objectMini} from '../../../services/shared-service';

@Component({
  selector: 'build-tag-fetch-field',
  templateUrl: 'build-tag-fetch-field.html'
})
export class BuildTagFetchFieldComponent implements OnInit {
  @Input() type: number = 0;

  @Input() itemTitle: string;
  @Input() itemExplain: string = null;
  @Input() itemPlaceholder: string = null;

  @Input() nonremovableItems: number = 0;
  @Input() maxItems: number = 0;
  @Input() labelRequired: boolean = false;
  @Input() nonaddItems: boolean = false;

  @Input() parentGroup: FormGroup;
  @Input() controlName: string;

  @Output() tags: EventEmitter <any[]> = new EventEmitter();
  @Output() action: EventEmitter <{name: string, type: number}> = new EventEmitter();

  @Input() set submitStatus(value: number) {
    if (value>0) {
      this.tags.emit(this.fruits);
    }
  }

  queryFlag = false;
  visible = true;
  selectable = true;
  removable = true;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits: Observable<string[]>;
  fruits: objectMini[] = [];

  @ViewChild('fruitInput', { static: true }) fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

  constructor(private peopleService: PeopleService) { }

  ngOnInit() {
    const values = this.parentGroup.controls[this.controlName].value;
    // console.log('values',values)
    this.fruits = values || [];
    // if (values) {
    //   values.forEach((name) => {
    //     this.fruits.push({"_id": null, "name": name.trim(), "pic": null});
    //   });
    // }

    this.filteredFruits = this.parentGroup.controls[this.controlName].valueChanges.pipe(
      startWith(null),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.queryFlag = true),
      switchMap(term =>
        from(this.peopleService.getPeoples(3, term, null, 0, 1))
        .map(data => {
          return (Array.isArray(data)) ? data.filter(r => !this.fruits.map(r=>r.name).includes(r.name)) : []
        })
      ),
      tap(() => this.queryFlag = false)
    )
    // map((fruit: string | null) => fruit ? this._filter(fruit) : this.allFruits.slice()));
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      if (!this.fruits.map(r=>r.name).includes(value.trim()) && (this.maxItems==0 || (this.maxItems>0 && this.fruits.length===0))) { // avoid duplicates
        this.fruits.push({"_id": null, "name": value.trim(), "pic": null});
        if (this.type==1) this.action.emit({"name": this.fruits[this.fruits.length-1].name, "type": 1});
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.parentGroup.controls[this.controlName].setValue(this.fruits);
  }

  remove(fruit: objectMini): void {
    const index = this.fruits.map(r=>r.name).indexOf(fruit.name);

    if (index>=0) {
      this.fruits.splice(index, 1);
      if (this.type==1 && fruit._id==null) this.action.emit({"name": fruit.name, "type": 0});
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // console.log('event.option.viewValue',event.option.value)
    if (!this.fruits.map(r=>r.name).includes(event.option.value) && (this.maxItems==0 || (this.maxItems>0 && this.fruits.length===0))) { // avoid duplicates
      this.fruits.push(event.option.value);
      // this.fruits.push(event.option.viewValue);
      this.fruitInput.nativeElement.value = '';
      this.parentGroup.controls[this.controlName].setValue(this.fruits);
    }
    // if (this.type==1) this.tags.emit(event.option.value);
  }

  // private _filter(value: string): string[] {
  //   const filterValue = value.toLowerCase();
  //
  //   return this.allFruits.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  // }

}
