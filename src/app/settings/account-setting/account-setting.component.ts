import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.css']
})
export class AccountSettingComponent implements OnInit {
  userDetails:any;
  constructor() { }

  ngOnInit(): void {
   this.userDetails=JSON.parse(window.localStorage.getItem('userDetails'));    
      
      
  }


}
