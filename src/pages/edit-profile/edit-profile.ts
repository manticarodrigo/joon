import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { UserService } from '../../providers/user-service';
import { StorageService } from '../../providers/storage-service';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditProfilePage {
    images: Array<any>;
    user: any;
    constructor(public navCtrl: NavController,
                private userS: UserService,
                private storageS: StorageService) {
        this.user = this.userS.user;
    }
    
    ionViewWillEnter() {
        this.fetchUserImages();
    }
    
    fetchUserImages() {
        this.storageS.fetchImagesFor(this.userS.user.id).then(urlList => {
            this.images = urlList;
        });
    }

    editProfileSubmit() {
        console.log("Save pressed!");
        this.userS.updateUser(this.userS.user);
    }
    
    uploadProfileImage(event) {
        var file = event.srcElement.files[0];
        this.storageS.uploadProfileImageFor(this.userS.user.id, file).then(url => {
            this.user['photoURL'] = url;
            this.userS.updateCurrentUser(this.user);
        }).catch(error => {
            console.log(error);
        });
    }
    
    uploadImage(event, index) {
        var file = event.srcElement.files[0];
        this.storageS.uploadImageFor(this.userS.user.id, file, index).then(url => {
            this.images[index] = url;
        });
    }

}