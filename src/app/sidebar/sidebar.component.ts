import { Component, OnInit } from '@angular/core';
import { Router,Event, NavigationStart,NavigationEnd,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  userDetails:any;
  activeRoute:boolean=false;
  constructor(private router: Router,private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
  let currentRoute=this.router.url.split("/")[1];
  if(currentRoute=='setting')
  {
      this.activeRoute=true;
  }
  else{
      this.activeRoute=false;
  }
  this.router.events.subscribe((event: Event) => {
   if (event instanceof NavigationEnd) {
   currentRoute=this.router.url.split("/")[1];
   if(currentRoute=='setting')
  {
      this.activeRoute=true;
  }
  else{
      this.activeRoute=false;
  }   
       
       
       
    }
     

  });
  this.userDetails=JSON.parse(window.localStorage.getItem('userDetails'));
   
  }

}
