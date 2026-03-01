import { Component, OnInit,ElementRef,ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../service/common.service';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import {NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';

import { NgxSpinnerService } from "ngx-spinner";
import moment from 'moment';

declare var $: any;

@Component({
  selector: 'app-staff-setting',
  templateUrl: './staff-setting.component.html',
  styleUrls: ['./staff-setting.component.css'],
  encapsulation: ViewEncapsulation.None // this is the default encapsulation for the angular component

})
export class StaffSettingComponent implements OnInit {

  customerTbaactive = 1;

  staffs:any=[];

  selected_staff:any;

  select_class:any;

  staffForm:any=FormGroup;

  IsSubmitted:any=false;

  userDetails:any;

  initialIndex:any;
  deletedStaffs:any=[];
  dropped_staff:any='';
  dropped_staff_tmp:any='';
  sorted_items:any=[];
  access_levels:any=[{key:'one_day_view',value:'View Only Day Only'},{key:'view_all',value:'View All Staff'},{key:'edit',value:'Edit And View All Staff'}];
  @ViewChild('popover') public popover: NgbPopover;
  commonAvailable:any='';
  available_date_format:any='';
  showLoading:any=false;
  showAlert:any=false;
  constructor(private router: Router,private commonservice: CommonService,private formBuilder: FormBuilder, private spinner: NgxSpinnerService,
    private confirmationDialogService: ConfirmationDialogService,private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.userDetails=JSON.parse(window.localStorage.getItem('userDetails'));
    this.Loading();
    this.staffForm =  this.formBuilder.group({
      name: ["",Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ["",Validators.required],
      phone_no: [''],
      user_type:['staff']


    })
     this.commonservice.staffEdit.subscribe(res => {
      if(res!='')
      {
          let index = this.staffs.findIndex(item => item.id === parseInt(res.id));
          this.staffs[index]=res;
          this.commonservice.staffEdit.next('');
      }
      },
      err => {
      });

      this.commonservice.renderAvailable.subscribe(res => {
      if(res)
      {
        if(this.commonAvailable!="")
        {
          this.fetchcommonAvailable();
        }
        this.commonservice.renderAvailable.next(false);
      }
      });
  }

  async fetchStaffs()
  {
      let self=this;

       await this.commonservice.postDataAsync("", "listStaff").then(res => {
        if (res.status) {
        this.staffs=res.data;
        $( "#sortable" ).sortable({

          stop: function( event, ui ) {
            self.sorted_items=[];
            $( "#sortable li" ).each(function( index ) {

              self.sorted_items.push($(this).attr("id"));
            });
            self.moveElement();
          }
        });



        let openPopuop=window.localStorage.getItem('openPopuop');
        if(openPopuop!=null)
        {
          this.popover.open();
          window.localStorage.removeItem("openPopuop");
        }
        }
      },
        err => {
            this.spinner.hide('syncSpinner');
            if(err.status==401)
            {
              window.localStorage.clear();
              this.commonservice.showError("Please Login First", "Staff")
              this.router.navigate(['/']);
            }


        });
  }
  async Loading()
 {
   this.spinner.show('syncSpinner');
   await this.fetchStaffs();
   this.selected_staff=this.staffs[0];
   this.commonservice.viewStaff.next(this.selected_staff);
   this.spinner.hide('syncSpinner');
 }
  staffDetail(staff:any)
  {

      this.selected_staff=staff;
      this.commonservice.viewStaff.next(staff);
  }
  async addStaff(pop:any)
  {
      this.IsSubmitted=true;

      if (this.staffForm.status == "VALID") {

      this.spinner.show('syncSpinner');

      await this.commonservice.postDataAsync(this.staffForm.value, "addStaff").then(res => {

      this.spinner.hide('syncSpinner');


      if (res.status) {

      this.commonservice.showSuccess(res.message, "Staff");

      this.IsSubmitted=false;

      this.commonservice.staffEdit.next({id:res.data.id,name:res.data.name,user_type:res.data.user_type});

      this.staffForm.reset();
      this.staffForm.patchValue({user_type:'staff'});
       pop.close()  ;


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
   await this.fetchStaffs();
   this.selected_staff=this.staffs[0];
   this.commonservice.viewStaff.next(this.selected_staff);
   this.spinner.hide('syncSpinner');


 }
 }
 deleteData(id:any='',event:any='')
 {
     event.stopPropagation();
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to Remove this... ?')

     .then((confirmed) => {

     if(confirmed) {

      this.spinner.show('syncSpinner');

      let body={ids:id};

     this.commonservice.postData(body, "deleteStaff").subscribe(res => {

      this.spinner.hide('syncSpinner');

      if (res.status) {

      this.commonservice.showError(res.message, "Staff")

      this.Loading();

      }
      },
      err => {
          this.spinner.hide('syncSpinner');
          if(err.status==401)
          {
           this.router.navigate(['/unauthorized']);
          }
          this.commonservice.showError(err.message, "Calender")

      });


     }


     })

     .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
 }

 moveElement() {


    this.spinner.show('syncSpinner');

      let body={staffs:this.sorted_items};

     this.commonservice.postData(body, "sortOrder").subscribe(res => {

      this.spinner.hide('syncSpinner');

      if (res.status) {
        this.selected_staff=this.staffs[0];
        this.commonservice.viewStaff.next(this.selected_staff);
        this.dropped_staff=this.dropped_staff_tmp;

      }
      },
      err => {
          this.spinner.hide('syncSpinner');
          if(err.status==401)
          {
           this.router.navigate(['/unauthorized']);
          }
          this.commonservice.showError(err.message, "Calender")

      });

}

assignValue(staff:any,e:any):void{

  if(e.target.checked)
  {
      this.deletedStaffs.push(staff.id);

  }
  else{
      let index=this.deletedStaffs.indexOf(staff.id);
      this.deletedStaffs.splice(index, 1);

  }
  if(this.deletedStaffs.length>0)
  {
    this.fetchcommonAvailable();
    this.staffDetail(this.staffs.find(x=>x.id== this.deletedStaffs.slice(-1)));
    this.showAlert=true;

  }
  else{
    this.commonAvailable="";
    this.staffDetail(this.staffs[0]);
    this.showAlert=false;
  }
  e.stopPropagation();

  }

  fetchcommonAvailable()
  {
    this.showLoading=true;
    this.showAlert=true;
    this.commonservice.postData({ids:this.deletedStaffs}, "staffAvailability").subscribe(res => {
      this.showLoading=false;
      if (res.status) {

      this.commonAvailable= res.data;
      this.available_date_format=res.formatted_date;
      }
      },
      err => {
         this.showLoading=false;

          if(err.status==401)
          {
           this.router.navigate(['/unauthorized']);
          }
          this.commonservice.showError(err.message, "Calender")

      });
  }
  deleteAll()
  {
    if(this.deletedStaffs.length==0)
    {
      this.commonservice.showError("Please select atleast one staff", "Staff");
    }
    else{
      this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to Remove All... ?')

      .then((confirmed) => {

      if(confirmed) {

       this.spinner.show('syncSpinner');

       let body={ids:this.deletedStaffs};

      this.commonservice.postData(body, "deleteStaff").subscribe(res => {

       this.spinner.hide('syncSpinner');

       if (res.status) {

       this.commonservice.showError(res.message, "Staff")

       this.Loading();

       }
       },
       err => {
           this.spinner.hide('syncSpinner');
           if(err.status==401)
           {
            this.router.navigate(['/unauthorized']);
           }
           this.commonservice.showError(err.message, "Calender")

       });


      }


      })

      .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
    }

  }
  active(event:any)
{
    if(event.target.checked)
    {
        this.staffForm.value.user_type="admin";
    }
    else{
        this.staffForm.value.user_type="staff";
    }
}

rediretCalender(calender_date:any)
{

 window.localStorage.setItem("selectedMoment", this.available_date_format);
 this.router.navigateByUrl('calender');
}
}
