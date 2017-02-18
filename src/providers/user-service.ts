import { Injectable } from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class UserService {
    public user: any;

    constructor() {
    }
    
    fetchUser(uid): Promise<any> {
        console.log("Getting user with id: " + uid);
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users/' + uid);
            ref.once('value').then((snap) => {
                console.log("fetch returned user");
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
}