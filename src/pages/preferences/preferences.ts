import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { UserService } from '../../providers/user-service';
import { DiscoverService } from '../../providers/discover-service';
import { PopoverService } from '../../providers/popover-service';

import { PopoverPage } from '../popover/popover';

@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html'
})
export class PreferencesPage {
  preferences = {
      showAge: true,
      lfm: true,
      lff: true,
      distance: 'national'
  };
  user: any;
  pressed = 0;
  
  constructor(private navCtrl: NavController,
              private alertCtrl: AlertController,
              private userS: UserService,
              private discoverS: DiscoverService,
              private popoverS: PopoverService) {
    this.user = null;
    this.userS.fetchUserPreferences(this.userS.user).then(preferences => {
      this.preferences = preferences;
      this.user = this.userS.user;
    }).catch(error => {
      console.log(error);
    });
  }

  toggled() {
    console.log("Toggled!");
    console.log(this.preferences);
    if (this.user) {
      this.userS.updateUserPreferences(this.preferences);
      this.discoverS.resetDiscoverables();
    }
  }

  selectDistance() {
    this.popoverS.create(PopoverPage);
    this.popoverS.options = ['local', 'national', 'global'];
    this.popoverS.popover.onDidDismiss(distance => {
      if (distance) {
        console.log("Distance selected!");
        console.log(this.preferences.distance);
        this.preferences.distance = distance;
        console.log(this.preferences.distance);
        if (this.user) {
          this.userS.updateUserPreferences(this.preferences);
        }
      }
    });
    this.popoverS.present();
  }

  resetDiscoverableUsers() {
    console.log("Users reset pressed!");
    this.discoverS.resetSeen();
    let alert = this.alertCtrl.create({
      title: 'Discoverable users reset.',
      message: 'Navigate to the Discover page to find people.',
      buttons: ['Dismiss']
    });
    alert.present();
  }

  resetLikes() {
    console.log("Like reset pressed!");
    this.discoverS.resetLikes();
    let alert = this.alertCtrl.create({
      title: 'Likes reset.',
      message: 'Navigate to the Discover page to find people.',
      buttons: ['Dismiss']
    });
    alert.present();
  }

  resetDoubleLikes() {
    console.log("Double like reset pressed!");
    this.discoverS.resetDoubleLikes();
    let alert = this.alertCtrl.create({
      title: 'Double likes reset.',
      message: 'Navigate to the Discover page to find people.',
      buttons: ['Dismiss']
    });
    alert.present();
  }

  highlight(num) {
    console.log("Highlighting button num " + num);
    this.pressed = num;
  }

  unhighlight() {
    console.log("Unhighlighting buttons");
    this.pressed = 0;
  }
  
}