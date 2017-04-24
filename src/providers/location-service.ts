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
    this.getLocation();
  }

  getLocation(): Promise<any> {
    return new Promise((resolve, reject) => {
      var env = this;
      if (this.currentLocation) {
        resolve(env.currentLocation);
      } else {
        if (env.platform.is('android')) {
          console.log("Asking user to get their location (android)...");
          if (navigator.geolocation) {
            var options = {
              enableHighAccuracy: true
            };
            navigator.geolocation.getCurrentPosition(location => {
              env.currentLocation = location;
              env.setLocation.bind(env)(location);
              resolve(location);
            }, error => {
              console.log(error);
              reject(error);
            }, options);
          }
        } else if (env.platform.is('cordova')) {
          console.log("Asking user to get their location (cordova)...");
          Geolocation.getCurrentPosition().then(location => {
            env.currentLocation = location;
            env.setLocation.bind(env)(location)
            resolve(location);
          }).catch(error => {
            env.errorHandler(error);
            reject(error);
          });
        } else {
          // Uses the HTML5 geolocation API to get the current user's location
          if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
            console.log("Asking user to get their location (html5)...");
            navigator.geolocation.getCurrentPosition(function(location) {
                env.currentLocation = location;
                env.setLocation(location);
                resolve(location);
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
    let env = this;
    console.log("Fetching nearby keys...");
    return new Promise((resolve, reject) => {
      let latitude = env.currentLocation.coords.latitude;
      let longitude = env.currentLocation.coords.longitude;
      console.log("Found current position:");
      console.log(latitude);
      console.log(longitude);
      var nearbyKeys = [];
      var geoQuery = env.geoRef.query({
        center: [latitude, longitude],
        radius: 160.934 // kilometers
      });

      var keyEntered = geoQuery.on("key_entered", (key, location, distance) => {
        console.log('Found ' + key + ', ' + distance + ' km away at coordinate:', location);
        nearbyKeys.push(key);
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