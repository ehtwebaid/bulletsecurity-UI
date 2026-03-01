import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { apiURL, siteUrl } from '../global-constants';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class CommonService {
  token: any;
  constructor(private http: HttpClient, private toastr: ToastrService) { }
  public presentCustomer = new BehaviorSubject<any>('');
  public newAppointment = new BehaviorSubject<any>('');
  public newCustomer = new BehaviorSubject<any>('');
  public setDuration = new BehaviorSubject<any>('');
  public setNav = new BehaviorSubject<any>(1);
  public customerTab = new BehaviorSubject<any>(true);
  public viewStaff = new BehaviorSubject<any>('');
  public afterAppointment = new BehaviorSubject<any>('');
  public staffEdit = new BehaviorSubject<any>('');
  public clearSchedule = new BehaviorSubject<any>(false);
  public renderAvailable = new BehaviorSubject<any>(false);


  postData(body: any, url: any): Observable<any> {
    this.token = window.localStorage.getItem('authtoken');
    if (this.token == null) {
      this.token = "";
    }
    const webservice_path = apiURL;
    let form_data = new FormData();

    for (var key in body) {
      form_data.append(key, body[key]);
    }
    let httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Authorization': this.token
      })
    }
    return this.http.post(webservice_path + url, form_data, httpOptions)
  }

  postDataRaw(body: any, url: any): Observable<any> {
    this.token = window.localStorage.getItem('authtoken');
    if (this.token == null) {
      this.token = "";
    }
    const webservice_path = apiURL;

    let httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Authorization': this.token
      })
    }
    return this.http.post(webservice_path + url, body, httpOptions)
  }

  async postDataAsync(body: any, url: any): Promise<any> {
    this.token = window.localStorage.getItem('authtoken');
    if (this.token == null) {
      this.token = "";
    }
    const webservice_path = apiURL;
    let form_data = new FormData();

    for (var key in body) {
      form_data.append(key, body[key]);
    }
    let httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Authorization': this.token
      })
    }
    return await this.http.post(webservice_path + url, form_data, httpOptions).toPromise()
  }


  showSuccess(message: any, title: any) {
    this.toastr.success(message, title, { timeOut: 1000 })
  }

  showError(message: any, title: any) {
    this.toastr.error(message, title, { timeOut: 1000 })
  }

  showInfo(message: any, title: any) {
    this.toastr.info(message, title, { timeOut: 1000 })
  }

  showWarning(message: any, title: any) {
    this.toastr.warning(message, title, { timeOut: 1000 })
  }
  showReschedule(message: any, title: any) {
    const inserted = this.toastr.info(message, title, { disableTimeOut: true, closeButton: true });
    let toastId = inserted.toastId;
    inserted.onHidden.subscribe(result => {
      this.clearSchedule.next(true);
    })
  }
  clearToast() {
    this.toastr.clear();

  }
  uploadImage(file)
  {
    const webservice_path = apiURL;

    return new Promise((resolve, reject) => {
  
      if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') { // File types supported for image
        if (file.size < 1000000) { // Customize file size as per requirement
       
        // Sample API Call
          const uploadData = new FormData();
          uploadData.append('file', file, file.name);
  
          return this.http.post(webservice_path+'file-upload', uploadData).toPromise()
            .then(result => {
                let resp:any=result;
                return resp.url; // RETURN IMAGE URL from response
            })
            .catch(error => {
              reject('Upload failed'); 
              // Handle error control
              console.error('Error:', error);
            });
        } else {
          reject('Size too large');
         // Handle Image size large logic 
        }
      } else {
        reject('Unsupported type');
       // Handle Unsupported type logic
      }
    });
  }
}
