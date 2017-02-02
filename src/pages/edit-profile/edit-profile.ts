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
        this.userPatch = this.formBuilder.group({
          country: [''],
          city: [''],
          school: [''],
          jobTitle: [''],
          company: [''],
          religion: [''],
          ethnicity: [''],
          bio: [''] 
        });
        //this.generateRandomUser();
        this.mutual = [];
    }

    mergeUserDefaults(data) {
      return {
        firstName: data.firstName || '',
        country: data.country || '',
        city: data.country || '',
        school: data.school || 'School of Merged Data',
        jobTitle: data.jobTitle || '',
        company: data.company || '',
        religion: data.religion || '',
        ethnicity: data.ethnicity || '',
        bio: data.bio || '',
        photoURL: data.photoURL || ''
      }
    }

    readOnceCurrentUser() {
      this.userService.getCurrentUserSnapshots()
        .subscribe(snapshot => { 
          if (!this.snapshotTaken) {
            this.user = this.mergeUserDefaults(snapshot.val());
            this.snapshotTaken = true;
          }
        })
    }

    editProfileSubmit() {
      console.log(this.user)
      this.userService.getCurrentUser().update(this.user);
    }

    ngAfterViewInit() {
      this.snapshotTaken = false;
      this.readOnceCurrentUser();
    }

}