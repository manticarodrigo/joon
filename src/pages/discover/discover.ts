import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, MenuController, ModalController, LoadingController } from 'ionic-angular';

import { DiscoverService } from '../../providers/discover-service';
import { UserService } from '../../providers/user-service';
import { ChatService } from '../../providers/chat-service';
import { LocationService } from '../../providers/location-service';
import { PaymentService } from '../../providers/payment-service';
import { PushService } from '../../providers/push-service';

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
  Direction,
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

  prefs: any;
  users: Array<any>;
  loadedUsers: Array<any>;
  undoHistory: Array<any>;
  seenMap: any;
  stackConfig: StackConfig;
  // These are used to identify the topmost card in the DOM
  // throwingRightId = '';
  // throwingLeftId = '';
  toastSeen: Array<boolean>;
  dailyLikes = 0;
  dailyDoubleLikes = 0;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private loadingCtrl: LoadingController,
              private menu: MenuController,
              private discoverS: DiscoverService,
              private userS: UserService,
              private chatS: ChatService,
              private locationS: LocationService,
              private paymentS: PaymentService,
              private pushS: PushService) {
    this.stackConfig = {
      allowedDirections: [
        Direction.LEFT,
        Direction.RIGHT
      ],
      throwOutConfidence: (offsetX: number, offsetY: number, targetElement: HTMLElement) => {
        let xConf = Math.abs(offsetX) / (targetElement.offsetWidth / 1.7);
        let yConf = Math.abs(offsetY) / (targetElement.offsetHeight / 2);
        return Math.min(Math.max(xConf, yConf), 1);
      },
      minThrowOutDistance: 900    // default value is 400
    };
    this.users = [];
    this.loadedUsers = [];
    this.undoHistory = [];
    this.seenMap = {};
    this.toastSeen = [false, false, false];
  }

  ionViewDidLoad() {
    // Either subscribe in controller or set in HTML
    this.swingStack.throwin.subscribe((event: DragEvent) => {
      event.target.style.background = '#fff';
    });
  }

  ionViewWillEnter() {
    Promise.all([this.discoverS.fetchDailyLikes(), this.discoverS.fetchDailyDoubleLikes()])
    .then(data => {
      this.dailyLikes = data[0];
      this.dailyDoubleLikes = data[1];
    })
    .catch(error => {
      console.log(error);
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
    console.log("Fetching discoverable users...");
    let env = this;
    let user = this.userS.user;
    let notificationUser: any;
    let modal = env.modalCtrl.create(LoadingPage, {
        user: user
    });
    modal.present();
    if (this.pushS.notificationUID) {
      this.userS.fetchUser(this.pushS.notificationUID)
      .then(user => {
        notificationUser = user;
      })
      .catch(error => {
        console.log(error);
      });
    }
    this.userS.fetchUserPreferences(this.userS.user)
    .then(prefs => {
      env.prefs = prefs;
      if (prefs.distance == 'local') {
        env.locationS.getLocation()
        .then(location => {
            env.locationS.fetchNearbyKeys()
            .then(keys => {
              if (keys.includes(env.userS.user.id)) {
                var i = keys.indexOf(env.userS.user.id);
                if (i > -1) {
                    keys.splice(i, 1);
                }
              }
              if (keys.length > 0) {
                env.discoverS.fetchLocalUsers(keys, prefs)
                .then(localUsers => {
                  env.users = env.finishProcessing(localUsers, notificationUser);
                  env.checkForEmptyStack();
                  modal.dismiss();
                })
                .catch(error => {
                  console.log(error);
                  modal.dismiss();
                });
              } else {
                console.log("No nearby users found!");
                modal.dismiss();
              }
            })
            .catch(error => {
              console.log(error);
              modal.dismiss();
            });
          })
          .catch(error => {
            console.log(error);
            modal.dismiss();
          });
      } else {
        env.discoverS.fetchDiscoverableUsers(prefs)
        .then(users => {
          env.users = env.finishProcessing(users, notificationUser);
          env.checkForEmptyStack();
          modal.dismiss();
        })
        .catch(error => {
          console.log(error);
          modal.dismiss();
        });
      }
    })
    .catch(error => {
      console.log(error);
      modal.dismiss();
    });
  }

  finishProcessing(users, notificationUser) {    
    let env = this;
    var existingUsers = [];
    for (var i in users) {
      var user = users[i];
      if (user && !env.seenMap[user.id]) {
        var mutual = [];
        for (var key in user.friends) {
          if (env.userS.user.friends.includes(user.friends[key])) {
            mutual.push(user.friends[key]);
          }
        }
        if (mutual.length > 0) {
          user.mutual = mutual.length;
        }
        existingUsers.push(user);
      }
    }
    if (notificationUser) {
      console.log("Adding notification user to beggining of stack");
      console.log(notificationUser);
      existingUsers.push(notificationUser);
      env.pushS.notificationUID = null;
      let alert = this.alertCtrl.create({
        title: notificationUser.firstName + 'double liked you!',
        message: 'Swipe right on them to start a conversation.',
        buttons: ['Dismiss']
      });
      alert.present();
    }
    return existingUsers;
  }

  checkForEmptyStack() {
    let env = this;
    if (env.loadedUsers.length == 0 && env.users.length > 0) {
      console.log("Refilling users...");
      var nextUsers = [];
      for (var i = 0; i < 15; i++) {
        let user = env.users[i];
        if (user) {
          if (!env.seenMap[user.id]) {
            nextUsers.push(env.users[i]);
          }
        }
      }
      env.users.splice(0, nextUsers.length, null);
      env.loadedUsers = nextUsers;
    }
  }

  throwLeft() {
    /*
    this.throwingLeftId = this.loadedUsers[this.loadedUsers.length - 1].id;
    setTimeout(() => {
      console.log("Finshed swipe left");
      this.throwingLeftId = '';
      this.swipeLeft();
    }, 500);
    */
    this.swipeLeft();
  }

  throwRight() {
    /*
    this.throwingRightId = this.loadedUsers[this.loadedUsers.length - 1].id;
    setTimeout(() => {
      console.log("Finshed swipe right");
      this.throwingRightId = '';
      this.swipeRight();
    }, 500);
    */
    this.swipeRight();
  }

  swipeLeft() {
    if (this.loadedUsers.length > 0 && this.loadedUsers[0]) {
      let currentCard = this.loadedUsers.pop();
      this.undoHistory.push(currentCard);
      this.seenMap[currentCard.id] = true;
      this.checkForEmptyStack();
      console.log("Swiping left on...");
      console.log(currentCard);
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
        this.undo('left');
      });
    } else {
      this.loadedUsers = [];
      this.checkForEmptyStack();
    }
  }

  swipeRight() {
    let env = this;
    if (this.loadedUsers.length > 0 && this.loadedUsers[0]) {
      let currentCard = env.loadedUsers.pop();
      env.undoHistory.push(currentCard);
      env.seenMap[currentCard.id] = true;
      env.checkForEmptyStack();
      console.log("Swiping right on...");
      console.log(currentCard);
      if (this.dailyLikes < 15 + env.paymentS.extraLikes) {
        env.discoverS.liked(currentCard)
          .then(matched => {
            env.dailyLikes++;
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
            env.undo('right');
          });
      } else {
        let modal = env.modalCtrl.create(PaymentPage, {
            user: currentCard,
            discovering: true
        });
        modal.present();
        modal.onDidDismiss(() => {
          env.undo('right');
        })
        modal.present();
      }
    } else {
      this.loadedUsers = [];
      env.checkForEmptyStack();
    }
  }

  doubleLike() {
    let env = this;
    if (this.loadedUsers.length > 0 && this.loadedUsers[0]) {
      console.log("Finshed swipe right");
      let currentCard = env.loadedUsers.pop();
      env.undoHistory.push(currentCard);
      env.seenMap[currentCard.id] = true;
      env.checkForEmptyStack();
      console.log("Double liking...");
      console.log(currentCard);
      if (env.dailyDoubleLikes < 2 + env.paymentS.extraDoubleLikes) {
        env.discoverS.doubleLiked(currentCard)
        .then(matched => {
          env.dailyDoubleLikes++;
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
          env.undo('double');
        });
      } else {
        console.log(currentCard);
        let modal = env.modalCtrl.create(PaymentPage, {
            user: currentCard,
            discovering: true
        });
        modal.onDidDismiss(() => {
          env.undo('double');
        })
        modal.present();
      }
      /*
      env.throwingRightId = env.loadedUsers[env.loadedUsers.length - 1].id;
      setTimeout(() => {
        env.throwingRightId = '';
      }, 500);
      */
    } else {
      this.loadedUsers = [];
      env.checkForEmptyStack();
    }
  }

  presentMatchWith(user) {
    let modal = this.modalCtrl.create(MatchedPage, {
        user: this.userS.user,
        otherUser: user
    });
    modal.present();
    modal.onDidDismiss((data) => {
      if (data) {
        this.navCtrl.push(ChatPage, {
            user: data[0],
            chat: data[1]
        });
      }
    })
    modal.present();
  }

  undo(type) {
    console.log("Undo pressed!");
    if (this.undoHistory.length > 0) {
      let undoCard = this.undoHistory.pop();
      this.loadedUsers.push(undoCard);
      if (type == 'double') {
        this.dailyLikes--;
        this.dailyDoubleLikes--;
      } else if (type == 'right') {
        this.dailyLikes--;
      }
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
