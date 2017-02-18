import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { UserService } from '../../providers/user-service';
import { StorageService } from '../../providers/storage-service';

import { EditProfilePage } from '../edit-profile/edit-profile';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {
    user = {};
    images: Array<any>;
    mutual: Array<any>;
    
    constructor(public navCtrl: NavController,
                private userS: UserService,
                private storageS: StorageService) {
    }
    
    ionViewDidLoad() {
        this.user = this.userS.user;
	}
    
    ionViewWillEnter() {
        this.fetchUserImages();
    }
    
    fetchUserImages() {
        this.storageS.fetchImagesFor(this.userS.user.uid).then(urlList => {
            this.images = urlList;
        });
    }

    editProfile() {
        this.navCtrl.push(EditProfilePage);
    }

}