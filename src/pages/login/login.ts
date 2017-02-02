import { Component } from '@angular/core';

import { AuthService } from '../../providers/auth-service';
import { UserService } from '../../providers/user-service';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  
  constructor(public navCtrl: NavController,
              private auth: AuthService,
              private userService: UserService) {
  }
  
  signInWithFacebook(): void {
    this.auth.signInWithFacebook()
      .then(() => this.onSignInSuccess());
  }

  private onSignInSuccess(): void {
    let uid = this.auth.authState.facebook.uid;
    this.userService.addUserByUID(uid, this.auth.authState.facebook);
    this.userService.setCurrentUserUID(uid);
      
    console.log("Facebook display name ",this.auth.displayName());

    // TODO: reroute to landing page!
      this.navCtrl.pop();
  }

}