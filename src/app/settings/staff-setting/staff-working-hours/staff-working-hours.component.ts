import { Component, OnInit,ElementRef,ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators,FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';

import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-staff-working-hours',
  templateUrl: './staff-working-hours.component.html',
  styleUrls: ['./staff-working-hours.component.css']
})
export class StaffWorkingHoursComponent implements OnInit {

  constructor(private router: Router,private commonservice: CommonService,private formBuilder: FormBuilder, private spinner: NgxSpinnerService) { }
  select_staff:any;
  workinghours:any=[];
  workinghourForm: FormGroup;
  userDetails:any;
  @Output() clearAvailable=new EventEmitter();
  ngOnInit(): void {
  this.userDetails=JSON.parse(window.localStorage.getItem('userDetails'));
  this.commonservice.viewStaff.subscribe(body => {
    this.select_staff=body;
    this.fetchWorkinghours();
    this.workinghourForm = this.formBuilder.group({workinghours:this.formBuilder.array([])})
    })
  }
  fetchWorkinghours()
  {
      this.spinner.show('syncSpinner');

      let body={user_id:this.select_staff.id};

      this.commonservice.postData(body, "viewSchedule").subscribe(res => {

      this.spinner.hide('syncSpinner');


      if (res.status) {

      this.workinghours=res.data;
      let tmp_hour = this.workinghourForm.get('workinghours') as FormArray
      this.workinghours.forEach(item=>{
      let hourForm=this.newHour();
      hourForm.patchValue(item);
      tmp_hour.push(hourForm);
      });


      }

      },
        err => {
            this.spinner.hide('syncSpinner');
            if(err.status==401)
            {
             this.router.navigate(['/unauthorized']);
            }
            this.commonservice.showError(err.message, "Staff")

        });
  }
  newHour(): FormGroup {
  return this.formBuilder.group({
    id: [''],
    start_time: [''],
    end_time: [''],
    day_name:[''],
    is_weekday:[1]


  });
}
onSubmit()
{
   this.spinner.show('syncSpinner');


    this.commonservice.postDataRaw(this.workinghourForm.value, "setSchedule").subscribe(res => {

    this.spinner.hide('syncSpinner');


    if (res.status) {

    this.commonservice.showSuccess(res.message, "Working Hour")  ;
    this.clearAvailable.emit();
    this.commonservice.renderAvailable.next(true);

    }

    },
      err => {
          this.spinner.hide('syncSpinner');
          if(err.status==401)
          {
           this.router.navigate(['/unauthorized']);
          }
          this.commonservice.showError(err.message, "Staff")

      });
}

}
