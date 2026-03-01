import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {

  staffForm:any=FormGroup;

  IsSubmitted:any=false;

  access_levels:any=[{key:'one_day_view',value:'View Only Day Only'},{key:'view_all',value:'View All Staff'},{key:'edit',value:'Edit And View All Staff'}];

  userDetails:any;

  constructor(private router: Router,private commonservice: CommonService,private formBuilder: FormBuilder, private spinner: NgxSpinnerService) {

  }

  ngOnInit(): void {

    this.userDetails=JSON.parse(window.localStorage.getItem('userDetails'));
    this.commonservice.viewStaff.subscribe(body => {
    this.staffForm =  this.formBuilder.group({
      id: [""],
      name: ["",Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ["",Validators.required],
      phone_no: [''],
      current_status:[0],
      comments:[''],
      user_type:[null],
      require_estimate:[0],
      Log_Out_User:[0]

    })
    this.staffForm.patchValue(body);
    if(body!='')
    {

      this.staffForm.get('password').clearValidators();
      this.staffForm.get('password').updateValueAndValidity();

    }
    })
    this.staffForm.get("Log_Out_User").valueChanges.subscribe(value => {
      console.log('Name changed to:', value);
    })
  }
  forceLogout()
  {
    this.spinner.show('syncSpinner');
    this.commonservice.postData({user_id:this.staffForm.value?.id}, "forceLogout").subscribe(res => {
    this.spinner.hide('syncSpinner');
    if (res.status) {
    this.commonservice.showSuccess(res.message, "Staff");

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
onSubmit():void{

this.IsSubmitted=true;

 if (this.staffForm.status == "VALID") {

     this.spinner.show('syncSpinner');



      this.commonservice.postData(this.staffForm.value, "addStaff").subscribe(res => {

      this.spinner.hide('syncSpinner');


      if (res.status) {

      this.commonservice.showSuccess(res.message, "Staff");
      this.commonservice.staffEdit.next(res.data);
      this.IsSubmitted=false;
      if(this.staffForm.value.id=='')
      {
      this.staffForm.reset();
      this.staffForm.patchValue({current_status:0,require_estimate:0});

      }

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
        this.staffForm.value.current_status=1;
    }
    else{
        this.staffForm.value.current_status=0;
    }
}
requireEstimate(event:any)
{
    if(event.target.checked)
    {
        this.staffForm.value.require_estimate=1;
    }
    else{
        this.staffForm.value.require_estimate=0;
    }
}
changeRole(event:any)
{
    if(event.target.checked)
    {
      this.staffForm.value.user_type="admin";
    }
    else{
      this.staffForm.value.user_type="staff";
    }
}


}
