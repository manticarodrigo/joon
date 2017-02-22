import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { UserService } from '../../providers/user-service';

import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-top-users',
  templateUrl: 'top-users.html'
})
export class TopUsersPage {
    
    topUsers: Array<any>;

    constructor(private navCtrl: NavController,
                private navParams: NavParams,
                private userS: UserService) {
    }

    ionViewWillEnter() {
        this.fetchTopUsers();
    }
    
    fetchTopUsers() {
        console.log("fetching global users");
        this.userS.fetchGlobalUsers().then(data => {
            console.log("fetch returned global users");
            console.log(data);
            this.topUsers = data;
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