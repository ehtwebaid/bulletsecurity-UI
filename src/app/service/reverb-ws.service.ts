import { Injectable, EventEmitter } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
declare global {
  interface Window {
    Pusher: any;
  }
}
@Injectable({
  providedIn: 'root'
})
export class ReverbWsService {
public echo;
 constructor() {
    window.Pusher = Pusher;
    this.initializeEcho();
  }
  private initializeEcho() {

    this.echo = new Echo({
     broadcaster: 'reverb',
     key: '5mxcjujkte9st8o1af3q',
     wsHost: 'backend.risereno.ca',
     wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],

    });

    // Optional: Debug connection state
    this.echo.connector.pusher.connection.bind('connected', () => {
      console.log('Reverb Connected ✅');
    });

    this.echo.connector.pusher.connection.bind('disconnected', () => {
      console.log('Reverb Disconnected ❌');
    });
  }

  // PUBLIC CHANNEL
  listenPublic(channel: string, event: string, callback: (data: any) => void) {
    this.echo.channel(channel)
      .listen(event, callback);
  }

  // PRIVATE CHANNEL
  listenPrivate(channel: string, event: string, callback: (data: any) => void) {
    this.echo.private(channel)
      .listen(event, callback);
  }

  leave(channel: string) {
    this.echo.leave(channel);
  }

  disconnect() {
    this.echo.disconnect();
  }
}
