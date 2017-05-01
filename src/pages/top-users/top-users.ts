import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';

import { UserService } from '../../providers/user-service';
import { DiscoverService } from '../../providers/discover-service';
import { LocationService } from '../../providers/location-service';

import { ProfilePage } from '../profile/profile';
import { LoadingPage } from '../loading/loading';

@Component({
  selector: 'page-top-users',
  templateUrl: 'top-users.html'
})
export class TopUsersPage {
    
  topUsersLimit: number = 6;
  globalUsers: Array<any>;
  localUsers: Array<any>;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private userS: UserService,
              private discoverS: DiscoverService,
              private locationS: LocationService) {
    this.fetchTopUsers();
  }

  presentInfo() {
    let alert = this.alertCtrl.create({
      title: 'Welcome to Top Users',
      message: 'This page features the top six people globally and locally (within 100 miles) based on likes and double likes.',
      buttons: ['Dismiss']
    });
    alert.present();
  }

  fetchTopUsers() {
    console.log("Fetching global top users...");
    let user = this.userS.user;
    let modal = this.modalCtrl.create(LoadingPage, {
        user: user
    });
    modal.present();
    this.discoverS.getRankedUsersMap().then(rankings => {
      let sortedIds = Object.keys(rankings);
      sortedIds.sort((a: any, b: any) => {
        let likesA = rankings[a];
        let likesB = rankings[b];
        // this is a descending sort
        if (likesA < likesB) {
          return 1;
        } else if (likesA > likesB) {
          return -1;
        } else {
          return 0;
        }
      });
      let topIds = sortedIds.slice(0, this.topUsersLimit + 3);
      this.fetchLocalTopUsers(rankings, modal);
      return this.userS.fetchUsers(topIds);
    }).then(users => {
      // since each query is passed seperately to Promise.all,
      // and the results array contains the result in the same order,
      // there should be no need to re-sort
      console.log("Global fetch returned top users");
      console.log(users);
      this.globalUsers = this.removeEmptyValues(users).slice(0, this.topUsersLimit);
    }).catch(error => {
      console.log("Global fetch returned error:", error);
    });
  }

  fetchLocalTopUsers(rankings, modal) {
    console.log("Fetching local top users with ids...");
    let env = this;
    env.locationS.getLocation()
    .then(location => {
      env.locationS.fetchNearbyKeys()
      .then(nearbyKeys => {
        var localTopMap = {};
        var count = 0;
        for (var key in nearbyKeys) {
          if (rankings[nearbyKeys[key]]) {
            localTopMap[nearbyKeys[key]] = rankings[nearbyKeys[key]];
            console.log(nearbyKeys[key] + " is nearby and is ranked.");
          } else {
            console.log(nearbyKeys[key] + " is not ranked yet.");
          }
        }
        let sortedIds = Object.keys(localTopMap);
        sortedIds.sort((a: any, b: any) => {
          let likesA = rankings[a];
          let likesB = rankings[b];
          // this is a descending sort
          if (likesA < likesB) {
            return 1;
          } else if (likesA > likesB) {
            return -1;
          } else {
            return 0;
          }
        });
        let topIds = sortedIds.slice(0, this.topUsersLimit + 3);
        return this.userS.fetchUsers(topIds);
      })
      .then(users => {
        env.localUsers = this.removeEmptyValues(users).slice(0, this.topUsersLimit);
        modal.dismiss();
      })
      .catch(error => {
        console.log(error);
        modal.dismiss();
      });
    })
    .catch(error => {
      console.log(error);
      modal.dismiss();
    });
  }

  removeEmptyValues(array) {
    return array.filter(function(n){ return n != undefined })
  }

  userTapped(user) {
    this.navCtrl.push(ProfilePage, {
        user: user
    });
  }

}