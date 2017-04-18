import { Component, ViewChild } from '@angular/core';
import { Nav, NavParams, Platform, MenuController, AlertController, ModalController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { Storage } from '@ionic/storage';

import firebase from 'firebase';

import { LoginPage } from '../pages/login/login';
import { LoadingPage } from '../pages/loading/loading';
import { DiscoverPage } from '../pages/discover/discover';
import { ProfilePage } from '../pages/profile/profile';
import { TopUsersPage } from '../pages/top-users/top-users';
import { PreferencesPage } from '../pages/preferences/preferences';
import { SettingsPage } from '../pages/settings/settings';
import { FeedbackPage } from '../pages/feedback/feedback';
import { PaymentPage } from '../pages/payment/payment';

import { AuthService } from '../providers/auth-service';
import { UserService } from '../providers/user-service';
import { ChatService } from '../providers/chat-service';
import { DiscoverService } from '../providers/discover-service';
import { PushService } from '../providers/push-service';

@Component({
  templateUrl: 'app.html'
})
export class Joon {
    @ViewChild(Nav) nav: Nav;
    rootPage: any = LoginPage;
    pages: Array<{title: string, component: any}>;
    
    constructor(private platform: Platform,
                private menuCtrl: MenuController,
                private alertCtrl: AlertController,
                private modalCtrl: ModalController,
                private authS: AuthService,
                private userS: UserService,
                private chatS: ChatService,
                private discoverS: DiscoverService,
                private pushS: PushService,
                private storage: Storage) {

        this.initializeApp();

        // Sidemenu navigation
        this.pages = [
          { title: 'Discover', component: DiscoverPage },
          { title: 'My Profile', component: ProfilePage },
          { title: 'Top Users', component: TopUsersPage },
          { title: 'Discover Preferences', component: PreferencesPage },
          { title: 'App Settings', component: SettingsPage },
          //{ title: 'Help & Support', component: HelpPage },
          { title: 'Feedback', component: FeedbackPage },
          // { title: 'Invite A Friend to Joon', component: InvitePage },
          { title: 'Joon Plus', component: PaymentPage }
        ];
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            Splashscreen.hide();
            // Initialize firebase sdk
            firebase.initializeApp({
                apiKey: "AIzaSyATmWDysiY_bRGBtxTv-l_haia3BXzdfCg",
                authDomain: "joon-702c0.firebaseapp.com",
                databaseURL: "https://joon-702c0.firebaseio.com",
                storageBucket: "joon-702c0.appspot.com",
                messagingSenderId: '516717911226'
            });
            // Check current user auth state
            this.storage.ready().then(() => {
                console.log("Local storage ready. Fetching stored user...");
                this.fetchCurrentUser();
            });
            // Check If Cordova/Mobile
            if (this.platform.is('cordova')) {
              // OneSignal init
              this.pushS.init();
            }
        });
    }
    
    closeMenu() {
        // console.log("Pressed fixed content area!");
        this.menuCtrl.close();
    }
    
    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }

    fetchCurrentUser() {
      // console.log('erasing storage for login debugging');
      // this.storage.clear().then(() => { // clear cache for login debugging
        let env = this;
        this.storage.get('user').then((storedUser) => {
          if (!storedUser) {
            console.log('No stored user found!')
          } else if (storedUser.accessToken) {
            let modal = env.modalCtrl.create(LoadingPage, {
                user: storedUser
            });
            modal.present();
            console.log('Stored user found: ', storedUser);
            let facebookCredential = firebase.auth.FacebookAuthProvider.credential(storedUser.accessToken);
            env.authS.authenticateWith(facebookCredential).then(success => {
              if (storedUser.firebaseId == firebase.auth().currentUser.uid) {
                // Current user signed into firebase
                console.log("Current user: " + storedUser);
                // this.modalS.message = "Retreiving latest user data...";
                env.userS.fetchUser(storedUser.id).then(user => {
                  // Current user updated
                  user.accessToken = storedUser.accessToken;
                  env.userS.user = user;
                  env.userS.updateCurrentUser(user);
                  env.chatS.observeChats();
                  env.nav.setRoot(DiscoverPage);
                  modal.dismiss();
                }).catch(error => {
                  console.log(error);
                  env.logoutApp();
                  modal.dismiss();
                  env.presentError(error);
                });
              } else {
                // No current user
                env.logoutApp();
                modal.dismiss();
                env.presentError("Stored user does not match authenticated user.");
              }
            }).catch(error => {
              console.log(error);
              env.logoutApp();
              modal.dismiss();
              env.presentError(error);
            });
          } else {
            console.log('No stored user found!');
          }
        });

      // }); // clear cache for login debug
    }

    presentError(message) {
        let alert = this.alertCtrl.create({
            title: 'Login Failed!',
            message: message,
            buttons: ['Dismiss']
            });
        alert.present();
    }
    
    logoutApp() {
        this.nav.setRoot(LoginPage);
        this.menuCtrl.close();
        this.chatS.stopObservingChats();
        this.userS.updateCurrentUser(null);
        this.authS.signOut();
    }

}