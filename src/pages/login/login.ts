import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AuthService } from '../../providers/auth-service';
import { UserService } from '../../providers/user-service';
import { ModalService } from '../../providers/modal-service';
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
                private modalS: ModalService,
                private chatS: ChatService,
                private pushS: PushService) {

    }
    
    login() {
        console.log("login pressed...");
        let user = {photoURL : 'assets/user-placeholder.png'}
        this.modalS.user = user;
        this.modalS.message = "Starting authentication...";
        if (!this.modalS.isActive) {
            this.modalS.create(LoadingPage);
            this.modalS.present();
        }
        this.authS.beginAuth().then(success => {
            if (success) {
                console.log("Auth succeeded!");
                this.navCtrl.setRoot(DiscoverPage);
                this.chatS.observeChats();
                this.modalS.dismiss();
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
                this.modalS.dismiss();
            }
        }).catch(error => {
            console.log(error);
            this.modalS.dismiss();
        });
    }
}