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

  isDiscoverableTo(user1, user2, seenUIDs, pref1) {
    if (!user2.id) {
        console.log("Undefined error");
        return false;
    } else if (user1.id == user2.id) {
        console.log("Same id error");
        return false;
    } else if (seenUIDs && user2.id in seenUIDs) {
        console.log("Already saw error");
        return false;
    /*if (user1.gender == 'male' && !pref2.lfm)
        return false;
    if (user1.gender == 'female' && !pref2.lff)
        return false;*/
    } else if (user2.gender == 'male' && !pref1.lfm) {
        console.log("Not looking for males");
        return false;
    } else if (user2.gender == 'female' && !pref1.lff) {
        console.log("Not looking for females");
        return false;
    } else if (pref1.distance == 'national' && user1.country != user2.country) {
        console.log("Different country error");
        return false;
    }
    return true;
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

  fetchDiscoverableUsers(prefs): Promise<any> {
    console.log("Fetching discoverable users...");
    let currentUser = this.userS.user;
    let env = this;
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('user_discoverables/' + currentUser.id);
      ref.once('value')
      .then(snapshot => {
        if (snapshot.exists() && snapshot.val()) {
          let keys = Object.keys(snapshot.val());
          console.log(keys);
          env.userS.fetchUsers(keys)
          .then(users => {
            console.log("Fetch returned visible users:");
            console.log(users);
            resolve(users);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
        } else {
          console.log('No discoverables table.')
          env.generateDiscoverables(prefs)
          .then(users => {
            resolve(users);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
        }
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  generateDiscoverables(prefs): Promise<any> {
    let env = this;
    let currentUser = this.userS.user;
    return new Promise((resolve, reject) => {
      Promise.all([
          env.userS.fetchAllUsers(),
          env.fetchSeenUIDs()
      ])
      .then(snapshots => {
          console.log("Sorting discoverable users for " + currentUser.name);
          const allUsers = snapshots[0];
          const seenUIDS = snapshots[1];
          let visibleUsers = [];
          let visibleIds = {};
          // this method for parsing out seenUIDs is not totally optimal
          // - better to remove keys when both are dictionaries
          var userCount = 0;
          allUsers.forEach(user => {
              if (user) {
                  console.log(user);
                  if (env.isDiscoverableTo(currentUser, user, seenUIDS, prefs)) {
                      console.log("User is discoverable:", user);
                      visibleUsers.push(user);
                      visibleIds[user.id] = new Date().getTime();
                  }
                  userCount++;
                  if (userCount == allUsers.length) {
                      firebase.database().ref('/user_discoverables/' + currentUser.id)
                      .set(visibleIds)
                      console.log("Found visible users:");
                      console.log(visibleUsers);
                      resolve(visibleUsers);
                  }
              } else {
                  userCount++;
                  if (userCount == allUsers.length) {
                      firebase.database().ref('/user_discoverables/' + currentUser.id)
                      .set(visibleIds)
                      console.log("Found visible users:");
                      console.log(visibleUsers);
                      resolve(visibleUsers);
                  }
              }
          });
      })
      .catch(error => {
          console.log(error);
          reject(error);
      });
    });
  }

  fetchLocalUsers(nearbyKeys, prefs): Promise<any> {
    let currentUser = this.userS.user;
    let env = this;
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('user_discoverables/' + currentUser.id).limitToFirst(15);
      ref.once('value')
      .then(snapshot => {
        if (snapshot.exists() && snapshot.val()) {
          let discoverableKeys = Object.keys(snapshot.val());
          var matches = [];
          for (var key in nearbyKeys) {
            if (discoverableKeys.find(nearbyKeys[key])) {
              matches.push(nearbyKeys[key]);
            }
          }
          env.userS.fetchUsers(matches)
          .then(users => {
            resolve(users);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
        } else {
          env.userS.fetchUsers(nearbyKeys)
          .then(users => {
            env.fetchSeenUIDs()
            .then(seenUIDs => {
              var visibleUsers = [];
              var userCount = 0;
              users.forEach(user => {
                if (user) {
                  if (env.isDiscoverableTo(currentUser, user, seenUIDs, prefs)) {
                      console.log("User is discoverable:", user);
                      visibleUsers.push(user);
                  }
                  userCount++;
                  if (userCount == users.length) {
                      resolve(visibleUsers);
                  }
                } else {
                  userCount++;
                  if (userCount == users.length) {
                      resolve(visibleUsers);
                  }
                }
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
        }
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  saw(user): Promise<any> {
    console.log("Seeing user...");
    return new Promise((resolve, reject) => {
      let fanout = {};
      fanout['/user_saw/' + this.userS.user.id + '/' + user.id] = new Date().getTime();
      fanout['/user_discoverables/' + this.userS.user.id + '/' + user.id] = null;
      let ref = firebase.database().ref().update(fanout)
      .then( data => {
        console.log("User saw saved to DB!");
        resolve(data);
      }).catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  updateRankFor(uid, num) {
    const rankRef = firebase.database().ref('/user_rank/' + uid);
    rankRef.transaction(rank => {
      return (rank || 0) + num;
    });
  }

  liked(user): Promise<boolean> {
    console.log("Liking user...");
    let env = this;
    return new Promise((resolve, reject) => {
      let fanout = {};
      fanout['/user_saw/' + this.userS.user.id + '/' + user.id] = new Date().getTime();
      fanout['/user_liked/' + this.userS.user.id + '/' + user.id] = new Date().getTime();
      fanout['/user_discoverables/' + this.userS.user.id + '/' + user.id] = null;
      let ref = firebase.database().ref().update(fanout)
      .then(data => {
        env.updateRankFor(user.id, 1);
        console.log("User liked saved to DB!");
        env.checkForMatchWith(user)
        .then(matched => {
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
    let env = this;
    return new Promise((resolve, reject) => {
      let fanout = {};
      fanout['/user_saw/' + this.userS.user.id + '/' + user.id] = new Date().getTime();
      fanout['/user_liked/' + this.userS.user.id + '/' + user.id] = new Date().getTime();
      fanout['/user_double_liked/' + this.userS.user.id + '/' + user.id] = new Date().getTime();
      fanout['/user_discoverables/' + this.userS.user.id + '/' + user.id] = null;
      let ref = firebase.database().ref().update(fanout)
      .then(data => {
          console.log("User liked saved to DB!");
          env.updateRankFor(user.id, 2);
          env.checkForMatchWith(user)
          .then(matched => {
            if (user.pushId) {
              this.settingsS.fetchUserSettings(user).then(settings => {
                if (settings.doubleLikes) {
                  this.pushS.push("I double liked you!", user, 'doubleLike');
                }
              }).catch(error => {
                console.log(error);
                reject(error);
              });
            }
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
                  this.pushS.push("You matched with me!", user, 'match');
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

  resetDiscoverables(): Promise<any> {
    console.log("Resetting discoverable data...");
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_discoverables/' + this.userS.user.id);
      ref.set({})
      .then(data => {
        console.log("Discoverable data reset in DB!");
        resolve(null);
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
      var fanout = {}
      fanout['/user_saw/' + this.userS.user.id] = null;
      fanout['/user_discoverables/' + this.userS.user.id] = null;
      let ref = firebase.database().ref();
      ref.update(fanout)
      .then(snapshot => {
        console.log("Discoverable and seen data deleted from DB!");
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

  getRankedUsersMap(): Promise<any> {
    console.log("Fetching top users...");
    return new Promise((resolve, reject) => {
      let ref = firebase.database().ref('/user_rank/')
      ref.once('value')
      .then(snapshot => {
        let rankings = snapshot.val()
        console.log("Found user rankings: ");
        console.log(rankings);
        resolve(rankings);
      })
      .catch(error => {
        reject(error);
      });
    });
  }

}
