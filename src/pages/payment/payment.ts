import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, Platform } from 'ionic-angular';

import { PaymentService } from '../../providers/payment-service';
import { DiscoverService } from '../../providers/discover-service';

@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html'
})
export class PaymentPage {
  products: Array<any>;
  user: any;
  discovering = false;
  android = false;
  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController,
              private platform: Platform,
              private paymentS: PaymentService,
              private discoverS: DiscoverService) {
    this.user = this.navParams.get('user');
    this.discovering = this.navParams.get('discovering');
    this.loadProducts();
    if (this.platform.is('android')) {
      this.android = true;
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  loadProducts() {
    this.paymentS.fetchProducts()
    .then(products => {
      this.products = products;
    })
    .catch(error => {
      console.log(error);
    });
  }

  subscribe(id) {
    this.paymentS.subscribe(id)
    .then(receipt => {
      console.log(receipt);
    })
    .catch(error => {
      console.log(error);
    });
  }

  restore() {
    console.log("Restore pressed!");
    this.paymentS.restorePurchases();
  }

}
