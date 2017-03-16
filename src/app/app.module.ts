import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Joon } from './app.component';

import { LoginPage } from '../pages/login/login';
import { LoadingPage } from '../pages/loading/loading';
import { SpinnerPage } from '../pages/spinner/spinner';
import { DiscoverPage } from '../pages/discover/discover';
import { MatchedPage } from '../pages/matched/matched';
import { ProfilePage } from '../pages/profile/profile';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { TopUsersPage } from '../pages/top-users/top-users';
import { PreferencesPage } from '../pages/preferences/preferences';
import { PopoverPage } from '../pages/popover/popover';
import { SettingsPage } from '../pages/settings/settings';
import { HelpPage } from '../pages/help/help';
import { FeedbackPage } from '../pages/feedback/feedback';
import { InvitePage } from '../pages/invite/invite';
import { FriendsPage } from '../pages/friends/friends';
import { ChatsPage } from '../pages/chats/chats';
import { ChatPage } from '../pages/chat/chat';

import { SwingModule } from 'angular2-swing';

import { Storage } from '@ionic/storage';
import { Facebook, NativeStorage, OneSignal } from 'ionic-native';
import { FacebookService } from 'ng2-facebook-sdk';
import { AuthService } from '../providers/auth-service';
import { UserService } from '../providers/user-service';
import { ModalService } from '../providers/modal-service';
import { PopoverService } from '../providers/popover-service';
import { DiscoverService } from '../providers/discover-service';
import { ChatService } from '../providers/chat-service';
import { StorageService } from '../providers/storage-service';
import { PushService } from '../providers/push-service';
import { LocationService } from '../providers/location-service';
import { SettingsService } from '../providers/settings-service';

@NgModule({
  declarations: [
    Joon,
    LoginPage,
    LoadingPage,
    SpinnerPage,
    DiscoverPage,
    MatchedPage,
    ProfilePage,
    EditProfilePage,
    TopUsersPage,
    PreferencesPage,
    PopoverPage,
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
        activator: 'none' 
    }),
    SwingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Joon,
    LoginPage,
    LoadingPage,
    SpinnerPage,
    DiscoverPage,
    MatchedPage,
    ProfilePage,
    EditProfilePage,
    TopUsersPage,
    PreferencesPage,
    PopoverPage,
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
    ModalService,
    PopoverService,
    DiscoverService,
    ChatService,
    StorageService,
    PushService,
    LocationService,
    SettingsService,
    Facebook,
    FacebookService,
    NativeStorage,
    OneSignal,
    Storage
   ]
})
export class AppModule {}
