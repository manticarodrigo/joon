import { Injectable } from '@angular/core';
import { InAppPurchase } from 'ionic-native';

@Injectable()
export class PaymentService {
  restored = false;
  
  constructor() {
    this.restorePurchases();
  }
  
  fetchProducts(): Promise<any> {
    return new Promise((resolve, reject) => {
      InAppPurchase
      .getProducts(['unlimitedLikes'])
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
      } else {
        this.restored = false;
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
