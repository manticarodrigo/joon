import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AuthService } from '../../providers/auth-service';

import { DiscoverPage } from '../discover/discover';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    constructor(public navCtrl: NavController,
                private authS: AuthService) {

    }
    
    login() {
        console.log("login pressed...");
        // push any waiting-for-connection segue visual here
        this.authS.beginAuth().then(user => {
            if (user) {
                console.log("Auth succeeded!");
                this.navCtrl.setRoot(DiscoverPage);
            } else {
                console.log("No user returned");
            }
        }).catch(error => {
            console.log(error);
        });
    }
}