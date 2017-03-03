import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';

import { ChatService } from '../../providers/chat-service';
import { UserService } from '../../providers/user-service';

import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
})
export class ChatPage {
    
    viewState = "";
    chatInput = "";
    user: any;
    chat: any;
    messages: Array<any>;

    constructor(private navCtrl: NavController,
                private navParams: NavParams,
                public actionSheetCtrl: ActionSheetController,
                private alertCtrl: AlertController,
                private chatS: ChatService,
                private userS: UserService) {
        this.user = navParams.get('user');
        this.chat = navParams.get('chat');
        this.viewState = "messages";
    }

    ionViewWillLoad() {
        this.chatS.observeMessagesIn(this.chat).subscribe(snapshot => {
            var messages = [];
            for (var key in snapshot) {
                var data = snapshot[key];
                if (data.sender == this.user.id) {
                    data['position'] = 'left';
                } else {
                    data['position'] = 'right';
                }
                messages.push(data);
            }
            this.messages = messages;
        });
    }

    ionViewWillUnload() {
        this.chatS.stopObservingMessagesIn(this.chat);
    }

    showOptions() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'What would you like to do?',
            cssClass: 'action-sheet',
            buttons: [
                {
                text: 'Unmatch ' + this.user.firstName,
                role: 'destructive',
                handler: () => {
                    this.unmatchUser();
                }
                },{
                text: 'Report ' + this.user.firstName,
                handler: () => {
                    this.reportUser();
                }
                },{
                text: 'Show ' + this.user.firstName + '\'s profile',
                handler: () => {
                    this.navCtrl.push(ProfilePage, {
                        user: this.user
                    });
                    
                }
                }
            ]
        });
        actionSheet.present();
    }

    unmatchUser() {
        let alert = this.alertCtrl.create({
            title: 'Are you sure you want to unmatch ' + this.user.firstName + '?',
            buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {
                    console.log('Cancel clicked');
                }
            },
            {
                text: 'Unmatch',
                handler: data => {
                    this.chatS.removeChatWithUser(this.user.id).then(success => {
                        this.navCtrl.pop();
                    }).catch(error => {
                        console.log(error);
                    });
                }
            }
            ]
        });
        alert.present();
    }

    reportUser() {
        let alert = this.alertCtrl.create({
            title: 'Report ' + this.user.firstName,
            inputs: [
            {
                name: 'message',
                placeholder: 'Message'
            }
            ],
            buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {
                    console.log('Cancel clicked');
                }
            },
            {
                text: 'Submit',
                handler: data => {
                    this.userS.reportUserWith(this.user.id, data.message);
                }
            }
            ]
        });
        alert.present();
    }
    
    attach() {
        console.log('attach');
    }
    
    send() {
        console.log(this.chatInput);
        let text = this.chatInput.replace(/^\s+/, '').replace(/\s+$/, '');
        if (text === '') {
            // text was all whitespace
        } else {
            // text has real content
            this.chatS.sendMessageTo(this.chatInput, this.user);
            this.chatInput = "";
        }
    }

}