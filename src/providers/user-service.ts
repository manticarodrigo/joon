import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import firebase from 'firebase';
import { Http } from '@angular/http';

@Injectable()
export class UserService {

    public user: any;

    constructor(private http: Http,
                private storage: Storage) {
        
    }

    reportUserWith(uid, message) {
        console.log("Reporting user...");
        let ref = firebase.database().ref('user_reported/' + this.user.id + '/' + uid);
        var data = {};
        let timestamp = new Date().getTime();
        data[timestamp] = message;
        ref.update(data);
    }

    sendFeedback(message) {
        console.log("Sending feedback...");
        let ref = firebase.database().ref('user_feedback/' + this.user.id);
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
              if (snap.exists()) {
                let val = snap.val();
                console.log("Fetch returned user:", val);
                if (!val["photoURL"]) {
                    val["photoURL"] = "https://graph.facebook.com/" + val.id + "/picture?type=large&width=600&height=600";
                }
                resolve(val);
              } else {
                reject(null);
              }
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
          if (uid) {
            let promise = new Promise((resolve, reject) => {
                let ref = firebase.database().ref('/users/' + uid);
                ref.once('value').then(snapshot => {
                    if (snapshot.exists()) {
                        let val = snapshot.val();
                        if (!val.photoURL) {
                            val.photoURL = "https://graph.facebook.com/" + val.id + "/picture?type=large&width=600&height=600";
                        }
                        resolve(val);
                    } else {
                        resolve(null);
                    }
                });
            });
            promises.push(promise);
          }
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

    hideUser(user) {
        console.log("Hiding user with id: " + user.id);
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/archived_users/' + user.id);
            ref.update(user).then(() => {
                let realRef = firebase.database().ref('/users/' + user.id);
                realRef.remove();
                console.log("Archive succeeded!");
                if (user.id == this.user.id) {
                    this.updateCurrentUser(user);
                }
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }

    fetchUserPreferences(user): Promise<any> {
      console.log("Getting user preferences with id: " + user.id);
      return new Promise((resolve, reject) => {
          let ref = firebase.database().ref('/user_preferences/' + user.id);
          ref.once('value').then((snap) => {
              if (snap.exists()) {
                let val = snap.val();
                console.log("Fetch returned user preferences:", val);
                resolve(val);
              } else {
                  var preferences = {
                    showAge: true,
                    lff: (user.gender == 'male'),
                    lfm: (user.gender == 'female'),
                    distance: 'national'
                };
                resolve(preferences);
              }
          }).catch(error => {
              console.log(error);
              reject(error);
          });
      });
    }

    updateUserPreferences(preferences): Promise<any> {
      console.log("Updating current user preferences...");
      return new Promise((resolve, reject) => {
          let ref = firebase.database().ref('/user_preferences/' + this.user.id);
          ref.update(preferences).then(data => {
            console.log("User preferences saved to DB!");
            return ref.once('value');
        }).then(snapshot => {
            console.log("User preferences returned from DB!");
            resolve(snapshot.val());
        }).catch(error => {
            console.log(error);
            reject(error);
        });
      });
    }

}