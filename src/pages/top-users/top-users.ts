import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { UserService } from '../../providers/user-service';
import { DiscoverService } from '../../providers/discover-service';
import { LoadingService } from '../../providers/loading-service';
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
              private userS: UserService,
              private discoverS: DiscoverService,
              private loadingS: LoadingService,
              private locationS: LocationService) {
  }

  ionViewWillEnter() {
    this.fetchGlobalTopUsers();
    this.fetchLocalTopUsers();
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
      console.log("fetch returned top users");
      console.log(users);
      this.globalUsers = users;
    }).catch(error => {
      alert(error);
    });
  }

  fetchLocalTopUsers() {
    let env = this;
    let user = this.userS.user;
    this.loadingS.user = this.userS.user;
    this.loadingS.message = "Finding people nearby...";
    if (!this.loadingS.isActive) {
      this.loadingS.create(LoadingPage);
      this.loadingS.present();
    }
    if (env.locationS.currentLocation) {
      env.locationS.fetchNearbyKeys().then(keys => {
        this.userS.fetchUsers(keys).then(users => {
          this.discoverS.fetchLocalUsers(users).then(localUsers => {
            this.localUsers = localUsers;
            this.loadingS.dismiss();
          }).catch(error => {
            console.log(error);
          });
        }).catch(error => {
          console.log(error);
        });
      }).catch(error => {
        console.log(error);
      });
    } else {
      env.locationS.getLocation().then(() => {
        env.locationS.fetchNearbyKeys().then(keys => {
          this.userS.fetchUsers(keys).then(users => {
            this.discoverS.fetchLocalUsers(users).then(localUsers => {
              this.localUsers = localUsers;
              this.loadingS.dismiss();
            }).catch(error => {
              console.log(error);
            });
          }).catch(error => {
            console.log(error);
          });
        }).catch(error => {
          console.log(error);
        });
      }).catch(error => {
        console.log(error);
      });
    }
  }

  userTapped(event, user) {
    this.navCtrl.push(ProfilePage, {
        user: user
    });
  }

}