import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AuthService } from '../../providers/auth-service';
import { LoadingService } from '../../providers/loading-service';

import { DiscoverPage } from '../discover/discover';
import { LoadingPage } from '../loading/loading';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    constructor(public navCtrl: NavController,
                private authS: AuthService,
                private loadingS: LoadingService) {

    }
    
    login() {
        console.log("login pressed...");
        let user = {photoURL : 'assets/user-placeholder.png'}
        this.loadingS.user = user;
        this.loadingS.message = "Starting authentication...";
        if (!this.loadingS.isActive) {
            this.loadingS.create(LoadingPage);
            this.loadingS.present();
        }
        this.authS.beginAuth().then(user => {
            if (user) {
                console.log("Auth succeeded!");
                this.navCtrl.setRoot(DiscoverPage);
                this.loadingS.dismiss();
            } else {
                console.log("No user returned");
                this.loadingS.dismiss();
            }
        }).catch(error => {
            console.log(error);
            this.loadingS.dismiss();
        });
    }
}