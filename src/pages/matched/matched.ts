import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { LoadingService } from '../../providers/loading-service';

/*
  Generated class for the Matched page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-matched',
  templateUrl: 'matched.html'
})
export class MatchedPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private loadingS: LoadingService) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad MatchedPage');
  }

  chat() {
    console.log("Chat pressed");
    // TODO: segue to chat
    this.dismiss;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
