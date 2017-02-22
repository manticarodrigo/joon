import { Injectable } from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class StorageService {
    storageRef = firebase.storage().ref();
    
    constructor() {
    }
    
    updateImageFor(uid, url, index) {
        console.log("Uploading image to storage...");
        var updates = {};
        updates[index] = url;
        firebase.database().ref('/user-images/' + uid).update(updates)
    }
    
    setProfileImageFor(uid, url) {
        console.log("Setting profile image url in DB...");
        firebase.database().ref('/users/' + uid + '/photoURL/').set(url);
    }
    
    fetchImagesFor(uid): Promise<any> {
        console.log("Fetching image urls for: " + uid);
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/user-images/' + uid);
            ref.once('value').then((snap) => {
                console.log("fetch returned user images");
                let snapArr = [];
                snap.forEach(snapshot => {
                    snapArr.push(snapshot.val());
                })
                resolve(snapArr);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
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