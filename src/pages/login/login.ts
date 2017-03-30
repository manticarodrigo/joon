import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { AuthService } from '../../providers/auth-service';
import { UserService } from '../../providers/user-service';
import { ModalService } from '../../providers/modal-service';
import { ChatService } from '../../providers/chat-service';
import { PushService } from '../../providers/push-service';

import { DiscoverPage } from '../discover/discover';
import { LoadingPage } from '../loading/loading';
import { LegalPage } from '../legal/legal';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    constructor(private navCtrl: NavController,
                private alertCtrl: AlertController,
                private authS: AuthService,
                private userS: UserService,
                private modalS: ModalService,
                private chatS: ChatService,
                private pushS: PushService) {

    }
    
    login() {
        console.log("login pressed...");
        let env = this;
        let user = { photoURL : 'assets/user-placeholder.png' }
        this.modalS.user = user;
        // this.modalS.message = "Starting authentication...";
        if (!this.modalS.isActive) {
            this.modalS.create(LoadingPage);
            this.modalS.present();
        }
        this.authS.beginAuth().then(user => {
            if (user) {
                console.log("Auth succeeded!");
                env.navCtrl.setRoot(DiscoverPage);
                env.chatS.observeChats();
                env.modalS.dismiss();
                env.pushS.getPushId().then(pushId => {
                    console.log("Appending pushId:");
                    console.log(pushId);
                    var updatedUser = env.userS.user;
                    updatedUser["pushId"] = pushId;
                    console.log("Appended pushId to user:", updatedUser);
                    env.userS.updateUser(updatedUser);
                }).catch(error => {
                    console.log(error);
                });
            } else {
                console.log("No user returned");
                env.modalS.dismiss();
                env.presentError('Authentication error! Please try again.');
            }
        }).catch(error => {
            console.log(error);
            env.modalS.dismiss();
            env.presentError(error);
        });
    }

    presentError(message) {
        let alert = this.alertCtrl.create({
            title: 'Login Failed!',
            message: message,
            buttons: ['Dismiss']
            });
        alert.present();
    }

    showPolicy() {
        this.modalS.create(LegalPage);
        this.modalS.present();
    }
}