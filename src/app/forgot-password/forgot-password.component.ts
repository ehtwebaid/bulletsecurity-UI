import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPassword!:FormGroup;
  IsSubmitted:any=false;

  constructor(private router: Router,private commonservice: CommonService,private formBuilder: FormBuilder, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.forgotPassword =  this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  forgotFormSubmit()
  {
    this.IsSubmitted=true;
    if (this.forgotPassword.status == "VALID") {
         this.spinner.show('syncSpinner');
         this.commonservice.postData(this.forgotPassword.value, "forgotPassword").subscribe(res => {
          this.spinner.hide('syncSpinner');
        if (res.status) {

          this.commonservice.showSuccess(res.message, "Forgot Password")
          this.forgotPassword.reset();
          this.IsSubmitted = false;
        }
        else {
          let errors = res.error;
          for (let error of errors) {
            this.commonservice.showError(error, "Login")
          }
          this.commonservice.showWarning(res.message, "Login")
        }
      },
        err => {
           this.spinner.hide('syncSpinner');
           this.commonservice.showError(err.message, "Login")

        });



    }
  }

}
