import { Component, OnInit } from '@angular/core';
import { Router,Event } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import { ReverbWsService } from '../service/reverb-ws.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router,private commonservice: CommonService,private reverb: ReverbWsService) { }

  ngOnInit(): void {
    this.router.events.subscribe((event: Event) => {
    this.commonservice.clearToast();

  });
  let self_current = this;


  let userDetails=JSON.parse(window.localStorage.getItem('userDetails'));
  this.reverb.listenPublic('forceLogout', '.forceLogoutData', (resp: any) => {
  if(+resp?.data?.user_id==userDetails.id)
    {
      this.logOut();

    }

});

  }
  logOut():void
  {
    this.commonservice.postData("", "logOut").subscribe(res => {

      if (res.status) {

      this.commonservice.showSuccess(res.message, "Logout");
      window.localStorage.clear();
      this.router.navigate(['/'])
      }
      else{
        let errors=res.error;

        for (let error of errors)
        {
         this.commonservice.showError(error, "Logout")
        }
       }
      },
        err => {
            if(err.status==401)
            {
             this.router.navigate(['/unauthorized']);
            }
            this.commonservice.showError(err.message, "Password")

        });

  }

}
