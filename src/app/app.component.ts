import { Component, ViewChild, ElementRef } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { LoginPage } from '../pages/login/login';
import { DiscoverPage } from '../pages/discover/discover';
import { ProfilePage } from '../pages/profile/profile';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { TopUsersPage } from '../pages/top-users/top-users';
import { PreferencesPage } from '../pages/preferences/preferences';
import { SettingsPage } from '../pages/settings/settings';
import { HelpPage } from '../pages/help/help';
import { FeedbackPage } from '../pages/feedback/feedback';
import { InvitePage } from '../pages/invite/invite';
import { FriendsPage } from '../pages/friends/friends';
import { ChatsPage } from '../pages/chats/chats';
import { ChatPage } from '../pages/chat/chat';

import { AuthService } from '../providers/auth-service';
import { UserService } from '../providers/user-service';

import firebase from 'firebase';
import { FacebookService, FacebookInitParams } from 'ng2-facebook-sdk';

@Component({
  templateUrl: 'app.html'
})
export class Joon {
    @ViewChild(Nav) nav: Nav;
    isMenuOpen: boolean = false;
    rootPage: any = LoginPage;
    pages: Array<{title: string, component: any}>;
    
    constructor(public platform: Platform,
                private menu: MenuController,
                private el: ElementRef,
                private authS: AuthService,
                private userS: UserService,
                private fb: FacebookService,
                private storage: Storage) {

        this.initializeApp();
        firebase.initializeApp({
            apiKey: "AIzaSyATmWDysiY_bRGBtxTv-l_haia3BXzdfCg",
            authDomain: "joon-702c0.firebaseapp.com",
            databaseURL: "https://joon-702c0.firebaseio.com",
            storageBucket: "joon-702c0.appspot.com",
            messagingSenderId: '516717911226'
        });
        // Remove web facebook sdk for production mobile apps
        fb.init({
            appId: '713879188793156',
            version: 'v2.8'
        });
        // Sidemenu navigation
        this.pages = [
          { title: 'Discover', component: DiscoverPage },
          { title: 'My Profile', component: ProfilePage },
          { title: 'Top Users', component: TopUsersPage },
          { title: 'Discovery Preferences', component: PreferencesPage },
          { title: 'App Settings', component: SettingsPage },
          { title: 'Help & Support', component: HelpPage },
          { title: 'Feedback', component: FeedbackPage },
          { title: 'Invite A Friend to Joon', component: InvitePage }
        ];
        // Check current user auth state
        storage.ready().then(() => {
            console.log("Local storage ready. Fetching stored user...");
            this.fetchCurrentUser();
        });
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            Splashscreen.hide();
            // Disable sidemenu swipe gesture
            this.menu.swipeEnable(false, 'sidemenu');
        });
    }
    
    menuToggled() {
        this.isMenuOpen = !(this.isMenuOpen);
    }
    
    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }

    fetchCurrentUser() {
      var storedUser: any;

      // this.storage.clear().then(() => { // clear cache for login debugging

        this.storage.get('user').then((storedUser) => {
          if (!storedUser) {
            console.log('No stored user found!')
          } else if (storedUser.accessToken) {
            console.log('Stored user found: ', storedUser);
            let facebookCredential = firebase.auth.FacebookAuthProvider.credential(storedUser.accessToken);
            this.authS.authenticateWith(facebookCredential).then(success => {
              if (storedUser.firebaseId == firebase.auth().currentUser.uid) {
                // User is logged in
                console.log("Current user: " + storedUser);
                this.userS.user = storedUser;
                this.nav.setRoot(DiscoverPage);
              } else {
                // No current user
                console.log("Stored user does not match authenticated firebase user.");
                this.logoutApp();
              }
            }).catch(error => {
              console.log(error);
            });
          } else {
            console.log('No stored user found!');
          }
        });

      // }); // clear cache for login debug
    }
    
    logoutApp() {
        this.userS.updateCurrentUser(null);
        this.authS.signOut();
        this.nav.setRoot(LoginPage);
        this.menu.close();
    }

}