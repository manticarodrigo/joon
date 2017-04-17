import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController, LoadingController, Content } from 'ionic-angular';
import { Camera, PhotoViewer } from 'ionic-native';

import { ChatService } from '../../providers/chat-service';
import { UserService } from '../../providers/user-service';
import { DiscoverService } from '../../providers/discover-service';
import { StorageService } from '../../providers/storage-service';
import { PushService } from '../../providers/push-service';
import { SettingsService } from '../../providers/settings-service';

import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
    @ViewChild(Content) content: Content;
    atBottom = false;
    chatInput = "";
    user: any;
    chat: any;
    messages: Array<any>;
    unmatching = false;

    constructor(private navCtrl: NavController,
                private navParams: NavParams,
                private actionSheetCtrl: ActionSheetController,
                private alertCtrl: AlertController,
                private loadingCtrl: LoadingController,
                private chatS: ChatService,
                private userS: UserService,
                private discoverS: DiscoverService,
                private storageS: StorageService,
                private pushS: PushService,
                private settingsS: SettingsService) {
        this.user = navParams.get('user');
        this.chat = navParams.get('chat');
    }

    ionViewDidEnter() {
        this.scrollToBottom();
        /*let dimensions = this.content.getContentDimensions();
        this.content.onScrollElementTransitionEnd((event) => {
            console.log(event);
            if (this.content.scrollTop + dimensions.contentHeight > dimensions.scrollHeight) {
                this.atBottom = true;
            } else {
                this.atBottom = false;
            }
        });*/
    }
    scrollToBottom() {
        console.log("Scrolling to bottom!");
        let dimensions = this.content.getContentDimensions();
        this.content.scrollTo(0, dimensions.scrollHeight, 250); //x, y, ms animation speed
    }

    ionViewWillLoad() {
        this.chatS.observeMessagesIn(this.chat).subscribe(messages => {
            var messageArr = [];
            for (var key in messages) {
                var message = messages[key];
                if (message['sender'] == this.user.id) {
                    message['position'] = 'left';
                } else {
                    message['position'] = 'right';
                }
                messageArr.push(message);
            }
            messageArr.sort(function(a, b){
                return a.timestamp-b.timestamp;
            });
            this.messages = messageArr;
            this.scrollToBottom();
        });
    }

    ionViewWillUnload() {
        this.chatS.stopObservingMessagesIn(this.chat);
        if (!this.unmatching) {
            this.chatS.updateUserActivityIn(this.chat);
        }
    }

    showProfile() {
        this.navCtrl.push(ProfilePage, {
            user: this.user
        });
    }

    showImage(url) {
        PhotoViewer.show(url);
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
                },{
                text: 'Cancel',
                role: 'cancel'
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
                        this.unmatching = true;
                        this.chatS.stopObservingChats();
                        this.chatS.observeChats();
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
        let loading = this.loadingCtrl.create({
            content: 'Uploading image...'
        });
        loading.present();
        this.storageS.uploadAttachmentIn(this.chat.id, imageData).then(url => {
            this.chatS.sendAttachmentTo(this.user, url).then(url => {
                console.log(url);
                loading.dismiss();
                if (this.user.pushId) {
                    this.settingsS.fetchUserSettings(this.user).then(settings => {
                        if (settings.messages) {
                            this.pushS.push(this.userS.user.firstName + " sent an image.", this.user);
                        }
                    }).catch(error => {
                        console.log(error);
                    });
                }
            }).catch(error => {
                console.log(error);
                loading.dismiss();
            });
        }).catch(error => {
            console.log(error);
            loading.dismiss();
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
                    this.settingsS.fetchUserSettings(this.user).then(settings => {
                        if (settings.messages) {
                            this.pushS.push(input, this.user);
                        }
                    }).catch(error => {
                        console.log(error);
                    });
                }
            }).catch(error => {
                console.log(error);
                this.chatInput = input;
            });
        }
    }

}