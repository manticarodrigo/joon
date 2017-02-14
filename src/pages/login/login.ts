import { Component } from '@angular/core';

import { AuthService } from '../../providers/auth-service';
import { UserService } from '../../providers/user-service';
import { DiscoverPage } from '../discover/discover';

import { NavController } from 'ionic-angular';
import { Facebook, NativeStorage } from 'ionic-native';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  FB_APP_ID: number = 713879188793156;

  constructor(public navCtrl: NavController,
              private auth: AuthService,
              private userService: UserService) {
    Facebook.browserInit(this.FB_APP_ID, "v2.8");
  }

  doFbLogin() {
    let permissions = new Array();
    let nav = this.navCtrl;
    //the permissions your facebook app needs from the user
    permissions = ["public_profile"];

    Facebook.login(permissions)
    .then(function(response) {
      let userId = response.authResponse.userID;
      let params = new Array();

      //Authenticate with firebase
      if (response.authResponse) {
        // User is signed-in Facebook.
        var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
          unsubscribe();
          // Check if we are already signed-in Firebase with the correct user.
          if (!this.isUserEqual(response.authResponse, firebaseUser)) {
            // Build Firebase credential with the Facebook auth token.
            var credential = firebase.auth.FacebookAuthProvider.credential(
              response.authResponse.accessToken);
            // Sign in with the credential from the Facebook user.
            firebase.auth().signInWithCredential(credential).catch(function(error) {
              alert(JSON.stringify(error));
            });
          } else {
            // User is already signed-in Firebase with the correct user.
          }
        });
      } else {
        // User is signed-out of Facebook.
        firebase.auth().signOut();
      }

      //Make facebook API call
      //Getting name and gender properties
      Facebook.api("/me?fields=name,gender", params)
      .then(function(user) {
        user.picture = "https://graph.facebook.com/" + userId + "/picture?type=large";
        //now we have the users info, let's save it in the NativeStorage
        NativeStorage.setItem('user',
        {
          name: user.name,
          gender: user.gender,
          picture: user.picture
        })
        .then(function(){
          alert("PASS! fetched and set user in native storage");
          alert("name: " + user.name + " gender: " + user.gender);

          this.onSignInSuccess(userId, user);
        }, function (error) {
          alert("error in setting native storage");
          alert(error);
        })
      }, function(error) {
        alert("error in facebook api");
        alert(error);
      });
    }, function(error) {
      alert("error in facbookook login")
      alert(error);
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

// signInWithFacebook(): void {
  //   this.auth.signInWithFacebook()
  //   .then(() => this.onSignInSuccess());
  // }

  private onSignInSuccess(uid, val): void {
    // this.userService.addUserByUID(uid, val);
    // this.userService.setCurrentUserUID(uid);
    // Pop to landing page!
    this.navCtrl.pop();
  }

}