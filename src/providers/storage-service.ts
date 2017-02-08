import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Injectable()
export class StorageService {
    
    storageRef = firebase.storage().ref(); 
    
    af: any;

    constructor(af: AngularFire) {
        this.af = af;
    }
    
    updateImageFor(uid, url, index) {
        var updates = {};
        updates[index] = url;
        this.af.database.object('/userImages/' + uid).update(updates);
    }
    
    setProfileImageFor(uid, url) {
        this.af.database.object('/users/' + uid + '/photoURL/').set(url);
    }
    
    getImagesFor(uid, callback) {
        this.af.database.list('/userImages/' + uid, { preserveSnapshot: true }).subscribe(snapshots => { 
            let snapshotsArr = [];
            snapshots.forEach(sn => { snapshotsArr.push(sn.val()) });
            callback(snapshotsArr);
        });
    }
    
    uploadImageFor(uid, data, index) {
        var now = JSON.stringify(new Date());
        this.storageRef.child(uid + '/images/' + now + '.png').put(data).then(snapshot => this.updateImageFor(uid, snapshot.downloadURL, index));
    }
    
    uploadProfileImageFor(uid, data) {
        this.storageRef.child(uid + '/image.png').put(data).then(snapshot => this.setProfileImageFor(uid, snapshot.downloadURL));
    }

}