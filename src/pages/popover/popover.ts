import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { PopoverService } from '../../providers/popover-service';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html'
})
export class PopoverPage {
options: Array<any>;
  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController,
              private popoverS: PopoverService) {
                this.options = this.popoverS.options;
                console.log(this.options);
  }

  select(option) {
    this.viewCtrl.dismiss(option);
  }

}