export const apiURL: string = "https://backend2.bulletsecurity.net/api/";
export const siteUrl: string = "https://backend2.bulletsecurity.net/";
export const webURL: string = "https://backend2.bulletsecurity.net/";
export const reverbURL: string = "ws://127.0.0.1:9090/app/5mxcjujkte9st8o1af3q";

export const PUSHER_KEY: string = "ee1ca715631bfb7703eb";

// export const apiURL: string = "https://dev8.ivantechnology.in/appointmentschedulear/api/";
// export const siteUrl: string = "https://dev8.ivantechnology.in/appointmentschedulear/web/";
// export const webURL: string = "https://dev8.ivantechnology.in/appointmentschedulear/web/";
// export const PUSHER_KEY: string = "2dc7c0cd1c4e2806ce24";
export const PUSHER_CLUSTER: string = "ap2";
import * as moment from 'moment';

export function timeFormat(time: any) {
  let dt = moment();
  let year = parseInt(dt.format('YYYY'));
  let mm = parseInt(dt.format('MM'));
  let dd = parseInt(dt.format('DD'));
  let dt_time_in = time.split(":");
  let hh_time_in = parseInt(dt_time_in[0]);
  let ii_time_in = parseInt(dt_time_in[1]);
  let ss_time_in = parseInt(dt_time_in[2]);
  return new Date(year, (mm - 1), dd, hh_time_in, ii_time_in, ss_time_in)
}

