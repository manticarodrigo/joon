import { Injectable } from '@angular/core'

import { AngularFire, FirebaseListObservable } from 'angularfire2';

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
          console.log(this.currentUserSnapshot);
          callback(this.currentUserSnapshot);
        });
      } else {
        callback(this.currentUserSnapshot);
      }
    }
  }
}