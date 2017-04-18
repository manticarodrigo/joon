import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-photo-select',
  templateUrl: 'photo-select.html'
})
export class PhotoSelectPage {
  albums: Array<any>;
  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController) {
    this.albums = this.navParams.get('albums');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  imgTapped(url) {
    console.log("Image selected!");
    this.viewCtrl.dismiss(url);
  }

}