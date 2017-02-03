import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/Rx';

import { UserService } from '../../providers/user-service';
import { EditProfilePage } from '../edit-profile/edit-profile';

import { FirebaseObjectObservable } from 'angularfire2'

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {
  user = {};
  mutual: Array<any>;

  constructor(public navCtrl: NavController, private http: Http,
              private userService: UserService) {
  }

  editProfile() {
      this.navCtrl.push(EditProfilePage);
  }
  
  ngAfterViewInit() {
    // this.generateRandomUser();
    // this.userObj = this.userService.getCurrentUser();
    this.userService.setCurrentUserSnapshot(data => {this.user = data});
	}

}