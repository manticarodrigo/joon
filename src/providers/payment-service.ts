import { Injectable } from '@angular/core';
import { InAppPurchase } from 'ionic-native';

@Injectable()
export class PaymentService {
  extraLikes = 0;
  extraDoubleLikes = 0;
  
  constructor() {
  }
  
  fetchProducts(): Promise<any> {
    return new Promise((resolve, reject) => {
      InAppPurchase
      .getProducts(['2xlikes'])
      .then((products) => {
        console.log(products);
          // [{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
      })
      .catch((err) => {
        console.log(err);
      });
    });
  }

  restorePurchases() {
    
  }

  subscribe(id): Promise<any> {
    return new Promise((resolve, reject) => {
      InAppPurchase
      .subscribe(id)
      .then((data)=> {
        console.log(data);
        // {
        //   transactionId: ...
        //   receipt: ...
        //   signature: ...
        // }
      })
      .catch((err)=> {
        console.log(err);
      });
    });
  }

  buyProduct(id): Promise<any> {
    return new Promise((resolve, reject) => {
      InAppPurchase
      .buy(id)
      .then((data)=> {
        console.log(data);
        // {
        //   transactionId: ...
        //   receipt: ...
        //   signature: ...
        // }
      })
      .catch((err)=> {
        console.log(err);
      });
    });
  }

}
