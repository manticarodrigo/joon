import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AuthService } from '../../providers/auth-service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  
  constructor(public navCtrl: NavController, private auth: AuthService) {
  
  }
  
  signInWithFacebook(): void {
    this.auth.signInWithFacebook()
      .then(() => this.onSignInSuccess());
  }

  private onSignInSuccess(): void {
    this.navCtrl.pop();
    console.log("Facebook display name ",this.auth.displayName());
  }

}