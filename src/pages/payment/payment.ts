import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { PaymentService } from '../../providers/payment-service';

@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html'
})
export class PaymentPage {
  products: Array<any>;
  
  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private paymentS: PaymentService) {

  }

  loadProducts() {
    
  }

  buy(id) {

  }

  restore() {

  }

}
