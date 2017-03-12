import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Facebook } from 'ionic-native';
import { FacebookService, FacebookLoginResponse } from 'ng2-facebook-sdk';
import firebase from 'firebase';

import { UserService } from './user-service';

@Injectable()
export class AuthService {
    private FB_APP_ID: number = 713879188793156;
    private permissions: Array<string> = [
                'user_friends',
                'user_birthday',
                'user_about_me',
                'user_hometown',
                'user_location',
                'user_religion_politics',
                'user_education_history',
                'user_work_history'
            ];
    

    constructor(public platform: Platform,
                private userS: UserService,
                private fb: FacebookService) {
        Facebook.browserInit(this.FB_APP_ID, "v2.8");
    }

    beginAuth(): Promise<any> {
      console.log("Starting auth...");
      var env = this;
      return new Promise((resolve, reject) => {
        this.facebookLogin().then(response => {
          return this.firebaseAuth(response);
        }).then(() => {
          resolve(true);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
      });
    }

    facebookLogin(): Promise<any> {
        return new Promise((resolve, reject) => {
            // Check If Cordova/Mobile
            if (this.platform.is('cordova')) {
                console.log("Starting Mobile Facebook login...");
                Facebook.login(this.permissions).then(response => {
                    console.log("Mobile Facebook login returned response.");
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                });
            } else {
                console.log("Starting Core Facebook login...");
                this.fb.login(this.permissions).then(response => {
                    console.log("Core Facebook login returned response.");
                    resolve(response);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                });
            }
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
          this.callFacebookAPI().then(data => {
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
    
    callFacebookAPI() {
        return new Promise((resolve, reject) => {
            // Check If Cordova/Mobile
            if (this.platform.is('cordova')) {
                console.log("Calling mobile Facebook API...");
                Facebook.api('/me?fields=id,name,gender,birthday,education,first_name,location,religion,work,friends', []).then( (data) => {
                    console.log('requesting location data from facebook API');
                    let apiStr = '/' + data.location.id + '?fields=location';
                    Facebook.api(apiStr, []).then((locData) => {
                        console.log('location data retrieved from facebook API');
                        data.location = locData;
                        console.log('Facebook API returned:');
                        console.log(data);
                        resolve(this.parseFacebookUserData(data));
                    }).catch((error) => {
                        reject(error);
                    });
                }, (error) => {
                    reject(error);
                });
            } else {
                console.log("Calling core Facebook API...");
                this.fb.api('/me?fields=id,name,gender,birthday,education,first_name,location{location},religion,work,friends').then((data) => {
                    console.log('Facebook API returned:');
                    console.log(data);
                    resolve(this.parseFacebookUserData(data));
                }, (error) => {
                    reject(error);
                });
            }
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
    
    parseFacebookUserData(data) {
        let rv = data;
        console.log(rv);
        if (rv.first_name) {
            console.log("rv has first name");
            rv.firstName = rv.first_name;
            delete rv.first_name;
            console.log(rv.firstName);
        }
        if (rv.location) {
            console.log("rv has location");
            if (rv.location.location.city && rv.location.location.country) {
                rv.city = rv.location.location.city;
                rv.country = rv.location.location.country;
                console.log(rv.city);
                console.log(rv.country);
            }
            delete rv.location
        }
        if (rv.education) {
            console.log("rv has school");
            let nSchools = rv.education.length;
            if (nSchools >= 1) {
              rv.school = rv.education[nSchools - 1].school.name;
            }
            if (nSchools >= 2) {
              rv.school2 = rv.education[nSchools - 2].school.name;
            }
            delete rv.education;
            console.log(rv.school);
            console.log(rv.school2);
        }
        if (rv.birthday) {
            console.log("rv has birthday");
            let splitBDay = rv.birthday.split('/');
            var year = parseInt(splitBDay[2]);
            var month = parseInt(splitBDay[0]);
            var day = parseInt(splitBDay[1]);

            let today = new Date();
            let age = today.getFullYear() - year;
            if ( today.getMonth() < (month - 1) ) {
              age--;
            } else if (((month - 1) == today.getMonth()) && (today.getDate() < day)) {
              age--;
            }
            rv.age = age;
            console.log(rv.age);
            rv.birthday = year;
            if (month < 10) {
              rv.birthday += '-0' + month + '-';
            } else {
              rv.birthday += '-' + month + '-';
            }
            if (day < 10) {
              rv.birthday += '0' + day;
            } else {
              rv.birthday += day;
            }
            console.log(rv.birthday);
        }
        if (rv.work) {
            console.log("rv has job");
            let nJobs = rv.work.length;
            if (nJobs >= 1) {
              rv.job = rv.work[0].position.name;
              rv.company = rv.work[0].employer.name;
            }
            delete rv.work;
            console.log(rv.job);
        }

        if (rv.friends) {
            let idArray = [];
            for (var i=0; i < rv.friends.data.length; i++) {
                idArray.push(rv.friends.data[i]["id"]);
            }
            rv.friends = idArray;
            console.log(rv.friends);
        }
        
        console.log(rv);
        return rv;
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
    
    signOut() {
        // Check If Cordova/Mobile
        if (this.platform.is('cordova')) {
            // Mobile Facebook logout
            Facebook.logout();
        } else {
            // Core Facebook logout
            this.fb.logout();
        }
        // Firebase logout
        firebase.auth().signOut();
    }
}