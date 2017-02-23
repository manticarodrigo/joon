import { Component } from '@angular/core';

import { UserService } from '../../providers/user-service';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html'
})
export class PreferencesPage {
  user = {
    showAge: null,
    lfm: null,
    lff: null,
    distance: null
  };
  relationship = 'women';
  
  constructor(public navCtrl: NavController, private userS: UserService) {

  }

  selectedMen() {
    this.relationship = "men";
    this.userS.updateUser({ 
      id: this.userS.user.id,
      lfm: true,
      lff: false
    }).then(data => {
      this.user.lfm = true;
      this.user.lff = false;
    }).catch(error => { alert(error); });
  }
  
  selectedWomen() {
    this.relationship = "women";
    this.userS.updateUser({ 
      id: this.userS.user.id,
      lfm: false,
      lff: true
    }).then(data => {
      this.user.lfm = false;
      this.user.lff = true;
    }).catch(error => { alert(error); });
  }

  selectedDistance(distance) {
    this.user.distance = distance;
    this.userS.updateUser({ 
      id: this.userS.user.id,
      distance: distance
    }).catch(error => { alert(error); });
  }

  toggledShowAge() {
    this.user.showAge = !this.user.showAge
    this.userS.updateUser({
      id: this.userS.user.id,
      showAge: this.user.showAge
    }).catch(error => { alert(error); });
  }

  ngAfterViewInit() {
    this.user = this.userS.user;
    this.relationship = (this.user.lff ? 'women' : 'men');
  }
  
}