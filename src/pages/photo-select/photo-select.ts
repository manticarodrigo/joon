import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { ModalService } from '../../providers/modal-service';

@Component({
  selector: 'page-photo-select',
  templateUrl: 'photo-select.html'
})
export class PhotoSelectPage {

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController,
              private modalS: ModalService) {

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  imgTapped(url) {
    console.log("Image selected!");
    this.viewCtrl.dismiss(url);
  }

}