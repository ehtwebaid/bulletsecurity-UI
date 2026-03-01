import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonappointmentComponent } from './commonappointment.component';

describe('CommonappointmentComponent', () => {
  let component: CommonappointmentComponent;
  let fixture: ComponentFixture<CommonappointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonappointmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
