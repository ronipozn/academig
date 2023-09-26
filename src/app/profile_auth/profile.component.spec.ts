import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileAuthComponent } from './profile.component';

describe('ProfileAuthComponent', () => {
  let component: ProfileAuthComponent;
  let fixture: ComponentFixture<ProfileAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileAuthComponent],
      imports: [ ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileAuthComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
