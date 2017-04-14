import { Injectable } from '@angular/core';
import firebase from 'firebase';

import { UserService } from './user-service';
import { ChatService } from './chat-service';
import { PushService } from './push-service';
import { SettingsService } from './settings-service';

@Injectable()
export class DiscoverService {

  constructor(private userS: UserService,
              private chatS: ChatService,
              private pushS: PushService,
              private settingsS: SettingsService) {
  }

  isDiscoverableTo(user1, user2, seenUIDs): Promise<boolean> {
    return new Promise((resolve, reject) => {
      Promise.all([this.userS.fetchUserPreferences(user1), this.userS.fetchUserPreferences(user2)])
      .then(data => {
        let pref1 = data[0];
        // let pref2 = data[1];
        if (!user2.id)
          resolve(false);
        if (user1.id == user2.id)
          resolve(false);
        if (seenUIDs && user2.id in seenUIDs)
          resolve(false);
        /*if (user1.gender == 'male' && !pref2.lfm)
          resolve(false);
        if (user1.gender == 'female' && !pref2.lff)
          resolve(false);*/
        if (user2.gender == 'male' && !pref1.lfm)
          resolve(false);
        if (user2.gender == 'female' && !pref1.lff)
          resolve(false);
        if (pref1.distance == 'national' && user1.country != user2.country)
          resolve(false);
        resolve(true);
      });
    });
  }

  fetchSeenUIDs(): Promise<any> {
    return new Promise((resolve, reject) => {
      firebase.database().ref('/user_saw/' + this.userS.user.id).once('value')
      .then(snapshot => {
        console.log('Fetched Seen UIDs:');
        console.log(snapshot.val());
        resolve(snapshot.val());
      })
      .catch(error => {
        reject(error);
      })
    });
  }

  fetchLikedUIDS(): Promise<any> {
    return new Promise((resolve, reject) => {
      firebase.database().ref('/user_liked/' + this.userS.user.id).once('value')
      .then(snapshot => {
        console.log('Fetched Liked UIDs:');
        console.log(snapshot.val());
        resolve(snapshot.val());
      })
      .catch(error => {
        reject(error);
      })
    });
  }

  fetchGlobalUsers(): Promise<any> {
    let currentUser = this.userS.user;
    let env = this;
    return new Promise((resolve, reject) => {
      Promise.all([this.userS.fetchAllUsers(), this.fetchSeenUIDs()])
      .then(data => {
        let allUsers = data[0];
        let seenUIDs = data[1];
        let visibleUsers = [];

        // this method for parsing out seenUIDs is not totally optimal
        // - better to remove keys when both are dictionaries
        var userCount = 0;
        allUsers.forEach(user => {
          env.isDiscoverableTo(currentUser, user, seenUIDs)
          .then(discoverable => {
            console.log("User is discoverable:", discoverable);

            if (discoverable) {
              visibleUsers.push(user);
            }
            userCount++;
            if (userCount == allUsers.length) {
              resolve(visibleUsers);
            }
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
        });
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  fetchLocalUsers(users): Promise<any> {
    let currentUser = this.userS.user;
    let env = this;
    return new Promise((resolve, reject) => {
      this.fetchSeenUIDs()
      .then(seenUIDs => {
        var visibleUsers = [];
        var userCount = 0;
        users.forEach(user => {
          if (user) {
            env.isDiscoverableTo(currentUser, user, seenUIDs).then(discoverable => {
              if (discoverable) {
                visibleUsers.push(user);
              }
              userCount++;
              if (userCount == users.length) {
                resolve(visibleUsers);
              }
            }).catch(error => {
              console.log(error);
              reject(error);
            });
          } else {
            userCount++
            if (userCount == users.length) {
              resolve(visibleUsers);
            }
          }
        });
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  saw(user): Promise<any> {
    console.log("Seeing user...");
    return new Promise((resolve, reject) => {
      var data = {};
      data[user.id] = new Date().getTime();
      let ref = firebase.database().ref('/user_saw/' + this.userS.user.id);
      ref.update(data)
      .then( data => {
        console.log("User saw saved to DB!");
        return ref.once('value');
      })
      .then( snapshot => {
        console.log("User saw returned from DB!");
        let val = snapshot.val();
        // console.log("Snapshot val: " + JSON.stringify(val));
        resolve(val);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  liked(user): Promise<boolean> {
    console.log("Liking user...");
    return new Promise((resolve, reject) => {
      var data = {};
      data[user.id] = new Date().getTime();
      let ref = firebase.database().ref('/user_liked/' + this.userS.user.id);
      ref.update(data).then(data => {
        console.log("User liked saved to DB!");
        return ref.once('value');
      })
      .then(snapshot => {
        console.log("User liked returned from DB!");
        this.checkForMatchWith(user).then(matched => {
          resolve(matched);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  doubleLiked(user): Promise<boolean> {
    console.log("Double liking user...");

    // The Liked table is always our reference for who likes who and so
    // we first create a normal like, then a double like seperately.

    return new Promise((resolve, reject) => {
      this.liked(user.id)
      .then(matched => {
        var data = {};
        data[user.id] = new Date().getTime();
        let ref = firebase.database().ref('/user_double_liked/' + this.userS.user.id);
        ref.update(data)
        .then(() => {
          if (user.pushId) {
            this.settingsS.fetchUserSettings(user).then(settings => {
              if (settings.doubleLikes) {
                this.pushS.push("I double liked you!", user);
              }
            }).catch(error => {
              console.log(error);
            });
          }
          resolve(matched);
        })
        .catch(error => {
          reject(error);
        });
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  fetchDailyLikes(): Promise<number> {
    console.log("Fetching daily likes...");
    return new Promise((resolve, reject) => {
      var now = new Date();
      var dayAgo = now.setDate(now.getDate() - 1).toString();
      console.log(dayAgo);
      let ref = firebase.database().ref('/user_liked/' + this.userS.user.id)
      .orderByValue()
      .endAt(dayAgo);

      ref.once('value')
      .then(snap => {
        console.log(snap.val());
        if (snap.exists()) {
          console.log("User has this many likes today:");
          console.log(snap.numChildren());
          resolve(snap.numChildren());
        } else {
          console.log("User has not liked anyone!");
          resolve(0);
        }
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  fetchDailyDoubleLikes(): Promise<number> {
    console.log("Fetching daily double likes...");
    return new Promise((resolve, reject) => {
      var now = new Date();
      var dayAgo = now.setDate(now.getDate() - 1).toString();
      console.log(dayAgo);
      let ref = firebase.database().ref('/user_double_liked/' + this.userS.user.id)
      .orderByValue()
      .endAt(dayAgo);

      ref.once('value')
      .then(snap => {
        console.log(snap.val());
        if (snap.exists()) {
          console.log("User has this many double likes today:");
          console.log(snap.numChildren());
          resolve(snap.numChildren());
        } else {
          console.log("User has not double liked anyone!");
          resolve(0);
        }
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }


  checkForMatchWith(user): Promise<boolean> {
    console.log("Checking for match...");
    console.log(user.id);
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_liked/' + user.id + '/' + this.userS.user.id);
      ref.once('value')
      .then(snap => {
        console.log(snap.val());
        if (snap.exists()) {
          console.log("User likes current user!");
          this.setMatchWith(user)
          .then(success => {
            resolve(true);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
        } else {
          console.log("User has not liked current user!");
          resolve(false);
        }
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  setMatchWith(user): Promise<boolean> {
    console.log("Setting match...");
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_matches/' + this.userS.user.id);
      let data = {};
      data[user.id] = new Date().getTime();
      ref.update(data)
      .then(data => {
        console.log("Match data saved in DB!");
        let otherRef = firebase.database().ref('/user_matches/' + user.id);
        let otherData = {};
        otherData[this.userS.user.id] = new Date().getTime();
        otherRef.update(otherData).then(data => {
          // Create new chat object on match for chat observation purposes
          this.chatS.chatWith(user)
          .then(chat => {
            if (this.chatS.chats) {
              this.chatS.chats.push(chat);
            } else {
              this.chatS.chats = [chat];
            }
            if (user.pushId) {
              this.settingsS.fetchUserSettings(user)
              .then(settings => {
                if (settings.matches) {
                  this.pushS.push("You matched with me!", user);
                }
              })
              .catch(error => {
                console.log(error);
              });
            }
            resolve(true);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  unsetMatchWith(user): Promise<boolean> {
    console.log("Unsetting match...");
    return new Promise((resolve, reject) => {
      var fanout = {};
      fanout['user_matches/' + this.userS.user.id + '/' + user.id] = null;
      fanout['user_liked/' + this.userS.user.id + '/' + user.id] = null;
      fanout['user_double_liked/' + this.userS.user.id + '/' + user.id] = null;
      fanout['user_saw/' + this.userS.user.id + '/' + user.id] = null;
      let ref = firebase.database().ref();
      ref.update(fanout)
      .then(success => {
        console.log("Match data removed from DB!");
        let otherRef = firebase.database().ref('/user_matches/' + user.id + '/' + this.userS.user.id);
        otherRef.remove()
        .then(success => {
          // Remove chat object for chat observation purposes
          this.chatS.removeChatWith(user).then(success => {
            resolve(success);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  resetSeen(): Promise<any> {
    console.log("Resetting seen data...");
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_saw/' + this.userS.user.id);
      ref.set({})
      .then(data => {
        console.log("Seen data reset DB!");
        return ref.once('value');
      })
      .then(snapshot => {
        console.log("Seen data returned from DB!");
        let val = snapshot.val();
        // console.log("Snapshot val: " + JSON.stringify(val));
        resolve(val);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  resetLikes(): Promise<any> {
    console.log("Resetting likes data...");
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_liked/' + this.userS.user.id);
      ref.set({})
      .then(data => {
        console.log("Likes data reset DB!");
        return ref.once('value');
      })
      .then(snapshot => {
        console.log("Likes data returned from DB!");
        let val = snapshot.val();
        // console.log("Snapshot val: " + JSON.stringify(val));
        resolve(val);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  resetDoubleLikes(): Promise<any> {
    console.log("Resetting double likes data...");
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_double_liked/' + this.userS.user.id);
      ref.set({})
      .then(data => {
        console.log("Double likes data reset DB!");
        return ref.once('value');
      })
      .then(snapshot => {
        console.log("Double likes data returned from DB!");
        let val = snapshot.val();
        // console.log("Snapshot val: " + JSON.stringify(val));
        resolve(val);
      })
      .catch(error => {
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
      ref.once('value')
      .then(snapshots => {
        let likedCounts = {};
        snapshots.forEach(snapshot => {
          if (snapshot.exists()) {
            snapshot.forEach(liked => {
              if (liked) {
                if (!(liked.key in likedCounts)) {
                  likedCounts[liked.key] = 0;
                }
                // console.log("adding 1 for " + liked.key);
                likedCounts[liked.key] += 1;
              }
            });
          }
        })

        let ref2 = firebase.database().ref('/user_double_liked/');
        ref2.once('value')
        .then(snapshots => {
          snapshots.forEach(snapshot => {
            if (snapshot.exists()) {
              if (snapshot) {
                if (!(snapshot.key in likedCounts)) {
                  likedCounts[snapshot.key] = 0;
                }
                let count = snapshot.numChildren();
                // console.log("adding extra " + count + " for " + snapshot.key);
                likedCounts[snapshot.key] += count;
              }
            }
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
        })
        .catch(error => {
          reject(error);
        })
      })
      .catch(error => {
        reject(error);
      });
    });
  }

}
