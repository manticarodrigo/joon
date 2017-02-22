import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Joon } from './app.component';

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
import { SwingModule } from 'angular2-swing';

import { Storage } from '@ionic/storage';
import { Facebook, NativeStorage } from 'ionic-native';
import { FacebookService } from 'ng2-facebook-sdk';
import { AuthService } from '../providers/auth-service';
import { UserService } from '../providers/user-service';
import { DiscoverService } from '../providers/discover-service';
import { StorageService } from '../providers/storage-service';

@NgModule({
  declarations: [
    Joon,
    LoginPage,
    DiscoverPage,
    ProfilePage,
    EditProfilePage,
    TopUsersPage,
    PreferencesPage,
    SettingsPage,
    HelpPage,
    FeedbackPage,
    InvitePage,
    FriendsPage,
    ChatsPage,
    ChatPage
  ],
  imports: [
    IonicModule.forRoot(Joon, {
        mode: 'md',
        menuType: 'reveal',
        backButtonText: 'Back',
        backButtonIcon: 'ios-arrow-back',
    }),
    SwingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Joon,
    LoginPage,
    DiscoverPage,
    ProfilePage,
    EditProfilePage,
    TopUsersPage,
    PreferencesPage,
    SettingsPage,
    HelpPage,
    FeedbackPage,
    InvitePage,
    FriendsPage,
    ChatsPage,
    ChatPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService,
    UserService,
    DiscoverService,
    StorageService,
    Facebook,
    FacebookService,
    NativeStorage,
    Storage
   ]
})
export class AppModule {}
