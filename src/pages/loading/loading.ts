import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-loading',
  templateUrl: 'loading.html'
})
export class LoadingPage {
  user: any;
  message: any;
  constructor(private navParams: NavParams) {
    this.user = this.navParams.get('user');
    this.message = this.navParams.get('message');
  }

}