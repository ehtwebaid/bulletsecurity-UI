import { Component, OnInit,ViewChild, AfterViewInit  } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '../../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
    selected_customer:any='';
    noteForm:any= FormGroup;

  constructor(private router: Router,private commonservice: CommonService,private spinner: NgxSpinnerService,private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.noteForm = this.formBuilder.group({
      id: ['', Validators.required],
      notes: [''],
    });
    this.commonservice.newCustomer.subscribe(res => {
    this.selected_customer=res;
    this.noteForm.patchValue(this.selected_customer);
      },
      err => {


      });

  }
openEditor():void
{
    this.selected_customer.notes='';
}
onSubmit():void
{
    this.spinner.show('syncSpinner');
    this.commonservice.postData(this.noteForm.value, "editNote").subscribe(res => {
    this.spinner.hide('syncSpinner');
    if (res.status) {
    this.selected_customer.notes=this.noteForm.value.notes;
    this.commonservice.showSuccess(res.message, "Notes")
    }
    },
    err => {
        this.spinner.hide('syncSpinner');
        if(err.status==401)
        {
         this.router.navigate(['/unauthorized']);
        }
        this.commonservice.showError(err.message, "Notes")

    });
}

}
