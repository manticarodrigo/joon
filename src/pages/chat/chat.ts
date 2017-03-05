import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';

import { ChatService } from '../../providers/chat-service';
import { UserService } from '../../providers/user-service';
import { StorageService } from '../../providers/storage-service';
import { PushService } from '../../providers/push-service';

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
                private userS: UserService,
                private storageS: StorageService,
                private pushS: PushService) {
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
            messages.sort(function(a, b){
                return a.timestamp-b.timestamp;
            });
            this.messages = messages;
        });
    }

    ionViewWillUnload() {
        this.chatS.stopObservingMessagesIn(this.chat);
        this.chatS.updateUserActivityIn(this.chat);
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
    
    attach(event, user) {
        console.log('Attach pressed');
        var file = event.srcElement.files[0];
        this.storageS.uploadAttachmentIn(this.chat.id, file).then(url => {
            this.chatS.sendAttachmentTo(user, file).then(url => {
                console.log(url);
                if (this.user.pushId) {
                    this.pushS.post(this.userS.user.firstName + " sent an image.", this.user);
                }
            }).catch(error => {
                console.log(error);
            });
        }).catch(error => {
            console.log(error);
        });
    }
    
    send() {
        console.log('Send pressed with input: ', this.chatInput);
        let text = this.chatInput.replace(/^\s+/, '').replace(/\s+$/, '');
        if (text !== '') {
            // text has real content
            let input = this.chatInput;
            this.chatInput = "";
            this.chatS.sendMessageTo(input, this.user).then(message => {
                console.log('Message sent successfully!');
                if (this.user.pushId) {
                    this.pushS.post(input, this.user);
                }
            }).catch(error => {
                console.log(error);
                this.chatInput = input;
            });
        }
    }

}