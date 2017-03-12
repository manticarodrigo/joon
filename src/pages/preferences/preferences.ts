import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { UserService } from '../../providers/user-service';
import { DiscoverService } from '../../providers/discover-service';
import { PopoverService } from '../../providers/popover-service';

import { PopoverPage } from '../popover/popover';

@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html'
})
export class PreferencesPage {
  user = {
    showAge: true,
    lfm: null,
    lff: null,
    distance: 'global'
  };
  
  constructor(private navCtrl: NavController,
              private userS: UserService,
              private discoverS: DiscoverService,
              private popoverS: PopoverService) {

  }

  ionViewWillEnter() {
    this.user = this.userS.user;
  }

  toggledMen() {
    console.log("Men toggled!");
    console.log(this.user.lfm);
    this.userS.updateUser(this.user).catch(error => { alert(error); });
  }
  
  toggledWomen() {
    console.log("Women toggled!");
    console.log(this.user.lff);
    this.userS.updateUser(this.user).catch(error => { alert(error); });
  }

  selectDistance() {
    this.popoverS.create(PopoverPage);
    this.popoverS.options = ['local', 'national', 'global'];
    this.popoverS.popover.onDidDismiss(distance => {
      if (distance) {
        console.log("Distance selected!");
        console.log(this.user.distance);
        this.user.distance = distance;
        console.log(this.user.distance);
        this.userS.updateUser(this.user).catch(error => { alert(error); });
      }
    });
    this.popoverS.present();
  }

  toggledShowAge() {
    console.log("Show age toggled!");
    console.log(this.user.showAge);
    this.userS.updateUser(this.user).catch(error => { alert(error); });
  }

  resetDiscoverableUsers() {
    console.log("Users reset pressed!");
    this.discoverS.resetSeen();
  }

  resetLikes() {
    console.log("Like reset pressed!");
    this.discoverS.resetLikes();
  }
  
}