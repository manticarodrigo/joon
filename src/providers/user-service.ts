import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import firebase from 'firebase';

@Injectable()
export class UserService {

    public user: any;

    constructor(private storage: Storage) {
        
    }

    updateCurrentUser(user) {
        console.log("Updating user data in local storage and user service...");
        this.user = user;
        this.storage.set('user', user);
    }

    fetchGlobalUsers(): Promise<any> {
        console.log("fetching global users");
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
                console.log("Fetch returned user!");
                let val = snap.val();
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

    updateUser(user): Promise<any> {
        console.log("Updating user with id: " + user.id);
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users/' + user.id);
            ref.update(user).then((snap) => {
                console.log("Update returned user!");
                let val = snap.val();
                resolve(val);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }
}