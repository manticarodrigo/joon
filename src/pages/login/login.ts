import { Component } from '@angular/core';

import { AuthService } from '../../providers/auth-service';
import { UserService } from '../../providers/user-service';
import { DiscoverPage } from '../discover/discover';

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
      alert('attempting signInWithFacebook:');
      this.auth.signInWithFacebook()
      .then(
        () => this.onSignInSuccess(),
        (error) => {
          alert('signInWithFacebook Error (follows)');
          alert(error);
        }
      );
    }

    testAction(): void {
      alert('foo!');
    }

    private onSignInSuccess(): void {
        alert('signInSuccess');
        // let uid = this.auth.getUID();
        // let val = this.auth.getVal();
        // this.userService.addUserByUID(uid, val);
        // this.userService.setCurrentUserUID(uid);
        // // Pop to landing page!
        // alert('before navCtrl in login.ts');
        // this.navCtrl.pop();
        // alert('after navCtrl in login.ts');
    }

}