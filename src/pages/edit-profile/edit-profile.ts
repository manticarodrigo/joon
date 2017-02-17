import { Component } from '@angular/core';
import { Http } from '@angular/http';

import { UserService } from '../../providers/user-service';
import { StorageService } from '../../providers/storage-service';

import { NavController } from 'ionic-angular';
import 'rxjs/Rx';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditProfilePage {
    user = {};
    userPatch: any;
    images: Array<any>;
    mutual: Array<any>;
    snapshotTaken = false;

    constructor(public navCtrl: NavController,
                private http: Http,
                private userService: UserService,
                private storage: StorageService) {
        this.mutual = [];
    }
    
    getUserImages() {
        this.storage.getImagesFor(this.userService.currentUserUID, (urlList) => {this.images = urlList});
    }

    editProfileSubmit() {
        this.userService.getCurrentUser().update(this.user);
    }

    ngAfterViewInit() {
        this.user = this.userService.user;
        this.getUserImages();
        //this.userService.setCurrentUserSnapshot(data => {this.user = data; this.getUserImages()});
    }
    
    uploadProfileImage(event) {
        var file = event.srcElement.files[0];
        this.storage.uploadProfileImageFor(this.userService.currentUserUID, file);
        // Refetch user data
        this.userService.setCurrentUserSnapshot(data => {this.user = data});
    }
    
    uploadImage(event, index) {
        var file = event.srcElement.files[0];
        this.storage.uploadImageFor(this.userService.currentUserUID, file, index);
        this.getUserImages();
    }

}