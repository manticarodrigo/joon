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

  fetchNewMatches(): Promise<any> {
    let user = this.userS.user;
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/new_matches/' + user.id);
      ref.once('value').then(snapshot => {
        resolve(snapshot.val());
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

    // The Liked table is always our reference for who likes who and so
    // we first create a normal like, then a double like seperately.

    return new Promise((resolve, reject) => {
      let user = this.userS.user;
      this.liked(uid).then(matched => {
        var data = {};
        data[user.id] = (new Date).getTime();
        let ref = firebase.database().ref('/double_liked_by/' + uid);
        ref.update(data).then(() => {
          resolve(matched); 
        }).catch(error => {
          reject(error);
        });
      }).catch(error => {
        reject(error);
      });
    });
  }

  checkForMatchWith(uid): Promise<boolean> {
    console.log("Checking for match...");
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_liked/' + uid + '/' + this.userS.user.id);
      ref.once('value').then(snap => {
        if (snap.exists()) {
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

  // this is a reliable but computationally expensive method, in the future
  // it would be reasonable to store this number and update as-needed
  getRankedUsersIDs(): Promise<any> {
    console.log("Finding top users...");
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_liked/');
      ref.once('value').then(snapshots => {
        let likedCounts = {};
        snapshots.forEach(snapshot => {
          snapshot.forEach(liked => {
            if (!(liked.key in likedCounts)) {
              likedCounts[liked.key] = 0;
            }
            console.log("adding 1 for " + liked.key);
            likedCounts[liked.key] += 1;
          });
        })

        let ref2 = firebase.database().ref('/double_liked_by/');
        ref2.once('value').then(snapshots => {
          snapshots.forEach(snapshot => {
            if (!(snapshot.key in likedCounts)) {
              likedCounts[snapshot.key] = 0;
            }
            let count = snapshot.numChildren();
            console.log("adding extra " + count + " for " + snapshot.key);
            likedCounts[snapshot.key] += count;
          });

          console.log("liked Counts: ");
          console.log(likedCounts)

          let userIdArr = Object.keys(likedCounts);
          
          userIdArr.sort((a: any, b: any) => {
            let likesA = likedCounts[a];
            let likesB = likedCounts[b];
            // this is a descending sort
            if (likesA < likesB) {
              return 1;
            } else if (likesA > likesB) {
              return -1;
            } else {
              return 0;
            }
          });

          resolve(userIdArr);
        }).catch(error => {
          reject(error);
        })
      }).catch(error => {
        reject(error);
      });
    });
  }

}
