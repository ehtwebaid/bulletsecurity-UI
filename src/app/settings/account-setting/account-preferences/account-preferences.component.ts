import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators,FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { CommonService } from '../../../service/common.service';
@Component({
  selector: 'app-account-preferences',
  templateUrl: './account-preferences.component.html',
  styleUrls: ['./account-preferences.component.css']
})
export class AccountPreferencesComponent implements OnInit {
  calnderForm: FormGroup;

  weeks:any=[{key:2,value:'Monday'},{key:3,value:'Tuesday'},{key:4,value:'Wednesday'},{key:5,value:'Thursday'},{key:6,value:'Friday'},{key:7,value:'Saturday'},{key:1,value:'Sunday'}];

  hours:any=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

  IsSubmitted:boolean=false;
  maxStaff:any;
  constructor(private router: Router,private commonservice: CommonService,private formBuilder: FormBuilder, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
  this.calnderForm = this.formBuilder.group({
      id: [''],
      default_mode: ['', Validators.required],
      week_start: [''],
      time_interval: ['', Validators.required],
      timepicker_interval: ['', Validators.required],
      start_hour: ['', Validators.required],
      end_hour: ['', Validators.required],
      default_color: ['', Validators.required],
      border_color: ['', Validators.required],
      completion_color: ['', Validators.required],
      no_emp: ['',Validators.required],
      calender_stats:['']

    });
    this.fetchSetting();
  }
 fetchSetting()
 {
     this.spinner.show('syncSpinner');

      this.commonservice.postData("", "setting/view").subscribe(res => {

      this.spinner.hide('syncSpinner');


      if (res.status) {
      res.data.start_hour=parseInt(res.data.start_hour);
      res.data.end_hour=parseInt(res.data.end_hour);
      this.calnderForm.patchValue(res.data);
      this.maxStaff=res.data.totalStaff;
      this.calnderForm.get('no_emp').setValidators([
                Validators.max(res.data.totalStaff)
            ]);
      this.calnderForm.get('no_emp').updateValueAndValidity();
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
 onSubmit()
 {
     this.IsSubmitted=true;
     if (this.calnderForm.status == "VALID") {

      this.spinner.show('syncSpinner');

      this.commonservice.postData(this.calnderForm.value, "setting/edit").subscribe(res => {

      this.spinner.hide('syncSpinner');


      if (res.status) {

      this.commonservice.showSuccess(res.message, "Preferences");

      this.IsSubmitted=false;

      }
      else{
        let errors=res.error;

        for (let error of errors)
        {
         this.commonservice.showError(error, "Staff")
        }
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
 active(event:any)
{
    if(event.target.checked)
    {
        this.calnderForm.value.calender_stats=1;
    }
    else{
        this.calnderForm.value.calender_stats=0;
    }
}
}
