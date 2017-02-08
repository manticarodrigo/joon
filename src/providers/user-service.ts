import { Injectable } from '@angular/core'

import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Facebook } from 'ionic-native';

@Injectable()
export class UserService {
  af: any;
  public currentUserSnapshot: any;
  public currentUserUID: any;

  constructor(af: AngularFire) {
    this.af = af;
    this.currentUserUID = null;
    this.currentUserSnapshot = null;
  }

  getCurrentUser() {
    // console.log("***" + this.currentUserUID + "***");
    if (this.currentUserUID != null) {
        return this.af.database.object('/users/' + this.currentUserUID)
    } else {
        return null;
    }
  }

  addUserByUID(uid, val) {
    // use update rather than set so the user isn't overwritten on each login
    this.af.database.object('/users/' + uid).update(val);

    // when adding or updating a user, also re-fetch facebook info
    Facebook.getLoginStatus().then((response) => {
      if (response.status == 'connected') {
        this.callFacebookAPI((data) => {
          this.af.database.object('/users/' + uid).update(data);
        });
      } else {
        console.log('Error: Facebook.getLoginStatus response status != connected');
      }
    }, (error) => {
      console.log("Facebook.getLoginStatus returned error:");
      console.log(error);
    });

  }

  parseFacebookUserData(data) {
    let rv = data;

    rv.firstName = rv.first_name;
    delete rv.first_name;

    rv.city = rv.location.location.city;
    rv.country = rv.location.location.country;
    delete rv.location;

    let nSchools = rv.education.length;
    if (nSchools >= 1) {
      rv.school = rv.education[nSchools - 1].school.name;
    }
    if (nSchools >= 2) {
      rv.school2 = rv.education[nSchools - 2].school.name;
    }
    delete rv.education;

    let splitBDay = rv.birthday.split('/');
    var year = parseInt(splitBDay[2]);
    var month = parseInt(splitBDay[0]);
    var day = parseInt(splitBDay[1]);
    
    let today = new Date();
    let age = today.getFullYear() - year;
    if ( today.getMonth() < (month - 1) ) {
      age--;
    } else if (((month - 1) == today.getMonth()) && (today.getDate() < day)) {
      age--;
    }
    rv.age = age;

    let nJobs = rv.work.length;
    if (nJobs >= 1) {
      rv.job = rv.work[0].position.name;
      rv.company = rv.work[0].employer.name;
    }
    delete rv.work;

    delete rv.friends.summary;
    
    return rv;
  }

  callFacebookAPI(callback) {
    Facebook.api('/me?fields=id,name,gender,birthday,education,first_name,location{location},religion,work,friends', []).then(
      (data) => {
        callback(this.parseFacebookUserData(data));
      }, (error) => { 
        console.log("callFacebookAPI error:");
        console.log(error); 
      } 
    );
  }

  setCurrentUserUID(uid) {
    this.currentUserUID = uid;
  }

  _getCurrentUserSnapshots() {
    if (this.currentUserUID != null) {
      return this.af.database.object('/users/' + this.currentUserUID, { preserveSnapshot: true });
    } else {
      return null;
    }
  }

  setCurrentUserSnapshot(callback) {
    if (this.currentUserUID != null) {
      if (this.currentUserSnapshot == null ) {
        this._getCurrentUserSnapshots().subscribe(snapshot => { 
          this.currentUserSnapshot = snapshot.val();
          //console.log(this.currentUserSnapshot);
          callback(this.currentUserSnapshot);
        });
      } else {
        callback(this.currentUserSnapshot);
      }
    }
  }
}