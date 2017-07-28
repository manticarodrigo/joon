import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

@Component({
  selector: 'page-updating',
  templateUrl: 'updating.html'
})
export class UpdatingPage {
  user: any;
  constructor(private navParams: NavParams) {
    this.user = this.navParams.get('user');
  }
}