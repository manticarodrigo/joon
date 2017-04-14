import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { PaymentService } from '../../providers/payment-service';
import { DiscoverService } from '../../providers/discover-service';

@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html'
})
export class PaymentPage {
  products: Array<any>;
  likesLeft = 15;
  doubleLikesLeft = 2;
  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController,
              private paymentS: PaymentService,
              private discoverS: DiscoverService) {
    this.fetchDailyLikes();
    this.loadProducts();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  fetchDailyLikes() {
    Promise.all([this.discoverS.fetchDailyLikes(), this.discoverS.fetchDailyDoubleLikes()])
    .then(data => {
      this.likesLeft = 15 + this.paymentS.extraLikes - data[0];
      this.doubleLikesLeft = 2 + this.paymentS.extraDoubleLikes - data[1];
      console.log(this.likesLeft);
      console.log(this.doubleLikesLeft);
    })
    .catch(error => {
      console.log(error);
    });
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
      this.fetchDailyLikes();
      console.log(receipt);
    })
    .catch(error => {
      console.log(error);
    });
  }

  restore() {
    console.log("Restore pressed!");
    this.paymentS.restorePurchases();
    this.fetchDailyLikes();
  }

}
