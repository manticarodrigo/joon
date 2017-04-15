import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { PaymentService } from '../../providers/payment-service';
import { DiscoverService } from '../../providers/discover-service';
import { ModalService } from '../../providers/modal-service';

@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html'
})
export class PaymentPage {
  products: Array<any>;
  user: any;
  discovering = false;
  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController,
              private paymentS: PaymentService,
              private discoverS: DiscoverService,
              private modalS: ModalService) {
    this.user = this.navParams.get('user');
    this.discovering = this.navParams.get('discovering');
    this.loadProducts();
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
