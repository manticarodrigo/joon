import { Injectable } from '@angular/core';
import firebase from 'firebase';

import { UserService } from './user-service';


@Injectable()
export class SettingsService {

  constructor(private userS: UserService) {
  }

  fetchUserSettings(user): Promise<any> {
    let env = this;
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_settings/' + this.userS.user.id);
      ref.once('value').then((snap) => {
        if (snap.exists()) {
          console.log("Fetch returned user settings!", snap.val());
          resolve(snap.val());
        } else {
          console.log("Fetch did not return any user settings!");
          var settings = {
              matches: true,
              messages: true,
              doubleLikes: true
          };
          resolve(settings);
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  updateNotificationSettings(settings) {
    console.log("Updating notification settings...", settings);
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_settings/' + this.userS.user.id);
      ref.update(settings).then(data => {
        console.log("User settings saved to DB!");
        return ref.once('value');
      }).then(snapshot => {
        console.log("User settings returned from DB!");
        resolve(snapshot.val());
      }).catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

}
