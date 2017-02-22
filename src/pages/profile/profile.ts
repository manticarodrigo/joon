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
            console.log("Set current user for profile page!")
            this.user = this.userS.user;
        }
    }
    
    ionViewWillEnter() {
        this.fetchUserImages();
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