import { Component, OnInit,ViewChild, AfterViewInit  } from '@angular/core';
import { CalendarOptions,FullCalendarComponent } from '@fullcalendar/angular'; // useful for typechecking
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CommonService } from '../../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
import CanvasJS from '../../../assets/js/canvasjs.min';
@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit  {

  selected_customer:any='';

  line_Points:any=[];

  pie_Points:any=[];

  line_chart:any;

  pie_chart:any;

  year_options:any=[];

  month_options:any=[];

  month:any;

  year:any;


  constructor(private router: Router,private commonservice: CommonService,private spinner: NgxSpinnerService) { }

  ngOnInit(): void {

  this.commonservice.newCustomer.subscribe(res => {
  this.spinner.show('syncSpinner');
  this.month='';
  this.year='';
  this.selected_customer=res;

   if(this.selected_customer.id!='')
   {
      this.Loading();

   }
  },
  err => {


  });

this.line_chart=new CanvasJS.Chart("chartContainer", {
                    animationEnabled: true,
                    theme: "light2",
                    title:{
                        text: ""
                    },
                    axisY: {
                      gridThickness: 0,
                      tickLength: 0,
                      lineThickness: 0,
                      labelFormatter: function(){
                        return " ";
                      },

                },
                data: [{
                        type: "line",
                        indexLabelFontSize: 16,

                }]
});
  this.pie_chart=new CanvasJS.Chart("piechartContainer", {

        animationEnabled: true,
        exportEnabled: false,

        title:{
                text: ""
        },
        legend: {
       verticalAlign: "center",  // "top" , "bottom"
       horizontalAlign:"right",
      itemWidth: 950,
     },
        data: [{
                type: "pie",
                showInLegend: true,

                toolTipContent: "<b>{name}</b>: {y} (#percent%)",
                indexLabel: "",
        }]
});
}

async statistics()
{
    let body={customer_id:this.selected_customer.id,month:this.month,year:this.year};

    await this.commonservice.postDataAsync(body, "statistics").then(res => {

    if (res.status) {

    this.line_Points=res.data.line_Points;
    this.pie_Points=res.data.pie_Points;

    this.line_chart.options.data[0].dataPoints=this.line_Points;

    this.pie_chart.options.data[0].dataPoints=this.pie_Points;

    this.pie_chart.options.colorSet="greenShades";

    this.line_chart.render();

    this.pie_chart.render();

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
async yaerOptions()
{
    let body={customer_id:this.selected_customer.id};
    await this.commonservice.postDataAsync(body, "yaerOptions").then(res => {
    if(res.status)
    {
        this.year_options=res.data.year_options;
        this.month_options=res.data.month_options;
        console.log("Before");

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
async Loading()
{
   await this.yaerOptions();
   console.log("after");
   this.statistics();
   this.spinner.hide('syncSpinner');
   console.log("Last");
}
async LoadingChart()
{
   this.spinner.show('syncSpinner');

   this.statistics();
   this.spinner.hide('syncSpinner');
   console.log("Last");
}
}
