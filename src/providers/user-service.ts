import { Injectable } from '@angular/core'

//import { FacebookService } from './'

import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Injectable()
export class UserService {

  af: any;
  public currentUserUID: any;

  constructor(af: AngularFire) {
    this.af = af;
    this.currentUserUID = null;
  }

  getCurrentUser() {
    // console.log("***" + this.currentUserUID + "***");
    if (this.currentUserUID != null) {
      return this.af.database.object('/users/' + this.currentUserUID)
    } else {
      return null;
    }
  }

  getCurrentUserSnapshots() {
    if (this.currentUserUID != null) {
      return this.af.database.object('/users/' + this.currentUserUID, { preserveSnapshot: true })
    } else {
      return null;
    }
  }

  addUserByUID(uid, val) {
    // use update rather than set so the user isn't overwritten on each login
    this.af.database.object('/users/' + uid).update(val);
  }

  setCurrentUserUID(uid) {
    this.currentUserUID = uid;
  }

  // getProfileDataByUID(uid) {
  //   return this.af.database.object('/userProfileData/' + uid);
  // }

  // getFacebookFriendsByUID(uid) {
  //   return this.af.database.list('/userFriends/' + uid);
  //   // returns some list of mutually hashable IDs
  //   // for a users' facebook friends
  // }

  // getLikesEarnedByUID(uid) {
  //   return this.af.database.list('/userEarnedLikes/' + uid);
  // }

  // createLike(uid) {
  //   if (this.currentUserUID == null) {
  //     return null;
  //   }
  //   let accessor = this.af.database.object('/userEarnedLikes/' + uid);
  //   accessor.push(this.currentUserUID);
  // }

  // _getFacebookAPIPublicProfile(uid) {
  //   return {
  //     first_name: 'Foo',
  //     age: 35,
  //     sex: 'male',
  //     university: 'School of Hard Knocks',
  //     location: 'Kansas City, but Not That One'
  //   }
  // }
}