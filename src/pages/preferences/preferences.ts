import { Component } from '@angular/core';

import { UserService } from '../../providers/user-service';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html'
})
export class PreferencesPage {
  user = {
    showAge: null
  };
  searchPrefs = {
    gender: null,
    lfm: null,
    lff: null,
    distance: null
  };
  relationship = 'women';
  
  constructor(public navCtrl: NavController, private userS: UserService) {

  }

  // because the UI specifies a toggle, this button also
  // deactivates likes-women. Database and search supports
  // liking of men only, women only, or both men and women;
  // only UI does not support the last option.
  selectedMen() {
    this.relationship = "men";
    this.userS.updateSearchInDB({ 
      lfm: true,
      lff: false
    }).then(data => {
      this.userS.searchPrefs = data;
      this.searchPrefs = this.userS.searchPrefs;
    }).catch(error => { alert(error); });
  }
  
  selectedWomen() {
    this.relationship = "women";
    this.userS.updateSearchInDB({ 
      lfm: false,
      lff: true
    }).then(data => {
      this.userS.searchPrefs = data;
      this.searchPrefs = this.userS.searchPrefs;
    }).catch(error => { alert(error); });
  }

  selectedDistance(distance) {
    this.searchPrefs.distance = distance;
    this.userS.updateSearchInDB({ 
      distance: distance
    }).then(data => {
      this.userS.searchPrefs = data;
      this.searchPrefs = this.userS.searchPrefs;
    }).catch(error => { alert(error); });
  }

  toggledShowAge() {
    this.user.showAge = !this.user.showAge
    this.userS.updateUserInDB({
      showAge: this.user.showAge
    }).then(data => {
      this.userS.user = data;
      this.user = this.userS.user;
    }).catch(error => { alert(error); });
  }

  ngAfterViewInit() {
    this.user = this.userS.user;
    this.searchPrefs = this.userS.searchPrefs;
    this.relationship = (this.searchPrefs.lff ? 'women' : 'men');
    console.log(this.searchPrefs);
    console.log(this.relationship);
  }
  
}