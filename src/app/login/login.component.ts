import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm:any=FormGroup;
  IsSubmitted:any=false;
  constructor(private router: Router,private commonservice: CommonService,
  private formBuilder: FormBuilder, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    //window.localStorage.clear();
    if(typeof window.localStorage.getItem('userDetails') == 'undefined')
    {
      window.localStorage.clear();
    }
    let userDetails=JSON.parse(window.localStorage.getItem('userDetails'));
    if(userDetails!=null)
    {
        this.router.navigateByUrl('calender');
    }
    this.loginForm =  this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    })
  }


  loginFormSubmit()
  {
     this.IsSubmitted=true;
    if (this.loginForm.status == "VALID") {
         this.spinner.show('syncSpinner');
         this.commonservice.postData(this.loginForm.value, "login").subscribe(res => {
          this.spinner.hide('syncSpinner');
        if (res.status) {

          this.commonservice.showSuccess(res.message, "Login")
          this.loginForm.reset();
          this.IsSubmitted = false;
          window.localStorage.setItem('userDetails', JSON.stringify(res.data.user));
          window.localStorage.setItem('authtoken', res.data.token);
          let userDetails=res.data.user;
          this.router.navigateByUrl('calender');


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
