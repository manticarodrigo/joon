import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Validators, FormBuilder } from '@angular/forms';

import { UserService } from '../../providers/user-service'

import { NavController } from 'ionic-angular';
import 'rxjs/Rx';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditProfilePage {
    user = {};
    userPatch: any;
    mutual: Array<any>;
    builder: FormBuilder;
    snapshotTaken = false;

    constructor(public navCtrl: NavController,
                private http: Http,
                private userService: UserService,
                private formBuilder: FormBuilder) {
        this.mutual = [];
    }

    editProfileSubmit() {
      this.userService.getCurrentUser().update(this.user);
    }

    ngAfterViewInit() {
      this.userService.setCurrentUserSnapshot(data => {this.user = data});
    }

}