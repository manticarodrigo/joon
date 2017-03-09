import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

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
    
    constructor(public navCtrl: NavController,
                private navParams: NavParams,
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
    
    ionViewWillEnter() {
        this.fetchUserImages();
        let env = this;
        if (this.user.id != this.userS.user.id) {
            for (var i in env.user.friends) {
                let uid = env.user.friends[i];
                if (env.userS.user.friends.includes(uid)) {
                    if (env.mutual) {
                        this.userS.fetchUser(uid).then(user => {
                            env.mutual.push(user);
                        }).catch(error => {
                            console.log(error);
                        });
                    } else {
                        this.userS.fetchUser(uid).then(user => {
                            env.mutual = [user];
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                }
            }
        }
    }
    
    fetchUserImages() {
        this.storageS.fetchImagesFor(this.user.id).then(urlList => {
            this.images = urlList;
        });
    }

    editProfile() {
        this.navCtrl.push(EditProfilePage);
    }

}