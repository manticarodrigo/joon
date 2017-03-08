import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import firebase from 'firebase';

@Injectable()
export class UserService {

    public user: any;

    constructor(private storage: Storage) {
        
    }

    reportUserWith(uid, message) {
        console.log("Reporting user...");
        let ref = firebase.database().ref('user_reported/' + this.user.id + '/' + uid);
        var data = {};
        let timestamp = new Date().getTime();
        data[timestamp] = message;
        ref.update(data);
    }

    updateCurrentUser(user) {
        console.log("Updating user data in local storage and user service...");
        this.user = user;
        this.storage.set('user', user);
    }
  
    fetchAllUsers(): Promise<any> {
        console.log("Fetching global users...");
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users/');
            ref.once('value').then((snap) => {
                console.log("fetch returned global users");
                let snapArr = [];
                snap.forEach(snapshot => {
                    let val = snapshot.val();
                    if (!val["photoURL"]) {
                        val["photoURL"] = "https://graph.facebook.com/" + val.id + "/picture?type=large";
                    }
                    snapArr.push(val);
                })
                resolve(snapArr);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }
    
    fetchUser(uid): Promise<any> {
      console.log("Getting user with id: " + uid);
      return new Promise((resolve, reject) => {
          let ref = firebase.database().ref('/users/' + uid);
          ref.once('value').then((snap) => {
              let val = snap.val();
              console.log("Fetch returned user:", val);
              if (!val["photoURL"]) {
                  val["photoURL"] = "https://graph.facebook.com/" + val.id + "/picture?type=large";
              }
              resolve(val);
          }).catch(error => {
              console.log(error);
              reject(error);
          });
      });
    }

    fetchUsers(uids): Promise<any> {
      console.log("Getting users with ids: " + JSON.stringify(uids));

      var promises = [];

      uids.forEach(uid => {
        let promise = new Promise((resolve, reject) => {
          let ref = firebase.database().ref('/users/' + uid);
          ref.once('value').then(snapshot => {
            resolve(snapshot.val());
          });
        });
        promises.push(promise);
      });

      return Promise.all(promises);
    }

    updateUser(user): Promise<any> {
      console.log("Updating user with id: " + user.id);
      return new Promise((resolve, reject) => {
          let ref = firebase.database().ref('/users/' + user.id);
          ref.update(user).then(() => {
            console.log("Update succeeded!");
            if (user.id == this.user.id) {
                this.updateCurrentUser(user);
            }
            resolve(true);
          }).catch(error => {
            console.log(error);
            reject(error);
          });
      });
    }
}