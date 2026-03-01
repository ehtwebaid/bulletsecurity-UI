import { Component, OnInit } from '@angular/core';
import { Router,Event } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import Pusher from "src/assets/js/pusher.min";
import { PUSHER_KEY, PUSHER_CLUSTER } from "src/app/global-constants";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router,private commonservice: CommonService) { }

  ngOnInit(): void {
    this.router.events.subscribe((event: Event) => {
    this.commonservice.clearToast();

  });
  let pusher_key = PUSHER_KEY;
  let pusher_cluster = PUSHER_CLUSTER;
  let self_current = this;

  var pusher = new Pusher(pusher_key, {
    cluster: pusher_cluster,
  });
  var channel = pusher.subscribe("my-channel");
  let userDetails=JSON.parse(window.localStorage.getItem('userDetails'));
  channel.bind("my-event", function (data) {
    let resp = JSON.parse(data);

    if(+resp?.data?.user_id==userDetails.id && resp?.data?.type=='force_log_out')
    {

      self_current.logOut();
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
