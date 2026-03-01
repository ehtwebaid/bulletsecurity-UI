import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicReportingComponent } from './basic-reporting.component';

describe('BasicReportingComponent', () => {
  let component: BasicReportingComponent;
  let fixture: ComponentFixture<BasicReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicReportingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
