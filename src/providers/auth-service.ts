import { Injectable } from '@angular/core';
import firebase from 'firebase';

import { UserService } from './user-service';
import { FbService } from'./fb-service';

@Injectable()
export class AuthService {

    constructor(private userS: UserService,
                private fbS: FbService) {
    }

    authenticateWith(credential): Promise<any> {
        return new Promise((resolve, reject) => {
            firebase.auth().signInWithCredential(credential).then(() => {
                // User re-authenticated.
                console.log("Current user authenticated!");
                resolve('success');
            }).catch(error => {
                // An error happened.
                console.log(error);
                reject(error);
            });
        });
    }

    beginAuth(): Promise<any> {
      console.log("Starting auth...");
      var env = this;
      return new Promise((resolve, reject) => {
        this.fbS.facebookLogin().then(response => {
          this.firebaseAuth(response).then(user => {
            resolve(user);
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

    firebaseAuth(response): Promise<any> {
      let env = this;
      return new Promise((resolve, reject) => {
        if (response.authResponse) {
          let uid = response.authResponse.userID;
          // User is signed-in Facebook.
          var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!env.isUserEqual(response, firebaseUser)) {
              let facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
              firebase.auth().signInWithCredential(facebookCredential).then((userData) => {
                console.log("Firebase returned user object: ");
                console.log(userData);

                let facebookUID = userData.providerData[0].uid;
                let firebaseUID = userData.uid;
                if (facebookUID != uid) {
                  console.log("Error: mismatch in facebook auth UID and firebase provider facebook UID");
                }

                env.setupUser(facebookUID, firebaseUID).then(user => {
                  if (user) {
                    user["accessToken"] = response.authResponse.accessToken;
                    env.userS.updateCurrentUser(user);
                    console.log("Set current user: ");
                    console.log(user);

                    // also ensure search exists before resolving
                    // ensureSearch must be run after updateCurrentUser
                    env.ensureSearch().then(() => {
                      resolve(user);
                    }).catch(error => {
                      reject(error);
                    })

                  } else {
                    reject('No user object returned');
                  }
                }).catch(error => {
                  console.log(error);
                  reject(error);
                });
              }).catch((error) => {
                console.log(error);
                reject(error);
              });
            } else {
              // User is already signed-in Firebase with the correct user.
              console.log("User is already signed-in Firebase with the correct user.")
              resolve(uid);
            }
          });
        } else {
          // User is signed-out of Facebook.
          firebase.auth().signOut().then(() => {
            reject('disconnected');
          }).catch(error => {
            reject(error);
          });
        }
      });
    }
    
    isUserEqual (facebookAuthResponse, firebaseUser) {
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
                if (providerData[i].providerId === firebase.auth.FacebookAuthProvider.PROVIDER_ID &&
            providerData[i].uid === facebookAuthResponse.userID) {
                    // We don't need to re-auth the Firebase connection.
                    return true;
                }
            }
        }
        return false;
    }


    hasSearch(): Promise<boolean> {
      let uid = this.userS.user.id;
      let ref = firebase.database().ref('/users/' + uid);
      return new Promise((resolve, reject) => {
        ref.once('value')
        .then(snapshot => {
          resolve(snapshot.hasChild('lff') && snapshot.hasChild('lfm'));
        }).catch(error => { reject(error); });
      });
    }

    createSearch(): firebase.Promise<any> {
      let user = this.userS.user;
      return firebase.database().ref('/users/' + user.id).update({
        distance: 'global',
        lff: (user.gender == 'male'),
        lfm: (user.gender == 'female')
      });
    }

    ensureSearch(): Promise<boolean> {
      console.log('ensuring presence of search');
      let uid = this.userS.user.id;
      return new Promise((resolve, reject) => {
        this.hasSearch()
        .then(hasSearch => {
          if (hasSearch) {
            console.log('user search already exists');
            resolve(true);
          } else {
            console.log('user search does not exist, creating')
            this.createSearch()
            .then(() => { 
              console.log('user search created')
              resolve(true); 
            }).catch(error => { reject(error); });
          }
        })
        .catch(error => {
          reject(error);
        });
      });
    }
    

    setupUser(facebookUID, firebaseUID): Promise<any> {
        console.log("Setting up current user...");
        return new Promise((resolve, reject) => {
          // Get Facebook API data for initial field population
          this.fbS.callFacebookAPI().then(data => {
            data["id"] = facebookUID;
            console.log(data);
            this.updateUserInDB(data).then(returnedUser => {
              console.log("DB update returned data");
              returnedUser["firebaseId"] = firebaseUID;
              if (!returnedUser.photoURL) {
                returnedUser["photoURL"] = "https://graph.facebook.com/" + facebookUID + "/picture?type=large";
              }
              resolve(returnedUser);
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

    updateUserInDB(user): Promise<any> {
        console.log("Updating user in DB");
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users/' + user.id);
            ref.update(user).then(data => {
                console.log("DB saved user data");
                return ref.once('value');
            }).then(snapshot => {
                console.log("DB returned user snapshot");
                let val = snapshot.val();
                resolve(val);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }
    
    signOut() {
      this.fbS.signOut();
    }
}