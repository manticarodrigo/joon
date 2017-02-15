import { Injectable } from '@angular/core';

import { AngularFire, AuthProviders, AngularFireAuth, FirebaseAuthState, AuthMethods } from 'angularfire2';
import { Facebook } from 'ionic-native';
import firebase from 'firebase';

@Injectable()
export class AuthService {
  private isAuthorized: boolean;

  constructor() {
    this.isAuthorized = false;
  }

  get authenticated(): boolean {
    return this.isAuthorized;
  }

  authFacebook(): Promise<any> {
    return new Promise((resolve, reject) => {
      let permissions = ["public_profile"];

      Facebook.login(permissions).then(
        (response) => { this.isAuthorized = true; resolve(response); },
        (error) => { reject(error); }
      );
    });
  }

  authFirebase(facebookAuthResponse): Promise<any> {
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
            console.log("auth 58");
            var credential = firebase.auth.FacebookAuthProvider.credential(
                                                                           facebookAuthResponse.authResponse.accessToken
                                                                           );
            // Sign in with the credential from the Facebook user.
            console.log("auth 66");
            firebase.auth().signInWithCredential(credential)
            .then(
                  () => { console.log("auth 69"); resolve('connected'); },
                  (error) => { reject(error); }
                  );
          } else {
            // User is already signed-in Firebase with the correct user.
          }
        });
      } else {
        // User is signed-out of Facebook.
        firebase.auth().signOut()
        .then(
              () => { resolve('disconnected'); },
              (error) => { reject(error); }
              );
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
}
