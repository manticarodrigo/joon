import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

import { UserService } from '../../providers/user-service';
import { DiscoverService } from '../../providers/discover-service';
import { ModalService } from '../../providers/modal-service';
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
              private userS: UserService,
              private discoverS: DiscoverService,
              private modalS: ModalService,
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
    console.log("Fetching global top users");
    let user = this.userS.user;
    this.modalS.user = this.userS.user;
    // this.modalS.message = "Finding people nearby...";
    if (!this.modalS.isActive) {
      this.modalS.create(LoadingPage);
      this.modalS.present();
    }
    this.discoverS.getRankedUsersIDs().then(sortedIds => {
      let topIds = sortedIds.slice(0, this.topUsersLimit + 3);
      this.fetchLocalTopUsers(sortedIds);
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

  fetchLocalTopUsers(topIds) {
    console.log("Fetching local top users with ids:");
    console.log(topIds);
    let env = this;
    env.locationS.getLocation().then(() => {
      env.locationS.fetchNearbyKeys().then(nearbyKeys => {
        var localTopIds = [];
          var count = 0;
          for (var key in nearbyKeys){
            console.log(nearbyKeys[key]);
            if (topIds.includes(nearbyKeys[key])) {
              if (count < this.topUsersLimit) {
                console.log("Key exists nearby:");
                console.log(nearbyKeys[key]);
                count++;
                localTopIds.push(nearbyKeys[key]);
              }
            }
          }
          return this.userS.fetchUsers(localTopIds);
        }).then(users => {
          env.localUsers = this.removeEmptyValues(users);
          env.modalS.dismiss();
        }).catch(error => {
          console.log(error);
          env.modalS.dismiss();
        });
    }).catch(error => {
      console.log(error);
      env.modalS.dismiss();
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