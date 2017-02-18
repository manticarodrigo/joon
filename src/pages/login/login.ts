import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AuthService } from '../../providers/auth-service';
import { UserService } from '../../providers/user-service';

import { DiscoverPage } from '../discover/discover';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    constructor(public navCtrl: NavController,
                private authS: AuthService,
                private userS: UserService) {

    }
    
    login() {
        console.log("login pressed...");
        // push any waiting-for-connection segue visual here
        this.authS.beginAuth().then(user => {
            console.log("Auth succeeded!");
            this.userS.user = user;
            this.onSignInSuccess();
        }).catch(error => {
            console.log(error);
        });
    }

    private onSignInSuccess(): void {
        console.log("onSignInSuccess");
        this.navCtrl.setRoot(DiscoverPage);
    }
}