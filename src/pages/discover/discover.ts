import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { DiscoverService } from '../../providers/discover-service';
import { UserService } from '../../providers/user-service';
import { ChatService } from '../../providers/chat-service';
import { LoadingService } from '../../providers/loading-service';
import { LocationService } from '../../providers/location-service';

import { ChatsPage } from '../chats/chats';
import { ChatPage } from '../chat/chat';
import { LoadingPage } from '../loading/loading';
import { MatchedPage } from '../matched/matched';

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
  undoHistory: Array<any>;
  stackConfig: StackConfig;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public toastCtrl: ToastController,
              private discoverS: DiscoverService,
              private userS: UserService,
              private chatS: ChatService,
              private loadingS: LoadingService,
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
    // this.locationS.getLocation();
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

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 500,
      position: 'top'
    });
    toast.present();
  }

  fetchUsers() {
    console.log("fetching discoverable users");
    this.loadingS.user = this.userS.user;
    this.loadingS.message = "Finding people nearby...";
    if (!this.loadingS.isActive) {
      this.loadingS.create(LoadingPage);
      this.loadingS.present();
    }
    this.discoverS.fetchDiscoverableUsers().then(users => {
      console.log("fetch returned visible users");
      console.log(users);
      this.users = users;
      this.loadingS.dismiss()
    }).catch(error => {
      alert(error);
    });
  }

  swipeLeft() {
    console.log("Swiping left...");
    console.log(this.users.length);
    if (this.users.length > 0) {
      let currentCard = this.users.pop();
      this.undoHistory.push(currentCard);
      console.log(currentCard);
      this.discoverS.saw(currentCard).then(success => {
        this.presentToast('You did not like ' + currentCard.firstName);
      }).catch(error => {
        console.log(error);
        this.presentToast('Error saving swipe');
        this.undo();
      });
    }
  }

  swipeRight() {
    console.log("Swiping right...");
    console.log(this.users.length);
    if (this.users.length > 0) {
      let currentCard = this.users.pop();
      this.undoHistory.push(currentCard);
      console.log(currentCard);
      this.discoverS.saw(currentCard).then(success => {
        this.discoverS.liked(currentCard).then(matched => {
          this.presentToast('You liked ' + currentCard.firstName);
          if (matched) {
            this.loadingS.user = this.userS.user;
            this.loadingS.otherUser = currentCard;
            this.loadingS.create(MatchedPage);
            this.loadingS.modal.onDidDismiss(data => {
              if (data) {
                this.navCtrl.push(ChatPage, {
                    user: data[0],
                    chat: data[1]
                });
              }
            });
            this.loadingS.present();
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
    }
  }

  doubleLike() {
    console.log("Double liking...");
    console.log(this.users.length);
    if (this.users.length > 0) {
      let currentCard = this.users.pop();
      this.undoHistory.push(currentCard);
      console.log(currentCard);
      this.discoverS.saw(currentCard).then(success => {
        this.discoverS.doubleLiked(currentCard).then(matched => {
          this.presentToast('You double liked ' + currentCard.firstName);
          if (matched) {
            this.loadingS.user = this.userS.user;
            this.loadingS.otherUser = currentCard;
            this.loadingS.create(MatchedPage);
            this.loadingS.present();
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
    }
  }

  undo() {
    this.presentToast("Undo pressed!");
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
