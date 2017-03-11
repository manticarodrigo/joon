import { Injectable } from '@angular/core';
import { PopoverController } from 'ionic-angular';

@Injectable()
export class PopoverService {
  popover: any;
  options: Array<any>;
  isActive: boolean = false;

  constructor(private popoverCtrl: PopoverController) {
  }

  create(page) {
    this.popover = this.popoverCtrl.create(page);
  }

  present() {
    this.popover.present().then(() => {
      console.log("Popover presented!", this.options);
      this.isActive = true;
    });
  }

  dismiss() {
    this.popover.dismiss();
    this.isActive = false;
  }

}