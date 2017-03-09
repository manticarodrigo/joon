import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AuthService } from '../../providers/auth-service';
import { UserService } from '../../providers/user-service';
import { LoadingService } from '../../providers/loading-service';
import { ChatService } from '../../providers/chat-service';
import { PushService } from '../../providers/push-service';

import { DiscoverPage } from '../discover/discover';
import { LoadingPage } from '../loading/loading';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    constructor(public navCtrl: NavController,
                private authS: AuthService,
                private userS: UserService,
                private loadingS: LoadingService,
                private chatS: ChatService,
                private pushS: PushService) {

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
        this.authS.beginAuth().then(success => {
            if (success) {
                console.log("Auth succeeded!");
                this.navCtrl.setRoot(DiscoverPage);
                this.chatS.observeChats();
                this.loadingS.dismiss();
                this.pushS.getPushId().then(pushId => {
                    console.log("Appending pushId:");
                    console.log(pushId);
                    var updatedUser = this.userS.user;
                    updatedUser["pushId"] = pushId;
                    console.log("Appended pushId to user:", updatedUser);
                    this.userS.updateUser(updatedUser);
                }).catch(error => {
                    console.log(error);
                });
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