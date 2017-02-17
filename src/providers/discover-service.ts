import { Injectable } from '@angular/core';
import { UserService } from './user-service';
import firebase from 'firebase';

@Injectable()
export class DiscoverService {

    constructor(private userS: UserService) {
        
    }
    
    seen(uid): Promise<any> {
        console.log("saw user");
        var data = [uid:true];
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users_seen/' + this.userS.currentUserUID);
            ref.update(data).then( data => {
                console.log("user seen saved to db");
                return ref.once('value');
            }).then( snapshot => {
                console.log("user seen returned from db");
                let val = snapshot.val();
                console.log("snapshot val: " + JSON.stringify(val));
                resolve(val);
            });
        });
    }
    
    like(uid): Promise<any> {
        console.log("liking user");
        var data = {uid:true};
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users_liked/' + this.userS.currentUserUID);
            ref.update(data).then( data => {
                console.log("user like saved to db");
                return ref.once('value');
            }).then( snapshot => {
                console.log("user like returned from db");
                let val = snapshot.val();
                console.log("snapshot val: " + JSON.stringify(val));
                resolve(val);
            });
        });
    }
    
    doubleLike(uid): Promise<any> {
        console.log("double liking user");
        var data = {uid:true};
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users_liked/' + this.userS.currentUserUID);
            ref.update(data).then( data => {
                console.log("user double like saved to db");
                return ref.once('value');
            }).then( snapshot => {
                console.log("user double like returned from db");
                let val = snapshot.val();
                console.log("snapshot val: " + JSON.stringify(val));
                resolve(val);
            });
        });
    }

}
