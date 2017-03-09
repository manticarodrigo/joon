import { Injectable } from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class StorageService {
    storageRef = firebase.storage().ref();
    
    constructor() {
    }
    
    updateImageFor(uid, url, index): Promise<any> {
      console.log("Uploading image to storage...");
      return new Promise((resolve, reject) => {
        var updates = {};
        updates[index] = url;
        firebase.database().ref('/user_images/' + uid).update(updates).then(success => {
            console.log("DB saved image url!");
            resolve(url);
        }).catch(error => {
            console.log(error);
            reject(error);
        });
      });
    }
    
    setProfileImageFor(uid, url): Promise<any> {
      console.log("Setting profile image url in DB...");
      return new Promise((resolve, reject) => {
          firebase.database().ref('/users/' + uid + '/photoURL/').set(url).then(success => {
            console.log("DB set new profile image url!");
            resolve(url);
          }).catch(error => {
            console.log(error);
            reject(error);
          });
      });
    }
    
    fetchImagesFor(uid): Promise<any> {
        console.log("Fetching image urls for: " + uid);
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/user_images/' + uid);
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
    
    uploadImageFor(uid, imageString, index): Promise<any> {
      console.log("Uploading profile image...");
      return new Promise((resolve, reject) => {
        var now = JSON.stringify(new Date());
        this.storageRef.child(uid + '/images/' + now + '.png').putString(imageString, 'base64', {contentType: 'image/png'}).then((snapshot) => {
            console.log("Image uploaded to storage!");
            this.updateImageFor(uid, snapshot.downloadURL, index).then(url => {
                resolve(url);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        }).catch(error => {
            console.log(error);
            reject(error);
        });
      });
    }
    
    uploadProfileImageFor(uid, imageString): Promise<any> {
      console.log("Uploading profile image...");
      return new Promise((resolve, reject) => {
        this.storageRef.child(uid + '/image.png').putString(imageString, 'base64', {contentType: 'image/png'}).then((snapshot) => {
            this.setProfileImageFor(uid, snapshot.downloadURL).then(url => {
                resolve(url);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        }).catch(error => {
            console.log(error);
            reject(error);
        });
      });
    }

    uploadAttachmentIn(chatId, imageString): Promise<any> {
        console.log("Uploading attachment image...");
        return new Promise((resolve, reject) => {
            var now = JSON.stringify(new Date());
            this.storageRef.child(chatId + '/images/' + now + '.png').putString(imageString, 'base64', {contentType: 'image/png'}).then((snapshot) => {
                resolve(snapshot.downloadURL);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
      });
    }

}