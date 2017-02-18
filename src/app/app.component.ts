import { Component, ViewChild, ElementRef } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar, Splashscreen, NativeStorage } from 'ionic-native';

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

@Component({
  templateUrl: 'app.html'
})
export class Joon {
    @ViewChild(Nav) nav: Nav;
    
    isMenuOpen: boolean = false;

    userFoundCached: boolean = false;

    rootPage: any = DiscoverPage;

    pages: Array<{title: string, component: any}>;
    
    constructor(public platform: Platform, private menu: MenuController, private el: ElementRef, private authS: AuthService, private user: UserService) {
        this.authS.init();
        this.initializeApp();
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

    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            Splashscreen.hide();
        });
    }
    
    ionViewDidLoad() {
        // Disable sidemenu swipe gesture
        this.menu.swipeEnable(false, 'sidemenu');
        // Check auth state
        if (!this.userFoundCached) {
          this.nav.push(LoginPage);
        }
    }
    
    
    menuToggled() {
        this.isMenuOpen = !(this.isMenuOpen);
        console.log(this.isMenuOpen);
    }
    
    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }
    
    logoutApp() {
        this.authS.signOut();
        this.nav.popToRoot();
        this.nav.push(LoginPage);
        this.menu.close();
    }
    
    logoutApp() {
        this.auth.signOut();
        this.nav.push(LoginPage);
        this.menu.close();
    }
  
}
