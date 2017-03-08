import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import firebase from 'firebase';
import * as GeoFire from 'geofire';

import { UserService } from './user-service';

@Injectable()
export class LocationService {

  ref: any;
  geoFire: any;

  constructor(private platform: Platform,
              private userS: UserService) {
    // Get the current user's location
    this.ref = firebase.database().ref('user_located');
    this.geoFire = new GeoFire(this.ref);
    this.getLocation();
  }

  getLocation() {
    // Check If Cordova/Mobile
    var env = this;
    if (this.platform.is('cordova')) {
      console.log("Asking user to get their location (cordova)...");
      // console.log("this.geoFire:")
      // console.log(this.geoFire);
      Geolocation.getCurrentPosition().then(location => {
        env.setLocation.bind(env)(location);
      }).catch(error => {
        this.errorHandler(error);
      });
    } else {
      // Uses the HTML5 geolocation API to get the current user's location
      if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
        console.log("Asking user to get their location (html5)...");
        navigator.geolocation.getCurrentPosition(env.setLocation.bind(env), env.errorHandler);
      } else {
        console.log("Your browser does not support the HTML5 Geolocation API, so this demo will not work.")
      }
    }
  }

  setLocation(location) {
    var latitude = location.coords.latitude;
    var longitude = location.coords.longitude;
    console.log("Retrieved user's location: [" + latitude + ", " + longitude + "]");

    this.geoFire.set(this.userS.user.id, [latitude, longitude]).then(() => {
      console.log("Current user " + this.userS.user.firstName + "'s location has been added to GeoFire");
    }).catch(error => {
      console.log("Error adding user " + this.userS.user.firstName + "'s location to GeoFire");
    });
  }

  // Handles any errors from trying to get the user's current location
  errorHandler(error) {
    if (error.code == 1) {
      console.log("Error: PERMISSION_DENIED: User denied access to their location");
    } else if (error.code === 2) {
      console.log("Error: POSITION_UNAVAILABLE: Network is down or positioning satellites cannot be reached");
    } else if (error.code === 3) {
      console.log("Error: TIMEOUT: Calculating the user's location too took long");
    } else {
      console.log("Unexpected error code")
    }
  };

}