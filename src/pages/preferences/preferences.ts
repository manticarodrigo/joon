import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html'
})
export class PreferencesPage {
    relationship = '';
    
    constructor(public navCtrl: NavController) {
        this.relationship = "women";
    }
    
    selectedMen() {
        console.log("likes men");
    }
    
    selectedWomen() {
        console.log("likes women");
    }
    

}