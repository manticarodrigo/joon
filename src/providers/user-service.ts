import { Injectable } from '@angular/core'

import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Facebook } from 'ionic-native';
import firebase from 'firebase';

@Injectable()
export class UserService {
  af: any;
  public currentUserSnapshot: any;
  public currentUserUID: any;
  public user: any;
  public searchPrefs: any;

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
    rv.showAge = true;

    let nJobs = rv.work.length;
    if (nJobs >= 1) {
      rv.job = rv.work[0].position.name;
      rv.company = rv.work[0].employer.name;
    }
    delete rv.work;

    delete rv.friends.summary;

    rv.photoURL = "https://graph.facebook.com/" + rv.uid + "/picture?type=large";
    
    return rv;
  }

  callFacebookAPI() {
    console.log("user 83");
    return new Promise((resolve, reject) => {
      // on Browser and Android, specify location{location} to reduce to 1 request
      // this does not work on iPhone
      Facebook.api('/me?fields=id,name,gender,birthday,education,first_name,location,religion,work,friends', [])
      .then( (data) => { 
        console.log('requesting location data from facebook API');
        let apiStr = '/' + data.location.id + '?fields=location';
        Facebook.api(apiStr, [])
        .then((locData) => {
          console.log('location data retrieved from facebook API');
          data.location = locData;
          //alert(JSON.stringify(data));
          resolve(this.parseFacebookUserData(data));
        }).catch((error) => {
          reject(error);
        });
      }, (error) => { reject(error); });
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
    console.log("updating user in db in user-service");
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/users/' + uid);
      ref.update(data).then( data => {
        return ref.once('value');
      }).then( snapshot => { 
        resolve(snapshot.val());
      });
    });
  }

  getUserSearch(): Promise<any> {
    let uid = this.user.id;
    let ref = firebase.database().ref('user_search/' + uid);
    // this wrapping just converts from firebase.Promise to ordinary Promise
    return new Promise((resolve, reject) => {
      ref.once('value').then(snapshot => { 
        console.log("user-service -- retrieved and resolving with user_search/" + uid);
        console.log(snapshot.val());
        resolve(snapshot.val()); 
      });
    });
  }

  getAllUserSearchPrefs(): Promise<any> {
    let ref = firebase.database().ref('/user_search/');
    return new Promise((resolve, reject) => {
      ref.once('value').then(snapshots => { 
        console.log("user-service -- retrieved and resolving with user_search");
        // //console.log(snapshot.val());
        // //resolve(snapshot.val());
        // let arr = [];
        // let temp = null;
        // snapshots.forEach(snapshot => {
        //   temp = snapshot.val();
        //   temp.id = snapshot.key;
        //   arr.push(temp);
        // });
        // console.log(arr);
        resolve(snapshots.val());
      });
    });
  }

  updateSearchInDB(data): Promise<any> {
    let uid = this.user.id;
    let ref = firebase.database().ref('user_search/' + uid);
    return new Promise((resolve, reject) => {
      ref.update(data).then(() => { 
        this.getUserSearch().then(data => { resolve(data); }); 
      });
    });
  }

  fetchUserDataByIds(userIds): Promise<any> {
    console.log("fetching user data for id list: " + JSON.stringify(userIds));
    var pArr = [];
    let ref = firebase.database().ref('users');
    userIds.forEach(uid => {
      pArr.push(new Promise((resolve, reject) => {
        ref.child(uid).once('value').then(snapshot => {
          resolve(snapshot.val());
        });
      }));
    });
    return Promise.all(pArr);
  }

  fetchSeenUserIds(): Promise<any> {
    let uid = this.user.id;
    let ref = firebase.database().ref('users_seen/' + uid);
    return new Promise((resolve, reject) => {
      ref.once('value').then(snapshot => {
        console.log('retrieved and resolving with users_seen/' + uid);
        console.log(snapshot.val());
        resolve(snapshot.val());
      })
    });   
  }

  shouldSeeOtherByPrefs(searchPrefs) {
    let self = this.searchPrefs;
    let other = searchPrefs;

    if (other.female && !self.lff) return false;
    if (!other.female && !self.lfm) return false;

    if (self.female && !other.lff) return false;
    if (!self.female && !other.lfm) return false;

    if (self.distance != 'global' && self.country != other.country)
      return false;

    return true;
  }

  fetchDiscoverableUserIds(): Promise<any> {
    return new Promise((resolve, reject) => {
      return Promise.all([
        this.getAllUserSearchPrefs(),
        this.fetchSeenUserIds(),
      ]).then(dataArr => { 
        console.log("determining visible user ids");
        let allSearchPrefs = dataArr[0];
        let seenUserIds = dataArr[1] || {};
        // we could check every entry against all seen ids, but this scales
        // m x n for the two array sizes, getting slower as more users are seen.
        // it is faster to hash all-users and seen together then delete collisions.
        // Fortunately, they come from firebases as dictionarys already.
        let rv = [];
        let val = null;
        Object.keys(allSearchPrefs).forEach(key => {
          let val = allSearchPrefs[key];
          if (this.shouldSeeOtherByPrefs(val)
              && !(key in seenUserIds)
              && !(key == this.user.id)) {
            rv.push(key);
          }
        });
        console.log("visible users id array constructed")
        console.log(rv);
        resolve(rv);
      });
    });
  }

  userSearchExistsInDB(uid): Promise<boolean> {
    let ref = firebase.database().ref('user_search/' + uid);
    return new Promise((resolve, reject) => {
      ref.once('value').then(snapshot => {
        if (snapshot.exists()) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  createUserSearchInDB(user): Promise<any> {
    let searchData = {
      age: user.age,
      country: user.country,
      distance: 'global',
      female: (user.gender == 'female'),
      lff: (user.gender == 'male'),
      lfm: (user.gender == 'female')
    }
    return this.updateSearchInDB(searchData);
  }

  setupUser(uid): Promise<any> {
    console.log("setting up user in user-service");
    this.currentUserUID = uid;
    return new Promise((resolve, reject) => {
      console.log("calling facebook API in user-service");
      this.callFacebookAPI()
      .then((fbData) => { return this.updateUserInDB(fbData); })
      .then((dbData) => { 
        this.user = dbData;
        this.userSearchExistsInDB(uid).then(() => {
          this.getUserSearch().then((searchPrefs) => { 
            this.searchPrefs = searchPrefs;
            resolve(dbData); 
          })
        }).catch(() => { 
          this.createUserSearchInDB(dbData)
          .then((searchPrefs) => { 
            this.searchPrefs = searchPrefs;
            resolve(dbData); 
          });
        });
      })
      .catch(error => { reject(error); } );
    });
  }
}
