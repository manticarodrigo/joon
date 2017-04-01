import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Joon } from './app.component';

import { LoginPage } from '../pages/login/login';
import { LegalPage } from '../pages/legal/legal';
import { LoadingPage } from '../pages/loading/loading';
import { DiscoverPage } from '../pages/discover/discover';
import { MatchedPage } from '../pages/matched/matched';
import { ProfilePage } from '../pages/profile/profile';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { PhotoSelectPage} from '../pages/photo-select/photo-select';
import { TopUsersPage } from '../pages/top-users/top-users';
import { PreferencesPage } from '../pages/preferences/preferences';
import { PopoverPage } from '../pages/popover/popover';
import { SettingsPage } from '../pages/settings/settings';
import { FeedbackPage } from '../pages/feedback/feedback';
import { InvitePage } from '../pages/invite/invite';
import { ChatsPage } from '../pages/chats/chats';
import { ChatPage } from '../pages/chat/chat';
import { PaymentPage } from '../pages/payment/payment';

import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { SwingModule } from 'angular2-swing';

import { Facebook, NativeStorage, OneSignal } from 'ionic-native';
import { FacebookService } from 'ng2-facebook-sdk';
import { AuthService } from '../providers/auth-service';
import { FbService } from'../providers/fb-service';
import { UserService } from '../providers/user-service';
import { ModalService } from '../providers/modal-service';
import { PopoverService } from '../providers/popover-service';
import { DiscoverService } from '../providers/discover-service';
import { ChatService } from '../providers/chat-service';
import { StorageService } from '../providers/storage-service';
import { PushService } from '../providers/push-service';
import { LocationService } from '../providers/location-service';
import { SettingsService } from '../providers/settings-service';
import { HttpService } from '../providers/http-service';
import { PaymentService } from '../providers/payment-service';

@NgModule({
  declarations: [
    Joon,
    LoginPage,
    LegalPage,
    LoadingPage,
    DiscoverPage,
    MatchedPage,
    ProfilePage,
    EditProfilePage,
    PhotoSelectPage,
    TopUsersPage,
    PreferencesPage,
    PopoverPage,
    SettingsPage,
    FeedbackPage,
    InvitePage,
    ChatsPage,
    ChatPage,
    PaymentPage,
  ],
  imports: [
    IonicModule.forRoot(Joon, {
        mode: 'md',
        menuType: 'reveal',
        backButtonText: 'Back',
        backButtonIcon: 'ios-arrow-back',
        activator: 'none' 
    }),
    IonicStorageModule.forRoot(),
    HttpModule,
    SwingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    Joon,
    LoginPage,
    LegalPage,
    LoadingPage,
    DiscoverPage,
    MatchedPage,
    ProfilePage,
    EditProfilePage,
    PhotoSelectPage,
    TopUsersPage,
    PreferencesPage,
    PopoverPage,
    SettingsPage,
    FeedbackPage,
    InvitePage,
    ChatsPage,
    ChatPage,
    PaymentPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService,
    FbService,
    UserService,
    ModalService,
    PopoverService,
    DiscoverService,
    ChatService,
    StorageService,
    PushService,
    LocationService,
    SettingsService,
    HttpService,
    PaymentService,
    Facebook,
    FacebookService,
    NativeStorage,
    OneSignal
   ]
})
export class AppModule {}
