import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'page-maintenance',
  templateUrl: 'maintenance.html'
})
export class MaintenancePage {

  android = false;

  constructor(private platform: Platform) {
    if (this.platform.is('android')) {
      this.android = true;
    }
  }
}