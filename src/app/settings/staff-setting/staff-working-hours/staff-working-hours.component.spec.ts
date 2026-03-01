import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffWorkingHoursComponent } from './staff-working-hours.component';

describe('StaffWorkingHoursComponent', () => {
  let component: StaffWorkingHoursComponent;
  let fixture: ComponentFixture<StaffWorkingHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffWorkingHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffWorkingHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
