import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/Rx';

import { UserService } from '../../providers/user-service';
import { StorageService } from '../../providers/storage-service';

import { EditProfilePage } from '../edit-profile/edit-profile';

import { FirebaseObjectObservable } from 'angularfire2'

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {
    user = {};
    images: Array<any>;
    mutual: Array<any>;
    
    constructor(public navCtrl: NavController,
                private http: Http,
                private userService: UserService,
                private storage: StorageService) {
    }
    
    getUserImages() {
        this.storage.getImagesFor(this.userService.currentUserUID, (urlList) => {this.images = urlList});
    }

    editProfile() {
        this.navCtrl.push(EditProfilePage);
    }
  
    ngAfterViewInit() {
        this.userService.setCurrentUserSnapshot(data => {this.user = data});
        this.getUserImages();
	}

}