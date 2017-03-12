import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, MenuController } from 'ionic-angular';

import { DiscoverService } from '../../providers/discover-service';
import { UserService } from '../../providers/user-service';
import { ChatService } from '../../providers/chat-service';
import { ModalService } from '../../providers/modal-service';
import { LocationService } from '../../providers/location-service';

import { ChatsPage } from '../chats/chats';
import { ChatPage } from '../chat/chat';
import { LoadingPage } from '../loading/loading';
import { MatchedPage } from '../matched/matched';
import { ProfilePage } from '../profile/profile';
import { PreferencesPage } from '../preferences/preferences';

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
  noUsers: boolean = true;
  undoHistory: Array<any>;
  stackConfig: StackConfig;
  toastSeen: Array<boolean>;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private menu: MenuController,
              private discoverS: DiscoverService,
              private userS: UserService,
              private chatS: ChatService,
              private modalS: ModalService,
              private locationS: LocationService) {
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
    this.undoHistory = [];
    this.toastSeen = [false, false, false];
  }

  ionViewDidLoad() {
    // Either subscribe in controller or set in HTML
    this.swingStack.throwin.subscribe((event: DragEvent) => {
      event.target.style.background = '#fff';
    });
  }

  ionViewWillEnter() {
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
    this.modalS.message = "Finding people nearby...";
    if (!this.modalS.isActive) {
      this.modalS.create(LoadingPage);
      this.modalS.present();
    }
    if (this.userS.user.distance == 'local') {
      env.locationS.getLocation().then(() => {
          env.locationS.fetchNearbyKeys().then(keys => {
            env.userS.fetchUsers(keys).then(users => {
              env.discoverS.fetchLocalUsers(users).then(localUsers => {
                for (var i in localUsers) {
                  env.noUsers = false;
                  var mutual = [];
                  for (var key in localUsers[i].friends) {
                    if (this.userS.user.friends.includes(localUsers[i].friends[key])) {
                      mutual.push(localUsers[i].friends[key]);
                    }
                  }
                  if (mutual.length > 0) {
                    localUsers[i]['mutual'] = mutual.length;
                  }
                }
                env.users = localUsers;
                env.modalS.dismiss();
              }).catch(error => {
                console.log(error);
                env.modalS.dismiss();
              });
            }).catch(error => {
              console.log(error);
              env.modalS.dismiss();
            });
          }).catch(error => {
            console.log(error);
            env.modalS.dismiss();
          });
        }).catch(error => {
          console.log(error);
          env.modalS.dismiss();
        });
    } else {
      this.discoverS.fetchGlobalUsers().then(users => {
        console.log("fetch returned visible users");
        console.log(users);
        for (var i in users) {
          env.noUsers = false;
          var mutual = [];
          for (var key in users[i].friends) {
            if (this.userS.user.friends.includes(users[i].friends[key])) {
              mutual.push(users[i].friends[key]);
            }
          }
          if (mutual.length > 0) {
            users[i]['mutual'] = mutual.length;
          }
        }
        this.users = users;
        this.modalS.dismiss()
      }).catch(error => {
        console.log(error);
      });
    }
  }

  swipeLeft() {
    console.log("Swiping left...");
    console.log(this.users.length);
    if (this.users.length > 0) {
      let currentCard = this.users.pop();
      this.undoHistory.push(currentCard);
      console.log(currentCard);
      this.discoverS.saw(currentCard).then(success => {
        if (!this.toastSeen[0]) {
          this.toastSeen[0] = true;
          this.presentToast('You did not like ' + currentCard.firstName);
        }
      }).catch(error => {
        console.log(error);
        this.presentToast('Error saving swipe');
        this.undo();
      });
    } else {
      this.noUsers = true;
    }
  }

  swipeRight() {
    console.log("Swiping right...");
    console.log(this.users.length);
    if (this.users.length > 0) {
      this.discoverS.checkDailyLikes().then(num => {
        let currentCard = this.users.pop();
        this.undoHistory.push(currentCard);
        console.log(currentCard);
        if (num < 7) {
          this.discoverS.saw(currentCard).then(success => {
            this.discoverS.liked(currentCard).then(matched => {
              if (!this.toastSeen[1]) {
                this.toastSeen[1] = true;
                this.presentToast('You liked ' + currentCard.firstName);
              }
              if (matched) {
                this.modalS.user = this.userS.user;
                this.modalS.otherUser = currentCard;
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
            }).catch(error => {
              console.log(error);
              this.presentToast('Error saving swipe');
              this.undo();
            });
          }).catch(error => {
            console.log(error);
            this.presentToast('Error saving swipe');
            this.undo();
          });
        } else {
          let alert = this.alertCtrl.create({
            title: 'Out of likes!',
            subTitle: 'Please come back in 24 hours.',
            buttons: [
            {
                text: 'Dismiss',
                handler: data => {
                    console.log('Dismiss clicked');
                    this.undo();
                }
            },
            ]
          });
          alert.present();
        }
      }).catch(error => {
        console.log(error);
      });
    } else {
      this.noUsers = true;
    }
  }

  doubleLike() {
    console.log("Double liking...");
    console.log(this.users.length);
    if (this.users.length > 0) {
      this.discoverS.checkDailyLikes().then(num => {
        let currentCard = this.users.pop();
        this.undoHistory.push(currentCard);
        console.log(currentCard);
        if (num < 7) {
          this.discoverS.saw(currentCard).then(success => {
            this.discoverS.doubleLiked(currentCard).then(matched => {
              if (!this.toastSeen[2]) {
                this.toastSeen[2] = true;
                this.presentToast('You double liked ' + currentCard.firstName);
              }
              if (matched) {
                this.modalS.user = this.userS.user;
                this.modalS.otherUser = currentCard;
                this.modalS.create(MatchedPage);
                this.modalS.present();
              }
            }).catch(error => {
              console.log(error);
              this.presentToast('Error saving swipe');
              this.undo();
            });
          }).catch(error => {
            console.log(error);
            this.presentToast('Error saving swipe');
            this.undo();
          });
        } else {
          let alert = this.alertCtrl.create({
            title: 'Out of likes!',
            subTitle: 'Please come back in 24 hours.',
            buttons: [
            {
                text: 'Dismiss',
                handler: data => {
                    console.log('Dismiss clicked');
                    this.undo();
                }
            },
            ]
          });
          alert.present();
        }
      }).catch(error => {
        console.log(error);
      });
    } else {
      this.noUsers = true;
    }
  }

  undo() {
    console.log("Undo pressed!");
    if (this.undoHistory.length > 0) {
      let undoCard = this.undoHistory.pop();
      this.users.push(undoCard);
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
