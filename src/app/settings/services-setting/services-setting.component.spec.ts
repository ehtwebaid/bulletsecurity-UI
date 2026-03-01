import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesSettingComponent } from './services-setting.component';

describe('ServicesSettingComponent', () => {
  let component: ServicesSettingComponent;
  let fixture: ComponentFixture<ServicesSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicesSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
