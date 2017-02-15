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
              private authS: AuthService,
              private userS: UserService) {

    Facebook.browserInit(this.FB_APP_ID, "v2.8");

  }

  login() {
    this.authS.authFacebook().then( (facebookAuthRes) => { 
      let uid = facebookAuthRes.authResponse.userID;

      // push any waiting-for-connection segue visual here

      this.authS.authFirebase(facebookAuthRes).then(
        () => { 

          // push any waiting-for-data segue visual here
          console.log("login 66");

          this.userS.setupUser(uid).then(
            (user) => { 
            this.userS.user = user;
            this.userS.currentUserSnapshot = user;
            this.userS.currentUserUID = user.uid;
            this.onSignInSuccess(); },
          (error) => { alert(error); }
        ) },
        (error) => { alert(error); }
      ) },
      (error) => { alert(error); }
    );
  }

  private onSignInSuccess(): void {
    console.log("onSignInSuccess");
    
    // Pop to landing page!
    //   this does not work on Android;
    //   either because the stack is somehow empty
    //   or because LoginPage is also the previous page in the stack
    // this.navCtrl.pop();

    this.navCtrl.setRoot(DiscoverPage);
  }

}