import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Joon } from './app.component';

import { LoginPage } from '../pages/login/login';
import { DiscoverPage } from '../pages/discover/discover';
import { ProfilePage } from '../pages/profile/profile';
import { TopUsersPage } from '../pages/top-users/top-users';
import { PreferencesPage } from '../pages/preferences/preferences';
import { SettingsPage } from '../pages/settings/settings';
import { HelpPage } from '../pages/help/help';
import { FeedbackPage } from '../pages/feedback/feedback';
import { InvitePage } from '../pages/invite/invite';
import { FriendsPage } from '../pages/friends/friends';
import { ChatsPage } from '../pages/chats/chats';

import { AngularFireModule } from 'angularfire2';
import { AuthService } from '../providers/auth-service';

export const firebaseConfig = {
  apiKey: "AIzaSyATmWDysiY_bRGBtxTv-l_haia3BXzdfCg",
  authDomain: "joon-702c0.firebaseapp.com",
  databaseURL: "https://joon-702c0.firebaseio.com",
  storageBucket: "joon-702c0.appspot.com",
  messagingSenderId: '516717911226'
};

@NgModule({
  declarations: [
    Joon,
    LoginPage,
    DiscoverPage,
    ProfilePage,
    TopUsersPage,
    PreferencesPage,
    SettingsPage,
    HelpPage,
    FeedbackPage,
    InvitePage,
    FriendsPage,
    ChatsPage
  ],
  imports: [
    IonicModule.forRoot(Joon,{
        menuType: 'push',
    }),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Joon,
    LoginPage,
    DiscoverPage,
    ProfilePage,
    TopUsersPage,
    PreferencesPage,
    SettingsPage,
    HelpPage,
    FeedbackPage,
    InvitePage,
    FriendsPage,
    ChatsPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, AuthService]
})
export class AppModule {}
