import { Injectable } from '@angular/core'

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

  addUserByUID(uid, val) {
    this.af.database.object('/users/' + uid).set(val);
  }

  setCurrentUserUID(uid) {
    this.currentUserUID = uid;
  }
}