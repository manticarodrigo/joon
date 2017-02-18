import { Injectable } from '@angular/core';
import { UserService } from './user-service';
import firebase from 'firebase';

@Injectable()
export class DiscoverService {

    constructor(private userS: UserService) {
        
    }
    
    seen(uid): Promise<any> {
        console.log("saw user");
        var data = {};
        data[uid] = true;
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users_seen/' + this.userS.user.uid);
            ref.update(data).then( data => {
                console.log("user seen saved to db");
                return ref.once('value');
            }).then( snapshot => {
                console.log("user seen returned from db");
                let val = snapshot.val();
                console.log("snapshot val: " + JSON.stringify(val));
                resolve(val);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }
    
    like(uid): Promise<any> {
        console.log("liking user");
        var data = {};
        data[uid] = true;
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users_liked/' + this.userS.user.uid);
            ref.update(data).then( data => {
                console.log("user like saved to db");
                return ref.once('value');
            }).then( snapshot => {
                console.log("user like returned from db");
                let val = snapshot.val();
                console.log("snapshot val: " + JSON.stringify(val));
                resolve(val);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }
    
    doubleLike(uid): Promise<any> {
        console.log("double liking user");
        var data = {};
        data[uid] = true;
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users_liked/' + this.userS.user.uid);
            ref.update(data).then( data => {
                console.log("user double like saved to db");
                return ref.once('value');
            }).then( snapshot => {
                console.log("user double like returned from db");
                let val = snapshot.val();
                console.log("snapshot val: " + JSON.stringify(val));
                resolve(val);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
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

}
