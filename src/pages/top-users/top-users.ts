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
    this.fetchGlobalTopUsers();
    this.fetchLocalTopUsers();
  }

  presentInfo() {
    let alert = this.alertCtrl.create({
      title: 'Welcome to Top Users',
      message: 'This page features the top six people globally and locally (within 100 miles) based on likes and double likes.',
      buttons: ['Dismiss']
    });
    alert.present();
  }

  fetchGlobalTopUsers() {
    console.log("Fetching global top users");
    this.discoverS.getRankedUsersIDs().then(sortedIds => {
      let topIds = sortedIds.slice(0, this.topUsersLimit);
      return this.userS.fetchUsers(topIds);
    }).then(users => {
      // since each query is passed seperately to Promise.all,
      // and the results array contains the result in the same order,
      // there should be no need to re-sort
      console.log("Global fetch returned top users");
      console.log(users);
      var existingUsers = [];
      for (var key in users) {
        var user = users[key];
        if (user) {
          existingUsers.push(user);
        }
      }
      this.globalUsers = existingUsers;
    }).catch(error => {
      console.log("Global fetch returned error:", error);
    });
  }

  fetchLocalTopUsers() {
    console.log("Fetching local top users");
    let env = this;
    let user = this.userS.user;
    this.modalS.user = this.userS.user;
    // this.modalS.message = "Finding people nearby...";
    if (!this.modalS.isActive) {
      this.modalS.create(LoadingPage);
      this.modalS.present();
    }
    env.locationS.getLocation().then(() => {
      env.locationS.fetchNearbyKeys().then(nearbyKeys => {
        env.discoverS.getRankedUsersIDs().then(sortedIds => {
          var localTopIds = [];
          var count = 0;
          sortedIds.forEach(uid => {
            console.log(uid);
            for (var key in nearbyKeys) {
              let nearbyKey = nearbyKeys[key];
              if (uid == nearbyKey && count <= this.topUsersLimit) {
                console.log("uid exists nearby!", uid);
                count++;
                localTopIds.push(uid);
              }
            }
          });
          return this.userS.fetchUsers(localTopIds);
        }).then(users => {
          var existingUsers = [];
          for (var key in users) {
            var user = users[key];
            if (user) {
              existingUsers.push(user);
            }
          }
          env.localUsers = existingUsers;
          env.modalS.dismiss();
        }).catch(error => {
          console.log(error);
          env.modalS.dismiss();
        });
      }).catch(error => {
        console.log(error);
        env.modalS.dismiss();
      });
    }).catch(error => {
      console.log(error);
      env.modalS.dismiss();
    });
  }

  userTapped(event, user) {
    this.navCtrl.push(ProfilePage, {
        user: user
    });
  }

}