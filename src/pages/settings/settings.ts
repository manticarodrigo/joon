import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
    newMatchOn = true;
    
    constructor(public navCtrl: NavController) {
    
    }
    
    toggleMatches() {
        console.log("Matches toggled");
    }
    
    toggleMessages() {

    }

}