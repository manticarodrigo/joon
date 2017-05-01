import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { PhotoViewer } from 'ionic-native';

import { UserService } from '../../providers/user-service';
import { StorageService } from '../../providers/storage-service';

import { EditProfilePage } from '../edit-profile/edit-profile';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {
    user: any;
    images: Array<any>;
    mutual: Array<any>;
    
    constructor(private navCtrl: NavController,
                private navParams: NavParams,
                private actionSheetCtrl: ActionSheetController,
                private alertCtrl: AlertController,
                private userS: UserService,
                private storageS: StorageService) {
        let user = this.navParams.get('user');
        if (user) {
            console.log("Found passed user:", user);
            this.user = user;
        } else {
            console.log("Set current user for profile page!", this.userS.user)
            this.user = this.userS.user;
        }
    }

    ionViewWillLoad() {
        let env = this;
        var mutual = [];
        for (var key in env.user.friends) {
            if (env.userS.user.friends.includes(env.user.friends[key])) {
                console.log("Found mutual friend with id: " + key);
                mutual.push(env.user.friends[key]);
            }
        }
        if (mutual.length > 0) {
            this.userS.fetchUsers(mutual)
            .then(mutual => {
                env.mutual = mutual;
            })
            .catch(error => {
                console.log(error);
            });
        }
    }
    
    ionViewWillEnter() {
        this.fetchUserImages();
    }

    mutualFriendTapped(user) {
    this.navCtrl.push(ProfilePage, {
        user: user
    });
  }
    
    fetchUserImages() {
        this.storageS.fetchImagesFor(this.user.id).then(snap => {
            let urlList = [];
            snap.forEach(snapshot => {
                console.log(snapshot.key);
                urlList.push(snapshot.val());
            })
            this.images = urlList;
        });
    }

    showImage(url) {
        PhotoViewer.show(url);
    }

    editProfile() {
        this.navCtrl.push(EditProfilePage);
    }

    showOptions() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'What would you like to do?',
            cssClass: 'action-sheet',
            buttons: [
                {
                text: 'Report ' + this.user.firstName,
                handler: () => {
                    this.reportUser();
                }
                },{
                text: 'Cancel',
                role: 'cancel'
                }
            ]
        });
        actionSheet.present();
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

}