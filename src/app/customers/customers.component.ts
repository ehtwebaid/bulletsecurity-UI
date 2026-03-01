import { Component, OnInit,ViewChild, AfterViewInit,ElementRef  } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import {NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import{ webURL,apiURL } from 'src/app/global-constants';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { of } from "rxjs";
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter
} from "rxjs/operators";
import { fromEvent } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  userDetails: any = '';
  customerTbaactive = 1;
  exportLink=webURL+'exportData'
  customerForm:any= FormGroup;
  basicForm:any= FormGroup;
  mergeForm:any=FormGroup;
  customers:any=[];
  IsSubmitted: boolean=false;
  IsbasicSubmitted:boolean=false;
  deletedClients:any=[];
  searchFilter:any='';
  selected_customer:any='';
  names:any=[];
  mobiles:any=[];
  primary_contacts:any=[];
  alternate_names:any=[];
  alternate_mobiles:any=[];
  addresses:any=[];
  afuConfig = {
  uploadAPI: {
    url:null,
  },
  hideResetBtn: true,
  theme:'attachPin',
  formatsAllowed :".xls,.xlsx" ,
  maxSize:0.5,
  hideProgressBar: true,
  replaceTexts: {
    attachPinBtn: 'Import',

  }
};
  MergeSubmitted:boolean=false;
  page_no:any=0;
  rowsTotal:any='';
  itemsPerPage:any=15;
  p: number;
  @ViewChild('popover') public popover: NgbPopover;
  @ViewChild('MergeModal', { static: false }) private MergeModal:any;
  @ViewChild('movieSearchInput', { static: true }) movieSearchInput: ElementRef;
  toolbar = [
    ["bold", "italic", "underline"],
    ["blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ size: [] }], // custom dropdown
    [{ align: [] }],
    ["link"],
    ["emoji"],
    // link and image, video
  ];
  constructor(private router: Router,private commonservice: CommonService,private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,private modalService: NgbModal,private activatedRoute: ActivatedRoute) { }
  ngOnInit(): void {
    this.userDetails = JSON.parse(window.localStorage.getItem('userDetails'));
  this.customerForm = this.formBuilder.group({
      id: [''],
      name: [''],
      primary_contact_name: [''],
      mobile: [''],
      alternate_name: [''],
      alternate_mobile: [''],
      address: [''],
      city: [''],
      province: [''],
      postal_code: [''],
      notes: [''],
      customer_link:['']

    });
    this.mergeForm = this.formBuilder.group({

      name: [''],
      primary_contact_name: ['', Validators.required],
      mobile: [''],
      alternate_name: [''],
      alternate_mobile: [''],
      address: [''],
      customer_link:['']


    });
   this.basicForm = this.formBuilder.group({
      name: [''],
      mobile: [''],
      address: [''],
      notes: [''],
      primary_contact_name: [''],
      customer_link:['']


    });
   this.fetchCustomers();
   fromEvent(this.movieSearchInput.nativeElement, 'keyup').pipe(

    // get value
    map((event: any) => {
      return event.target.value;
    })
    // if character length greater then 2
    // , filter(res => res.length > 1)

    // Time in milliseconds between key events
    , debounceTime(1000)

    // If previous query is diffent from current
    , distinctUntilChanged()

    // subscription for response
  ).subscribe((text: string) => {

   this.fetchCustomers();

  });





  }
onSubmit():void{

this.IsSubmitted=true;

 if (this.customerForm.status == "VALID") {

     this.spinner.show('syncSpinner');

      this.commonservice.postData(this.customerForm.value, "addCustomer").subscribe(res => {

      this.spinner.hide('syncSpinner');

      if (res.status) {

      this.commonservice.showSuccess(res.message, "Customer");

      this.commonservice.newCustomer.next(this.customerForm.value);

      let index = this.customers.findIndex(item => item.id === parseInt(this.customerForm.value.id));

      this.customers[index]=this.customerForm.value;

      this.IsSubmitted=false;




      }
      else{
        let errors=res.error;

        for (let error of errors)
        {
         this.commonservice.showError(error, "Customer")
        }
       }
      },
        err => {
            this.spinner.hide('syncSpinner');
            if(err.status==401)
            {
             this.router.navigate(['/unauthorized']);
            }
            this.commonservice.showError(err.message, "Customer")

        });

 }


}

  fetchCustomers():void{
  let id=this.activatedRoute.snapshot.paramMap.get('id');
  let customer_id=id!=null?atob(id):0;
  let body = { page_no: this.page_no, itemsPerPage: this.itemsPerPage, name: this.searchFilter, id: customer_id };
    this.spinner.show('syncSpinner');
  this.commonservice.postData(body, "listCustomers").subscribe(res => {

  this.spinner.hide('syncSpinner');

  if (res.status) {

  this.customers=res.data.data;
  this.rowsTotal=res.rowsTotal;
  //this.exportExcel();
  if(this.customers.length>0)
  {
    this.selected_customer=this.customers[0].id;

  }

  this.customerDetail(this.customers[0] || {});
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
       this.router.navigate(['/unauthorized']);
      }
      this.commonservice.showError(err.message, "Customer")

  });
  }
  exportExcel()
  {
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('ProductData');
    worksheet.columns = [
      { header: 'SL', key: 'sl', width: 10 },
      { header: 'Name', key: 'name', width: 32 },
      { header: 'Primary Contact Name', key: 'primary_contact_name', width: 32 },
      { header: 'Primary Contact Mobile', key: 'mobile', width: 32 },
      { header: 'Alternate Contact Name', key: 'alternate_name', width: 32},
      { header: 'Alternate Contact Mobile', key: 'alternate_mobile', width: 32},
      { header: 'Notes', key: 'notes', width: 50},
      { header: 'Link', key: 'customer_link', width: 50},

      { header: 'Address', key: 'address', width: 50}
    ];
    let sl_no = 1;
    let id=this.activatedRoute.snapshot.paramMap.get('id');
    let customer_id=id!=null?atob(id):0;
    let body = {name: this.searchFilter, id: customer_id };
    this.spinner.show('syncSpinner');
    this.commonservice.postData(body, "all-customer").subscribe(res => {

    this.spinner.hide('syncSpinner');

    if (res.status) {

      let customers = res.data.data;
      customers.forEach(data => {
      let notes=data.notes!=null?data.notes.replace(/<[^>]*>/g, '\n'):'N/A';
      let row={sl:sl_no,name:data.name,primary_contact_name:data.primary_contact_name,mobile:data.mobile,
              alternate_name:data.alternate_name,alternate_mobile:data.alternate_mobile,notes:notes,address:data.address
              ,customer_link:data.customer_link
            };
      worksheet.addRow(row,"n");
      sl_no++;
    });

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'customer.xlsx');
    })

    }
    },
    err => {
        this.spinner.hide('syncSpinner');
        if(err.status==401)
        {
        this.router.navigate(['/unauthorized']);
        }
        this.commonservice.showError(err.message, "Customer")

    });


  }


  assignValue(customer:any,e:any):void{

  if(e.target.checked)
  {
      this.deletedClients.push(customer.id);

  }
  else{
      let index=this.deletedClients.indexOf(customer.id);
      this.deletedClients.splice(index, 1);

  }
  e.stopPropagation();

  }
deleteData()
{
  if(this.deletedClients.length>0)
  {
        this.spinner.show('syncSpinner');
        let body={ids:this.deletedClients};
        this.commonservice.postData(body, "deleteCustomer").subscribe(res => {

        this.spinner.hide('syncSpinner');

        if (res.status) {
        this.fetchCustomers();
        this.customerForm.reset();
        this.commonservice.newCustomer.next("");
        this.commonservice.showError(res.message, "Customer")


        }
        },
        err => {
            this.spinner.hide('syncSpinner');
            if(err.status==401)
            {
             this.router.navigate(['/unauthorized']);
            }
            this.commonservice.showError(err.message, "Customer")

        });
  }
  else{
    this.commonservice.showError("Please select atleast one customer", "Staff")
  }
}
customerDetail(customer:any)
{
  this.commonservice.newCustomer.next(customer);
  if(!this.isEmptyObject(customer))
  {
    this.customerForm.patchValue(customer);

  }
  else{
    this.customerForm.reset();
  }
  this.selected_customer=customer.id;

}
basicSubmit(pop:any)
{
    this.IsbasicSubmitted=true;
    if (this.basicForm.status == "VALID") {

     this.spinner.show('syncSpinner');



      this.commonservice.postData(this.basicForm.value, "addCustomer").subscribe(res => {

      this.spinner.hide('syncSpinner');


      if (res.status) {

      this.commonservice.showSuccess(res.message, "Customer");

      this.basicForm.reset();

      this.IsbasicSubmitted=false;
      pop.close();
      this.fetchCustomers();



      }
      else{
        let errors=res.error;

        for (let error of errors)
        {
         this.commonservice.showError(error, "Customer")
        }
       }
      },
        err => {
            this.spinner.hide('syncSpinner');
            if(err.status==401)
            {
             this.router.navigate(['/unauthorized']);
            }
            this.commonservice.showError(err.message, "Customer")

        });

 }
}


  importExcel(ev:any)
  {

    this.spinner.show('syncSpinner');
    let body={import_file:ev.target.files[0]};
    this.commonservice.postData(body, "importCustomer").subscribe(res => {
    this.spinner.hide('syncSpinner');
    if (res.status) {
      this.commonservice.showSuccess(res.message, "Customer");
      this.fetchCustomers();
      }
      },
      err => {
          this.spinner.hide('syncSpinner');
          if(err.status==401)
          {
           this.router.navigate(['/unauthorized']);
          }
          this.commonservice.showError(err.message, "Customer")

      });
  }
  mergeCustomer()
  {
    this.mergeForm.reset();
    if(this.deletedClients.length>1)
    {
      this.spinner.show('syncSpinner');

      let body={ids:this.deletedClients};
      this.commonservice.postData(body, "mergeCustomer").subscribe(res => {
      this.spinner.hide('syncSpinner');
      if (res.status) {

        this.names=res.data.names;
        this.mobiles=res.data.mobiles;
        this.primary_contacts=res.data.primary_contacts;
        this.alternate_names=res.data.alternate_names;
        this.alternate_mobiles=res.data.alternate_mobiles;
        this.addresses=res.data.addresses;
        let body={name:this.names[0],primary_contact_name:this.primary_contacts.length>0?this.primary_contacts[0]:'',
                 mobile:this.mobiles.length>0?this.mobiles[0]:'',alternate_name:this.alternate_names.length>0?this.alternate_names[0]:'',
                 alternate_mobile:this.alternate_mobiles.length>0?this.alternate_mobiles[0]:'',address:this.addresses.length>0?this.addresses[0]:''
        };

        this.mergeForm.patchValue(body);
        this.modalService.open(this.MergeModal,{ size:'sm' }).result.then((result) => {

        }, (reason) => {

           });
        }
      },
      err => {
          this.spinner.hide('syncSpinner');
          if(err.status==401)
          {
           this.router.navigate(['/unauthorized']);
          }
          this.commonservice.showError(err.message, "Customer")

      });
    }
    else{
      this.commonservice.showError("Please check more than one", "Customer")
    }
  }
  mergeData()
  {
    this.MergeSubmitted=true;
    if (this.mergeForm.status == "VALID") {

      this.spinner.show('syncSpinner');
      this.mergeForm.value.ids=this.deletedClients;
      this.commonservice.postData(this.mergeForm.value, "submitMerge").subscribe(res => {
      this.spinner.hide('syncSpinner');
      if (res.status) {

       this.commonservice.showSuccess(res.message, "Customer");
       this.mergeForm.reset();
       this.modalService.dismissAll();
       this.fetchCustomers();

       }
       else{
         let errors=res.error;

         for (let error of errors)
         {
          this.commonservice.showError(error, "Customer")
         }
        }
       },
         err => {
             this.spinner.hide('syncSpinner');
             if(err.status==401)
             {
              this.router.navigate(['/unauthorized']);
             }
             this.commonservice.showError(err.message, "Customer")

         });

  }

  }
  getPage(page) {
    console.log(page);
    this.page_no = (page-1)*this.itemsPerPage;
    this.fetchCustomers();
  }

  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
 }

}
