import { Injectable } from '@angular/core';
import { OneSignal } from 'ionic-native';

import { UserService } from './user-service';

@Injectable()
export class PushService {

  constructor(public userS: UserService) {
    
  }

  init() {
    console.log("Initializing OneSignal...");
    // OneSignal initialization
    OneSignal.startInit("ed946620-864f-40c3-9edb-bd3495a7e2b4", "516717911226");
    OneSignal.inFocusDisplaying(OneSignal.OSInFocusDisplayOption.Notification);
    OneSignal.setSubscription(true);
    // Enable to debug issues.
    // OneSignal.setLogLevel({logLevel: 4, visualLevel: 4})
    OneSignal.handleNotificationReceived().subscribe(() => {
      // do something when notification is received
      console.log("Notification received!");
    });

    OneSignal.handleNotificationOpened().subscribe(() => {
      // do something when a notification is opened
      console.log("Notification opened!");
    });

    OneSignal.endInit();
  }

  setSubscription(enable) {
    OneSignal.setSubscription(enable);
  }

  push(message, user) {
    var notificationObj = { 
                          app_id: "5eb5a37e-b458-11e3-ac11-000c2940e62c",
                          headings: { en: this.userS.user.firstName },
                          contents: { en: message },
                          data: { uid: user.id },
                          include_player_ids: [user.pushId],
                          isAppInFocus: null,
                          shown: null,
                          payload: null,
                          displayType: null
                        };
    if (this.userS.user.pushId) {
      OneSignal.postNotification(notificationObj);
    }
  }

  getPushId(): Promise<any> {
    return new Promise((resolve, reject) => {
      OneSignal.getIds().then(data => {
        // this gives you back the new userId and pushToken associated with the device. Helpful.
        console.log("OneSignal returned ids:");
        console.log(data);
        console.log(data['userId']);
        resolve(data['userId']);
      }).catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

}
