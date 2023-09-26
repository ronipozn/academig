import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

export interface Fruit {
  name: string;
}

@Component({
  selector: 'build-modal-text-field',
  templateUrl: 'build-text-field.html',
})
export class BuildTextFieldComponent implements OnInit, OnDestroy {
  @Output() select: EventEmitter <number> = new EventEmitter(true); // FIX: Delete???
  @Output() controlStatus: EventEmitter <boolean> = new EventEmitter(true);

  @Input() itemTitle: string;
  @Input() itemSmall: boolean = false;
  @Input() itemFirst: boolean = false;
  @Input() itemExplain: string = null;

  @Input() prepend: string; // placeholder

  @Input() iconTitle: string = null;
  @Input() iconType : boolean = false;

  @Input() labelHide: boolean = false;
  @Input() labelRequired: boolean = false;

  @Input() questionFlag: boolean = false;
  @Input() itemError: string = null;
  @Input() errorFlag : boolean = true;

  @Input() itemPlaceholder: string = null;
  @Input() itemSecondaryPlaceholder: string = null;
  @Input() onlyFromAutocomplete = false;
  @Input() maxItems: number = 0;

  @Input() itemValues: string [] = [];
  @Input() itemArray: string[] = [];

  @Input() fieldType = 0; // 0 - input text
                          // 1 - input typeSelected
                          // 2 - textArea
                          // 4 - select
                          // 5 - radio
                          // 6 - period
                          // 7 - checkboxes
                          // 8 - tags
                          // 11 - email
                          // 12 - trumbowyg
  @Input() typeSelected: string;
  @Input() textAreaRows = 4;

  @Input() parentGroup: FormGroup;
  @Input() controlName: string;

  @Input() set submitStatus(value: boolean) {
    this._controlStatus = value;
    this.changeStatus(this._controlStatus);
  }

  get submitStatus(): boolean {
    return this._controlStatus;
  }

  _controlStatus: boolean;
  _ignite: boolean = false;
  itemLength: number;
  multipleFilesString: string;

  subscription: Subscription;

  ngOnInit() {
    this.multipleFilesString = (this.fieldType == 10) ? 's' : '';

    this.subscription = this.parentGroup.controls[this.controlName].valueChanges.subscribe(data => {
      this._controlStatus = false;
      this.controlStatus.emit(false);
    })
  }

  onChange(selectValue: number) {
    this.select.emit(selectValue);
  }

  changeStatus(a: boolean) {
    if (this._ignite == false) {
      this._ignite = true;
    } else {
      this._controlStatus = true;
      this.controlStatus.emit(true);
    }
  }

  // isFieldValid(form: FormGroup, field: string) {
  //   return !form.get(field).valid && form.get(field).touched;
  // }
  //
  // displayFieldCss(form: FormGroup, field: string) {
  //   return {
  //     'has-error': this.isFieldValid(form, field),
  //     'has-feedback': this.isFieldValid(form, field)
  //   };
  // }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  splitPattern = new RegExp('[\,\;]'); // https://stackoverflow.com/questions/54811105/paste-split-pattern-for-ngx-chips-angular
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  addChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    const values = this.parentGroup.get(this.controlName).value || [];

    if ((value || '').trim() && (values.length<this.maxItems || this.maxItems==0)) {
      this.parentGroup.controls[this.controlName].setValue(values.concat(value));
      this.parentGroup.controls[this.controlName].updateValueAndValidity();
    }

    if (input) { // Reset the input value
      input.value = '';
    }
  }

  removeChip(value: string): void {
    const values = this.parentGroup.controls[this.controlName].value;
    const index = values.indexOf(value);

    if (index>=0) {
      this.parentGroup.controls[this.controlName].setValue(values.filter(v=>v!==value));
      this.parentGroup.controls[this.controlName].updateValueAndValidity();
    }
  }

}
