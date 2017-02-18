import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Facebook } from 'ionic-native';
import firebase from 'firebase';
import { Http } from '@angular/http';
import 'rxjs/Rx';

@Injectable()
export class AuthService {
    private isAuthorized: boolean;
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
    

    constructor(public platform: Platform) {
        this.isAuthorized = false;
        Facebook.browserInit(this.FB_APP_ID, "v2.8");
    }
    
    init() {
        const firebaseConfig = {
            apiKey: "AIzaSyATmWDysiY_bRGBtxTv-l_haia3BXzdfCg",
            authDomain: "joon-702c0.firebaseapp.com",
            databaseURL: "https://joon-702c0.firebaseio.com",
            storageBucket: "joon-702c0.appspot.com",
            messagingSenderId: '516717911226'
        };
        firebase.initializeApp(firebaseConfig);
    }
    
    beginAuth(): Promise<any> {
        console.log("Starting auth...");
        return new Promise((resolve, reject) => {
            // Check If Cordova/Mobile
            if (this.platform.is('cordova')) {
                this.authOnMobile().then(response => {
                    let uid = response.authResponse.userID;
                    this.setupUser().then((user) => {
                        console.log("DB returned user");
                        resolve(user);
                    }, (error) => {
                        console.log(error);
                        reject(error);
                    });
                }).catch(error => {
                    console.log(error);
                    reject(error);
                });
            } else {
                this.authOnCore().then(response => {
                    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                    // let token = response.credential.accessToken;
                    // The signed-in user info.
                    // let uid = response.user.providerData[0].uid;
                    console.log("FB returned user");
                    resolve(response.user.providerData[0]);
                }).catch(error => {
                    console.log(error);
                });
            }
        });
    }
    
    authOnMobile(): Promise<any> {
        console.log("Starting mobile auth...");
        return new Promise((resolve, reject) => {
            console.log("Facebook Auth started...");
            Facebook.login(this.permissions).then((response) => {
                console.log("Facebook Auth authenticated!");
                this.authFirebaseWith(response).then(() => { 
                    console.log("Mobile auth returned facebook auth response!");
                    this.isAuthorized = true;
                    resolve(response);
                }, (error) => {
                    console.log(error);
                    reject(error);
                });
            }, (error) => {
                console.log("Facebook Auth failed.");
                reject(error); 
            });
        });
    }
    
    authOnCore(): Promise<any> {
        console.log("Starting core auth...");
        return new Promise((resolve, reject) => {
            this.authFirebase().then(response => {
                console.log("Core auth returned facebook auth response!");
                resolve(response); 
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }

    authFirebaseWith(facebookAuthResponse): Promise<any> {
        var env = this;
        return new Promise((resolve, reject) => {
            //Authenticate with firebase
            if (facebookAuthResponse.authResponse) {
            // User is signed-in Facebook.
            var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
                unsubscribe();
                // Check if we are already signed-in Firebase with the correct user.
                if (!env.isUserEqual(facebookAuthResponse, firebaseUser)) {
                // Build Firebase credential with the Facebook auth token.
                console.log("Building Firebase credential with the Facebook auth token.");
                var credential = firebase.auth.FacebookAuthProvider.credential(facebookAuthResponse.authResponse.accessToken);
                // Sign in with the credential from the Facebook user.
                console.log("Signing in with the credential from the Facebook user.");
                firebase.auth().signInWithCredential(credential).then(() => { 
                    console.log("Sign in success"); 
                    resolve('connected'); 
                }, (error) => {
                    reject(error); 
                });
                } else {
                    // User is already signed-in Firebase with the correct user.
                }
            });
            } else {
                // User is signed-out of Facebook.
                firebase.auth().signOut().then(() => {
                    resolve('disconnected'); 
                }, (error) => {
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
    
    authFirebase(): Promise<any> {
        console.log("Starting core firebase auth...");
        var env = this;
        return new Promise((resolve, reject) => {
            var provider = new firebase.auth.FacebookAuthProvider();
            for (var i = 0; i < this.permissions.length; i++) {
                provider.addScope(this.permissions[i]);
            }
            console.log("Passed scope variables");
            firebase.auth().signInWithPopup(provider).then(response => {
                console.log("Core firebase auth returned response: " + response);
                resolve(response);
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }
    
    setupUser(): Promise<any> {
        console.log("Setting up native user...");
        return new Promise((resolve, reject) => {
            this.callFacebookAPI().then(data => {
                this.updateUserInDB(data).then(user => {
                    console.log("DB update returned data");
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
    
    callFacebookAPI() {
        console.log("Calling Native Facebook API...");
        return new Promise((resolve, reject) => {
            Facebook.api('/me?fields=id,name,gender,birthday,education,first_name,location,religion,work,friends', []).then( (data) => {
                console.log('requesting location data from facebook API');
                let apiStr = '/' + data.location.id + '?fields=location';
                Facebook.api(apiStr, []).then((locData) => {
                    console.log('location data retrieved from facebook API');
                    data.location = locData;
                    resolve(this.parseFacebookUserData(data));
                }).catch((error) => {
                    reject(error);
                });
            }, (error) => {
                reject(error);
            });
        });
    }
    
    parseFacebookUserData(data) {
        let rv = data;
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

        delete rv.friends.summary;
        
        console.log(rv);
        return rv;
    }
    
    updateUserInDB(user): Promise<any> {
        let uid = user.uid;
        console.log("Updating user in DB");
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/users/' + uid);
            ref.update(user).then(data => {
                console.log("DB saved data");
                return ref.once('value');
            }).then( snapshot => {
                console.log("DB returned snapshot");
                let val = snapshot.val();
                resolve(val);
            });
        });
    }
    
    signOut() {
        // Check If Cordova/Mobile
        if (this.platform.is('cordova')) {
            // Facebook logout
            Facebook.logout().then(response => {
                //user logged out so we will remove him from the NativeStorage
                // NativeStorage.remove('user');
            }).catch(error => {
                console.log(error);
            });
        }
        // Firebase logout
        firebase.auth().signOut();
        this.isAuthorized = false;
    }
}
