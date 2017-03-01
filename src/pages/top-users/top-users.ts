import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { UserService } from '../../providers/user-service';
import { DiscoverService } from '../../providers/discover-service';

import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-top-users',
  templateUrl: 'top-users.html'
})
export class TopUsersPage {
    
  topUsersLimit: number = 10;
  topUsers: Array<any>;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private userS: UserService,
              private discoverS: DiscoverService) {
  }

  ionViewWillEnter() {
    this.fetchTopUsers(this.topUsersLimit);
  }
  
  fetchTopUsers(count) {
    console.log("fetching global users");

    this.discoverS.getRankedUsersIDs().then(sortedIds => {
      let topIds = sortedIds.slice(0, this.topUsersLimit);
      return this.userS.fetchUsers(topIds);
    }).then(users => {
      // since each query is passed seperately to Promise.all,
      // and the results array contains the result in the same order,
      // there should be no need to re-sort
      console.log("fetch returned top users");
      console.log(users);
      this.topUsers = users;
    }).catch(error => {
      alert(error);
    });

  }

  userTapped(event, user) {
    this.navCtrl.push(ProfilePage, {
        user: user
    });
  }

}