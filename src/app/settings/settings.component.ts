import { Component, OnInit } from '@angular/core';
import { Router,Event, NavigationStart,NavigationEnd,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  currentRoute:any;
  userDetails:any;
  activeRoute:boolean=false;
  constructor(private router: Router,private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.userDetails=JSON.parse(window.localStorage.getItem('userDetails'));
    if(this.userDetails==null)
    {

        this.router.navigate(['/']);
    }

      let currentUrl=this.router.url.split("/")[2];
      if(currentUrl=='account-setting')
      {
          this.activeRoute=true;
      }
      else{
          this.activeRoute=false;
      }

    if(this.router.url=='/setting/account-setting')
    {
        if(this.userDetails.user_type=='admin')
        {
         //this.router.navigateByUrl('/setting/account-setting/account-preferences');
         this.router.navigateByUrl('/setting/staff-setting');

        }
        else{
            this.router.navigateByUrl('/setting/staff-setting');
        }

    }
    this.router.events.subscribe((event: Event) => {
   if (event instanceof NavigationEnd) {
       currentUrl=this.router.url.split("/")[2];
       if(currentUrl=='account-setting')
        {
            this.activeRoute=true;
        }
        else{
            this.activeRoute=false;
        }
       this.currentRoute=event.url;

       if(this.currentRoute=='/setting/account-setting')
       {

           if(this.userDetails.user_type=='admin')
        {
         ///this.router.navigateByUrl('/setting/account-setting/account-preferences');
         this.router.navigateByUrl('/setting/staff-setting');

        }
        else{
            this.router.navigateByUrl('/setting/staff-setting');
        }

       }
       else{
            this.router.navigateByUrl(this.currentRoute);
       }

    }


  });

  }

}
