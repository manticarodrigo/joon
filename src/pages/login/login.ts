import { Component } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

import { AuthService } from '../../providers/auth-service';
import { UserService } from '../../providers/user-service';
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
                private modalCtrl: ModalController,
                private authS: AuthService,
                private userS: UserService,
                private chatS: ChatService,
                private pushS: PushService) {

    }
    
    login() {
        console.log("login pressed...");
        let env = this;
        let user = { photoURL : 'assets/user-placeholder.png' }
        let modal = env.modalCtrl.create(LoadingPage, {
            user: user
        });
        modal.present();
        this.authS.beginAuth().then(user => {
            if (user) {
                console.log("Auth succeeded!");
                env.navCtrl.setRoot(DiscoverPage);
                env.chatS.observeChats();
                modal.dismiss();
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
                modal.dismiss();
                env.presentError('Authentication error! Please try again.');
            }
        }).catch(error => {
            console.log(error);
            modal.dismiss();
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
        let modal = this.modalCtrl.create(LegalPage);
        modal.present();
    }
}