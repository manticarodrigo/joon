import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { DiscoverService } from '../../providers/discover-service';
import { UserService } from '../../providers/user-service';
import { ChatsPage } from '../chats/chats';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, private discoverS: DiscoverService, private userS: UserService) {
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
    this.discoverS.fetchDiscoverableUsers().then(data => {
      console.log("fetch returned visible users");
      console.log(data);
      this.users = data;
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
      this.discoverS.saw(currentCard.id).then(success => {
        this.presentToast('You did not like: ' + currentCard.firstName);
      }).catch(error => {
        this.presentToast('Error saving swipe');
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
      this.discoverS.saw(currentCard.id).then(success => {
        this.discoverS.liked(currentCard.id).then(success => {
          this.presentToast('You liked: ' + currentCard.firstName);
        }).catch(error => {
          this.presentToast('Error saving swipe');
        });
      }).catch(error => {
        this.presentToast('Error saving swipe');
      });
    }
  }

  doubleLike() {
    this.presentToast("You double liked " + this.users[0].firstName );

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
