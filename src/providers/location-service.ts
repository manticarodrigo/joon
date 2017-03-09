import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import firebase from 'firebase';
import * as GeoFire from 'geofire';

import { UserService } from './user-service';

@Injectable()
export class LocationService {

  geoRef: any;
  currentLocation: any;

  constructor(private storage: Storage,
              private platform: Platform,
              private userS: UserService) {
    let ref = firebase.database().ref('user_located');
    this.geoRef = new GeoFire(ref);
  }

  getLocation(): Promise<any> {
    return new Promise((resolve, reject) => {
      var env = this;
      if (this.currentLocation) {
        resolve('success');
      } else {
        // Check If Cordova/Mobile
        if (env.platform.is('cordova')) {
          console.log("Asking user to get their location (cordova)...");
          Geolocation.getCurrentPosition().then(location => {
            env.setLocation.bind(env)(location);
            resolve('success');
          }).catch(error => {
            env.errorHandler(error);
            reject(error);
          });
        } else {
          // Uses the HTML5 geolocation API to get the current user's location
          if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
            console.log("Asking user to get their location (html5)...");
            navigator.geolocation.getCurrentPosition(function(location) {
                env.setLocation(location);
                resolve('success');
            }, function(error) {
                console.log(error);
                reject(error);
            });
          } else {
            console.log("Your browser does not support the HTML5 Geolocation API, so this demo will not work.")
            reject('geolocation not supported');
          }
        }
      }
    });
  }

  setLocation(location) {
    this.currentLocation = location;
    var latitude = location.coords.latitude;
    var longitude = location.coords.longitude;
    console.log("Retrieved user's location: [" + latitude + ", " + longitude + "]");
    this.geoRef.set(this.userS.user.id, [latitude, longitude]).then(() => {
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

  fetchNearbyKeys(): Promise<any> {
    console.log("Fetching nearby keys...");
    return new Promise((resolve, reject) => {
    var latitude = this.currentLocation.coords.latitude;
    var longitude = this.currentLocation.coords.longitude;
    var env = this;
    var nearbyKeys = [];
      var geoQuery = this.geoRef.query({
        center: [latitude, longitude],
        radius: 160.934 // kilometers
      });

      var keyEntered = geoQuery.on("key_entered", (key, location, distance) => {
        console.log('Found ' + key + ', ' + distance + ' km away at coordinate:', location);
        if (key != env.userS.user.id) {
          nearbyKeys.push(key);
        }
      });

      geoQuery.on("ready", function() {
        // This will fire once the initial data is loaded, so now we can cancel the "key_entered" event listener
        keyEntered.cancel();
        console.log("GeoQuery ready!");
        resolve(nearbyKeys);
      });
    });
  }
}