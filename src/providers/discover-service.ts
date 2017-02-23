import { Injectable } from '@angular/core';
import { UserService } from './user-service';
import firebase from 'firebase';

@Injectable()
export class DiscoverService {

    constructor(private userS: UserService) {
        
    }
    
    isDiscoverableTo(user1, user2, seenUIDs): boolean {
      if (user1.id == user2.id)
        return false;
      if (seenUIDs && user2.id in seenUIDs)
        return false;
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

    fetchSeenUIDs(): Promise<any> {
      return new Promise((resolve, reject) => {
        firebase.database().ref('/user_saw/' + this.userS.user.id).once('value').
        then(snapshot => {
          console.log('fetched Seen UIDs:');
          console.log(snapshot.val());
          resolve(snapshot.val());
        }).catch(error => {
          reject(error);
        })
      });
    }

    fetchDiscoverableUsers(): Promise<any> {
      let user = this.userS.user;
      let env = this;
      return new Promise((resolve, reject) => {
        Promise.all([this.userS.fetchGlobalUsers(), this.fetchSeenUIDs()])
        .then(data => {
          let allUsers = data[0];
          let seenUIDs = data[1];
          let visibleUsers = [];

          // this method for parsing out seenUIDs is not totally optimal
          // - better to remove keys when both are dictionaries

          allUsers.forEach(other => {
            if (env.isDiscoverableTo(user, other, seenUIDs)) {
              visibleUsers.push(other);
            }
          });
          resolve(visibleUsers);
        }).catch(error => {
          reject(error);
        })
      });
    }

    saw(uid): Promise<any> {
        console.log("saw user");
        return new Promise((resolve, reject) => {
          var data = {};
          data[uid] = (new Date).getTime();
          let ref = firebase.database().ref('/user_saw/' + this.userS.user.id);
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
        return new Promise((resolve, reject) => {
          var data = {};
          data[uid] = (new Date).getTime();
          let ref = firebase.database().ref('/user_liked/' + this.userS.user.id);
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
        return new Promise((resolve, reject) => {
          var data = {};
          data[uid] = (new Date).getTime();
          let ref = firebase.database().ref('/user_liked/' + this.userS.user.id);
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
