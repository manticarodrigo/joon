import { Component } from '@angular/core';
import { NavController, MenuController, AlertController, ModalController } from 'ionic-angular';

import { UserService } from '../../providers/user-service';
import { SettingsService } from '../../providers/settings-service';
import { ChatService } from '../../providers/chat-service';
import { AuthService } from '../../providers/auth-service';

import { LoginPage } from '../login/login';
import { LegalPage } from '../legal/legal';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
    settings = {
        matches: true,
        messages: true,
        doubleLikes: true
    };
    user: any;

    constructor(private navCtrl: NavController,
                private menuCtrl: MenuController,
                private alertCtrl: AlertController,
                private modalCtrl: ModalController,
                private userS: UserService,
                private chatS: ChatService,
                private settingsS: SettingsService,
                private authS: AuthService) {
        this.user = null;
        this.settingsS.fetchUserSettings(this.userS.user).then(settings => {
            this.settings = settings;
            this.user = this.userS.user;
        }).catch(error => {
            console.log(error);
        });
    }

    updateSettings() {
        console.log("Setting toggled!");
        if (this.user) {
            this.settingsS.updateNotificationSettings(this.settings);
        }
    }

    hideUser() {
        let alert = this.alertCtrl.create({
            title: 'Are you sure you want to deactivate your account?',
            buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {
                    console.log('Cancel clicked');
                }
            },
            {
                text: 'Deactivate',
                handler: data => {
                    this.userS.hideUser(this.userS.user).then(() => {
                        this.navCtrl.setRoot(LoginPage);
                        this.menuCtrl.close();
                        this.chatS.stopObservingChats();
                        this.userS.updateCurrentUser(null);
                        this.authS.signOut();
                    }).catch(error => {
                        console.log(error);
                    });
                }
            }
            ]
        });
        alert.present();
    }

    showPolicy() {
        let modal = this.modalCtrl.create(LegalPage);
        modal.present();
    }

}