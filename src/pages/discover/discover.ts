import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, MenuController, ModalController } from 'ionic-angular';

import { DiscoverService } from '../../providers/discover-service';
import { UserService } from '../../providers/user-service';
import { ChatService } from '../../providers/chat-service';
import { ModalService } from '../../providers/modal-service';
import { LocationService } from '../../providers/location-service';
import { PaymentService } from '../../providers/payment-service';

import { ChatsPage } from '../chats/chats';
import { ChatPage } from '../chat/chat';
import { LoadingPage } from '../loading/loading';
import { MatchedPage } from '../matched/matched';
import { ProfilePage } from '../profile/profile';
import { PreferencesPage } from '../preferences/preferences';
import { PaymentPage } from '../payment/payment';

import {
  StackConfig,
  Stack,
  Card,
  ThrowEvent,
  DragEvent,
  SwingStackComponent,
  SwingCardComponent 
} from 'angular2-swing';

@Component({
  selector: 'page-discover',
  templateUrl: 'discover.html'
})
export class DiscoverPage {
  @ViewChild('swingContainer') swingStack: SwingStackComponent;
  @ViewChildren('cardsContainer') swingCards: QueryList<SwingCardComponent>;

  users: Array<any>;
  loadedUsers: Array<any>;
  noUsers: boolean = true;
  undoHistory: Array<any>;
  stackConfig: StackConfig;
  toastSeen: Array<boolean>;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private menu: MenuController,
              private discoverS: DiscoverService,
              private userS: UserService,
              private chatS: ChatService,
              private modalS: ModalService,
              private locationS: LocationService,
              private paymentS: PaymentService) {
    this.stackConfig = {
      throwOutConfidence: (offset, element) => {
        return Math.min(Math.abs(offset) / (element.offsetWidth/2), 1);
      },
      transform: (element, x, y, r) => {
        this.onItemMove(element, x, y, r);
      },
      throwOutDistance: (d) => {
        return 800;
      }
    };
    this.users = [];
    this.loadedUsers = [];
    this.undoHistory = [];
    this.toastSeen = [false, false, false];
  }

  ionViewDidLoad() {
    // Either subscribe in controller or set in HTML
    this.swingStack.throwin.subscribe((event: DragEvent) => {
      event.target.style.background = '#fff';
    });
  }

  ionViewWillLoad() {
    console.log("Entered discover page");
    this.fetchUsers();
  }

  openChats() {
    this.navCtrl.push(ChatsPage);
  }
  
  showPreferences() {
    this.navCtrl.setRoot(PreferencesPage);
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 500,
      position: 'top'
    });
    toast.present();
  }

  userTapped(user) {
    this.navCtrl.push(ProfilePage, {
        user: user
    });
  }

  fetchUsers() {
    console.log("Fetching discoverable users");
    let env = this;
    let user = this.userS.user;
    this.modalS.user = this.userS.user;
    // this.modalS.message = "Finding people nearby...";
    if (!this.modalS.isActive) {
      this.modalS.create(LoadingPage);
      this.modalS.present();
    }
    this.userS.fetchUserPreferences(this.userS.user)
    .then(preferences => {
      if (preferences.distance == 'local') {
        env.locationS.getLocation()
        .then(() => {
            env.locationS.fetchNearbyKeys()
            .then(keys => {
              if (keys.includes(this.userS.user.id)) {
                var i = keys.indexOf(this.userS.user.id);
                if (i > -1) {
                    keys.splice(i, 1);
                }
              }
              if (keys.length > 0) {
                env.userS.fetchUsers(keys)
                .then(users => {
                  env.discoverS.fetchLocalUsers(users)
                  .then(localUsers => {
                    var existingUsers = [];
                    for (var i in localUsers) {
                      var user = localUsers[i];
                      if (user) {
                        existingUsers.push(user);
                        env.noUsers = false;
                        var mutual = [];
                        for (var key in user.friends) {
                          if (env.userS.user.friends.includes(user.friends[key])) {
                            mutual.push(user.friends[key]);
                          }
                        }
                        if (mutual.length > 0) {
                          user['mutual'] = mutual.length;
                        }
                      }
                    }
                    env.users = existingUsers;
                    this.checkForEmptyStack();
                    env.modalS.dismiss();
                  })
                  .catch(error => {
                    console.log(error);
                    env.modalS.dismiss();
                  });
                })
                .catch(error => {
                  console.log(error);
                  env.modalS.dismiss();
                });
              } else {
                console.log("No nearby users found!");
                env.modalS.dismiss();
              }
            })
            .catch(error => {
              console.log(error);
              env.modalS.dismiss();
            });
          })
          .catch(error => {
            console.log(error);
            env.modalS.dismiss();
          });
      } else {
        env.discoverS.fetchGlobalUsers()
        .then(users => {
          console.log("fetch returned visible users");
          console.log(users);
          var existingUsers = [];
          for (var i in users) {
            var user = users[i];
            if (user) {
              existingUsers.push(user);
              env.noUsers = false;
              var mutual = [];
              for (var key in user.friends) {
                if (env.userS.user.friends.includes(user.friends[key])) {
                  mutual.push(user.friends[key]);
                }
              }
              if (mutual.length > 0) {
                user.mutual = mutual.length;
              }
            }
            
          }
          env.users = existingUsers;
          this.checkForEmptyStack();
          env.modalS.dismiss()
        })
        .catch(error => {
          console.log(error);
          env.modalS.dismiss();
        });
      }
    })
    .catch(error => {
      console.log(error);
      env.modalS.dismiss();
    });
  }

  checkForEmptyStack() {
    if (this.loadedUsers.length == 0 && this.users.length > 0) {
      console.log("Refilling users!");
      var nextUsers = [];
      for (var i = 0; i < 10; i++) {
        if (this.users[i]) {
          nextUsers.push(this.users[i]);
        }
      }
      this.users.splice(0, nextUsers.length, null);
      this.loadedUsers = nextUsers;
    }
  }

  swipeLeft() {
    let currentCard = this.loadedUsers.pop();
    this.undoHistory.push(currentCard);
    this.checkForEmptyStack();
    console.log("Swiping left on...");
    console.log(currentCard);
    console.log("Number of non-loaded users left...");
    console.log(this.users.length);
    if (this.users.length > 0 || this.loadedUsers.length > 0) {
      this.discoverS.saw(currentCard)
      .then(success => {
        if (!this.toastSeen[0]) {
          this.toastSeen[0] = true;
          this.presentToast('You did not like ' + currentCard.firstName);
        }
      })
      .catch(error => {
        console.log(error);
        this.presentToast('Error saving swipe');
        this.undo();
      });
    } else {
      this.noUsers = true;
    }
  }

  swipeRight() {
    let env = this;
    let currentCard = this.loadedUsers.pop();
    this.undoHistory.push(currentCard);
    this.checkForEmptyStack();
    console.log("Swiping right on...");
    console.log(currentCard);
    console.log("Number of non-loaded users left...");
    console.log(this.users.length);
    if (this.users.length > 0 || this.loadedUsers.length > 0) {
      env.discoverS.fetchDailyLikes()
      .then(num => {
        if (num < 12 || env.paymentS.restored) {
          env.discoverS.saw(currentCard)
          .then(success => {
            env.discoverS.liked(currentCard)
            .then(matched => {
              if (!env.toastSeen[1]) {
                env.toastSeen[1] = true;
                env.presentToast('You liked ' + currentCard.firstName);
              }
              if (matched) {
                env.presentMatchWith(currentCard);
              }
            })
            .catch(error => {
              console.log(error);
              env.presentToast('Error saving swipe');
              env.undo();
            });
          })
          .catch(error => {
            console.log(error);
            env.presentToast('Error saving swipe');
            env.undo();
          });
        } else {
          let modal = env.modalCtrl.create(PaymentPage, {
              user: currentCard,
              discovering: true
          });
          modal.present();
          env.undo();
        }
      })
      .catch(error => {
        console.log(error);
        env.presentToast('Error saving swipe');
        env.undo();
      });
    } else {
      env.noUsers = true;
    }
  }

  doubleLike() {
    let env = this;
    let currentCard = this.loadedUsers.pop();
    this.undoHistory.push(currentCard);
    this.checkForEmptyStack();
    console.log("Double liking...");
    console.log(currentCard);
    console.log("Number of non-loaded users left...");
    console.log(this.users.length);
    if (this.users.length > 0 || this.loadedUsers.length > 0) {
      this.discoverS.fetchDailyDoubleLikes()
      .then(num => {
        if (num < 2) {
          env.discoverS.saw(currentCard)
          .then(success => {
            env.discoverS.doubleLiked(currentCard)
            .then(matched => {
              if (!env.toastSeen[2]) {
                env.toastSeen[2] = true;
                env.presentToast('You double liked ' + currentCard.firstName);
              }
              if (matched) {
                env.presentMatchWith(currentCard);
              }
            })
            .catch(error => {
              console.log(error);
              env.presentToast('Error saving swipe');
              env.undo();
            });
          }).catch(error => {
            console.log(error);
            env.presentToast('Error saving swipe');
            env.undo();
          });
        } else {
          console.log(currentCard);
          let modal = env.modalCtrl.create(PaymentPage, {
              user: currentCard,
              discovering: true
          });
          modal.present();
          env.undo();
          /*
          let alert = this.alertCtrl.create({
            title: 'Out of double likes!',
            message: 'Please wait 24 hours before trying again.',
            buttons: ['Dismiss']
          });
          alert.present();*/
        }
      })
      .catch(error => {
        console.log(error);
        env.presentToast('Error saving swipe');
        env.undo();
      });
    } else {
      env.noUsers = true;
    }
  }

  presentMatchWith(user) {
    this.modalS.user = this.userS.user;
    this.modalS.otherUser = user;
    this.modalS.create(MatchedPage);
    this.modalS.modal.onDidDismiss(data => {
      if (data) {
        this.navCtrl.push(ChatPage, {
            user: data[0],
            chat: data[1]
        });
      }
    });
    this.modalS.present();
  }

  undo() {
    console.log("Undo pressed!");
    if (this.undoHistory.length > 0) {
      let undoCard = this.undoHistory.pop();
      this.loadedUsers.push(undoCard);
    }
  }

  // Called whenever we drag an element
  onItemMove(element, x, y, r) {
    var color = '';
    var abs = Math.abs(x);
    let min = Math.trunc(Math.min(16*16 - abs, 16*16));
    let hexCode = this.decimalToHex(min, 2);

    if (x < 0) {
      color = '#FF' + hexCode + hexCode;
    } else {
      color = '#' + hexCode + 'FF' + hexCode;
    }

    element.style.background = color;
    element.style['transform'] = `translate3d(0, 0, 0) translate(${x}px, ${y}px) rotate(${r}deg)`;
  }

  // http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
  decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
      hex = "0" + hex;
    }

    return hex;
  }
}
