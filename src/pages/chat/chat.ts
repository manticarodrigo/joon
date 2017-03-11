import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController, Content } from 'ionic-angular';
import { Camera } from 'ionic-native';

import { ChatService } from '../../providers/chat-service';
import { UserService } from '../../providers/user-service';
import { DiscoverService } from '../../providers/discover-service';
import { StorageService } from '../../providers/storage-service';
import { PushService } from '../../providers/push-service';

import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
    @ViewChild(Content) content: Content;
    chatInput = "";
    user: any;
    chat: any;
    messages: Array<any>;

    constructor(private navCtrl: NavController,
                private navParams: NavParams,
                private actionSheetCtrl: ActionSheetController,
                private alertCtrl: AlertController,
                private chatS: ChatService,
                private userS: UserService,
                private discoverS: DiscoverService,
                private storageS: StorageService,
                private pushS: PushService) {
        this.user = navParams.get('user');
        this.chat = navParams.get('chat');
    }

    ionViewDidEnter() {
        this.scrollToBottom();
    }

    scrollToBottom() {
        console.log("Scrolling to bottom!");
        let dimensions = this.content.getContentDimensions();
        // this.content.scrollToBottom(250);
        this.content.scrollTo(0, dimensions.scrollHeight, 250); //x, y, ms animation speed
    }

    ionViewWillLoad() {
        this.chatS.observeMessagesIn(this.chat).subscribe(message => {
            if (message['sender'] == this.user.id) {
                message['position'] = 'left';
            } else {
                message['position'] = 'right';
            }
            if (this.messages) {
                this.messages.push(message);
            } else {
                this.messages = [message];
            }
            this.messages.sort(function(a, b){
                return a.timestamp-b.timestamp;
            });
            this.scrollToBottom();
        });
    }

    ionViewWillUnload() {
        this.chatS.stopObservingMessagesIn(this.chat);
        this.chatS.updateUserActivityIn(this.chat);
    }

    showProfile() {
        this.navCtrl.push(ProfilePage, {
            user: this.user
        });
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
                text: 'Show ' + this.user.firstName + '\'s Profile',
                handler: () => {
                    this.showProfile();
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
                    this.discoverS.unsetMatchWith(this.user).then(success => {
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
    
    presentActionSheet() {
        let actionSheet = this.actionSheetCtrl.create({
        title: 'Select Image Source',
        cssClass: 'action-sheet',
        buttons: [
            {
            text: 'Photo Library',
            handler: () => {
                this.takePicture(Camera.PictureSourceType.PHOTOLIBRARY);
            }
            },
            {
            text: 'Camera',
            handler: () => {
                this.takePicture(Camera.PictureSourceType.CAMERA);
            }
            },
            {
            text: 'Cancel',
            role: 'cancel'
            }
        ]
        });
        actionSheet.present();
    }

    takePicture(sourceType) {
        // Create options for the Camera Dialog
        var options = {
            quality: 100,
            destinationType : Camera.DestinationType.DATA_URL,
            sourceType: sourceType,
            allowEdit : true,
            encodingType: Camera.EncodingType.PNG,
            targetWidth: 500,
            targetHeight: 500,
            saveToPhotoAlbum: true,
            correctOrientation: true
        };
        
        // Get the data of an image
        Camera.getPicture(options).then((imageData) => {
            this.uploadAttachment(imageData);
        }, (error) => {
            console.log(error);
        });
    }
    uploadAttachment(imageData) {
        console.log('Attach pressed');
        this.storageS.uploadAttachmentIn(this.chat.id, imageData).then(url => {
            this.chatS.sendAttachmentTo(this.user, url).then(url => {
                console.log(url);
                if (this.user.pushId) {
                    this.pushS.push(this.userS.user.firstName + " sent an image.", this.user);
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
                    this.pushS.push(input, this.user);
                }
            }).catch(error => {
                console.log(error);
                this.chatInput = input;
            });
        }
    }

}