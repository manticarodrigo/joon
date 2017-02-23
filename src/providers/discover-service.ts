import { Injectable } from '@angular/core';
import { UserService } from './user-service';
import firebase from 'firebase';

@Injectable()
export class DiscoverService {

    constructor(private userS: UserService) {
        
    }
    
    isVisibleTo(user1, user2): boolean {
      if (user1.gender == 'male' && !user2.lfm)
        return false;
      if (user1.gender == 'female' && !user2.lff)
        return false;
      if (user2.gender == 'male' && !user1.lfm)
        return false;
      if (user2.gender == 'female' && !user1.lff)
        return false;
      if (user1.distance == 'country' && user1.country != user2.country)
        return false;
      return true;
    }

    fetchVisibleUsers(): Promise<any> {
      let user = this.userS.user;
      let env = this;
      return new Promise((resolve, reject) => {
        this.userS.fetchGlobalUsers().then(allUsers => {
          let visibleUsers = [];
          allUsers.forEach(other => {
            if (env.isVisibleTo(user, other)) {
              visibleUsers.push[other];
            }
          });
          resolve(visibleUsers);
        }).catch(error => { reject(error); })
      });
    }

    saw(uid): Promise<any> {
        console.log("saw user");
        var data = {};
        data[uid] = true;
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/user_saw/' + this.userS.user.uid);
            ref.update(data).then( data => {
                console.log("user saw saved to db");
                return ref.once('value');
            }).then( snapshot => {
                console.log("user saw returned from db");
                let val = snapshot.val();
                console.log("snapshot val: " + JSON.stringify(val));
                resolve(val);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }
    
    liked(uid): Promise<any> {
        console.log("liking user");
        var data = {};
        data[uid] = true;
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/user_liked/' + this.userS.user.uid);
            ref.update(data).then( data => {
                console.log("user liked saved to db");
                return ref.once('value');
            }).then( snapshot => {
                console.log("user liked returned from db");
                let val = snapshot.val();
                console.log("snapshot val: " + JSON.stringify(val));
                resolve(val);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }
    
    doubleLiked(uid): Promise<any> {
        console.log("double liking user");
        var data = {};
        data[uid] = true;
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/user_liked/' + this.userS.user.uid);
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

}
