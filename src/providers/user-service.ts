import { Injectable } from '@angular/core';
import { Facebook } from 'ionic-native';
import firebase from 'firebase';

@Injectable()
export class UserService {
  af: any;
  public currentUserSnapshot: any;
  public currentUserUID: any;
  public user: any;

  constructor() {
  }

    getUserSnapshot(uid) {
        return this.af.database.object('/users/' + uid, {
        preserveSnapshot: true });
    }

  getCurrentUser() {
    // console.log("***" + this.currentUserUID + "***");
    if (this.currentUserUID != null) {
        return this.af.database.object('/users/' + this.currentUserUID)
    } else {
        return null;
    }
  }

  // addUserByUID(uid) {
  //   return new Promise((resolve, reject) => {
  //     this.callFacebookAPI().then((data) => {
  //       this.af.database.object('/users/' + uid).update(data);
  //     }, (error) => {
  //       alert(error);
  //     });
  //   });
  // }

    parseFacebookUserData(data) {
        let rv = data;
        if (rv.first_name) {
            console.log("rv has first name");
            rv.firstName = rv.first_name;
            delete rv.first_name;
            console.log(rv.firstName);
        }
        if (rv.location) {
            console.log("rv has location");
            if (rv.location.name) {
                rv.location = rv.location.name;
                console.log(rv.location);
            }
            /*if (rv.location.location.city && rv.location.location.country) {
                rv.city = rv.location.location.city;
                rv.country = rv.location.location.country;
                console.log(rv.city);
                console.log(rv.country);
            }*/
        }
        if (rv.education) {
            console.log("rv has school");
            let nSchools = rv.education.length;
            if (nSchools >= 1) {
              rv.school = rv.education[nSchools - 1].school.name;
            }
            if (nSchools >= 2) {
              rv.school2 = rv.education[nSchools - 2].school.name;
            }
            delete rv.education;
            console.log(rv.school);
            console.log(rv.school2);
        }
        if (rv.birthday) {
            console.log("rv has birthday");
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
            console.log(rv.age);
        }
        if (rv.work) {
            console.log("rv has job");
            let nJobs = rv.work.length;
            if (nJobs >= 1) {
              rv.job = rv.work[0].position.name;
              rv.company = rv.work[0].employer.name;
            }
            delete rv.work;
            console.log(rv.job);
        }

        delete rv.friends.summary;
        
        console.log(rv);
        return rv;
    }

  callFacebookAPI() {
    console.log("user 83");
    return new Promise((resolve, reject) => {
    Facebook.api('me/?fields=id,name,gender,birthday,education,first_name,location{location},religion,work,friends', [])
      .then(
        (data) => {
            console.log("user 87");
            console.log(data);
            resolve(this.parseFacebookUserData(data));
        },
        (error) => {
            reject(error);
            console.log("API request returned error!");
        });
    });
  }

  setCurrentUserUID(uid) {
    this.currentUserUID = uid;
  }

  _getCurrentUserSnapshots() {
    // alert("currentUserUID: " + this.currentUserUID);
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

  updateUserInDB(data): Promise<any> {
    let uid = this.currentUserUID;
    console.log("user 122");
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/users/' + uid);
      ref.update(data).then( data => {
        //console.log("user 128 @@@");
        return ref.once('value');
      }).then( snapshot => {
        //console.log("user 131 @@@@");
        let val = snapshot.val();
        // alert("snapshot val: " + JSON.stringify(val));
        resolve(val);
      });
    });
  }

  setupUser(uid): Promise<any> {
    console.log("user 132");
    this.currentUserUID = uid;
    return new Promise((resolve, reject) => {
      console.log("user 135");
      this.callFacebookAPI()
      .then((data) => { this.updateUserInDB(data).then(
        (data) => { console.log("user 138"); resolve(data); },
        (error) => {reject(error);}); 
      }, (error) => { reject(error); });
    });
  }
}
