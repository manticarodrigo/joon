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
        this.auth.signInWithFacebook()
            .then(() => this.onSignInSuccess());
    }

    private onSignInSuccess(): void {
        let uid = this.auth.getUID();
        let val = this.auth.getVal();
        this.userService.addUserByUID(uid, val);
        this.userService.setCurrentUserUID(uid);
        // Pop to landing page!
        this.navCtrl.pop();
    }

}