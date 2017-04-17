import { Injectable } from '@angular/core';
import { InAppPurchase } from 'ionic-native';

@Injectable()
export class PaymentService {
  restored = false;
  extraLikes = 0;
  extraDoubleLikes = 0;
  constructor() {
    this.restorePurchases();
  }
  
  fetchProducts(): Promise<any> {
    return new Promise((resolve, reject) => {
      InAppPurchase
      .getProducts(['2xlikes'])
      .then(products => {
        console.log(products);
        resolve(products);
          // [{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  restorePurchases() {
    console.log("Restoring purchases...");
    InAppPurchase
    .restorePurchases()
    .then(purchases => {
      console.log("Purchases returned:");
      console.log(purchases);
      if (purchases) {
        this.restored = true;
        this.extraLikes = 15;
        this.extraDoubleLikes = 3;
      } else {
        this.restored = false;
        this.extraLikes = 0;
        this.extraDoubleLikes = 0;
      }
    })
    .catch(error => {
      console.log(error);
    });
    
  }

  subscribe(id): Promise<any> {
    return new Promise((resolve, reject) => {
      InAppPurchase
      .subscribe(id)
      .then(data => {
        console.log(data);
        this.restored = true;
        resolve(data);
        // {
        //   transactionId: ...
        //   receipt: ...
        //   signature: ...
        // }
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  buy(id): Promise<any> {
    return new Promise((resolve, reject) => {
      InAppPurchase
      .buy(id)
      .then(data => {
        console.log(data);
        this.restorePurchases();
        resolve(data);
        // {
        //   transactionId: ...
        //   receipt: ...
        //   signature: ...
        // }
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

}
