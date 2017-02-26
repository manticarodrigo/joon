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
          console.log('Fetched Seen UIDs:');
          console.log(snapshot.val());
          resolve(snapshot.val());
        }).catch(error => {
          reject(error);
        })
      });
    }

    fetchLikedUIDS(): Promise<any> {
      return new Promise((resolve, reject) => {
        firebase.database().ref('/user_liked/' + this.userS.user.id).once('value').
        then(snapshot => {
          console.log('Fetched Liked UIDs:');
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

    fetchMatchedUsers(): Promise<any> {
      console.log("Fetching matched users...");
      let user = this.userS.user;
      let env = this;
      return new Promise((resolve, reject) => {
        this.fetchLikedUIDS().then(likedUIDs => {
          if (likedUIDs) {
            let matchedUsers = [];
            let dictCount = Object.keys(likedUIDs).length;
            console.log(dictCount);
            let likedCount = 0;
            for (var uid in likedUIDs) {
              this.checkForMatchWith(uid).then(matched => {
                if (matched) {
                  console.log("Found a match!")
                  this.userS.fetchUser(uid).then(user => {
                    console.log("Returned matched user!")
                    matchedUsers.push(user);
                    likedCount++;
                    if (likedCount == dictCount) {
                      resolve(matchedUsers);
                    }
                  }).catch(error => {
                    console.log(error);
                    reject(error);
                  });
                } else {
                  console.log("Not a match!")
                  likedCount++;
                  if (likedCount == dictCount) {
                    resolve(matchedUsers);
                  }
                }
              }).catch(error => {
                console.log(error);
                reject(error);
              });
            }
          } else {
            console.log("No liked users found!");
            resolve([]);
          }
        }).catch(error => {
          reject(error);
        })
      });
    }

    saw(uid): Promise<any> {
        console.log("Seeing user...");
        return new Promise((resolve, reject) => {
          var data = {};
          data[uid] = (new Date).getTime();
          let ref = firebase.database().ref('/user_saw/' + this.userS.user.id);
          ref.update(data).then( data => {
              console.log("User saw saved to DB!");
              return ref.once('value');
          }).then( snapshot => {
              console.log("User saw returned from DB!");
              let val = snapshot.val();
              console.log("Snapshot val: " + JSON.stringify(val));
              resolve(val);
          }).catch(error => {
              console.log(error);
              reject(error);
          });
        });
    }
    
    liked(uid): Promise<boolean> {
        console.log("Liking user...");
        return new Promise((resolve, reject) => {
          var data = {};
          data[uid] = (new Date).getTime();
          let ref = firebase.database().ref('/user_liked/' + this.userS.user.id);
          ref.update(data).then(data => {
              console.log("User liked saved to DB!");
              return ref.once('value');
          }).then(snapshot => {
              console.log("User liked returned from DB!");
              this.checkForMatchWith(uid).then(matched => {
                resolve(matched);
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
    
    doubleLiked(uid): Promise<boolean> {
        console.log("Double liking user...");
        return new Promise((resolve, reject) => {
          var data = {};
          data[uid] = (new Date).getTime();
          let ref = firebase.database().ref('/user_liked/' + this.userS.user.id);
          ref.update(data).then( data => {
              console.log("User double like saved to DB");
              return ref.once('value');
          }).then( snapshot => {
              console.log("User double like returned from DB!");
              this.checkForMatchWith(uid).then(matched => {
                resolve(matched);
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

    checkForMatchWith(uid): Promise<boolean> {
      console.log("Checking for match...");
      return new Promise((resolve, reject) => {
          let ref = firebase.database().ref('/user_liked/' + uid + '/' + this.userS.user.id);
          ref.once('value').then(snap => {
            if (snap) {
              console.log("User likes current user!");
              resolve(true);
            } else {
              console.log("User has not liked current user!");
              resolve(false);
            }
          }).catch(error => {
              console.log(error);
              reject(error);
          });
        });
    }

    resetSeenFor(uid): Promise<any> {
        console.log("Resetting seen data...");
        return new Promise((resolve, reject) => {
          let ref = firebase.database().ref('/user_saw/' + this.userS.user.id);
          ref.set({}).then(data => {
              console.log("Seen data reset DB!");
              return ref.once('value');
          }).then(snapshot => {
              console.log("Seen data returned from DB!");
              let val = snapshot.val();
              console.log("Snapshot val: " + JSON.stringify(val));
              resolve(val);
          }).catch(error => {
              console.log(error);
              reject(error);
          });
        });
    }

    resetLikesFor(uid): Promise<any> {
        console.log("Resetting likes data...");
        return new Promise((resolve, reject) => {
          let ref = firebase.database().ref('/user_liked/' + this.userS.user.id);
          ref.set({}).then(data => {
              console.log("Likes data reset DB!");
              return ref.once('value');
          }).then(snapshot => {
              console.log("Likes data returned from DB!");
              let val = snapshot.val();
              console.log("Snapshot val: " + JSON.stringify(val));
              resolve(val);
          }).catch(error => {
              console.log(error);
              reject(error);
          });
        });
    }

}
