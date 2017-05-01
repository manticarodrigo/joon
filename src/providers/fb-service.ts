import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Facebook } from 'ionic-native';
import { FacebookService } from 'ng2-facebook-sdk';

@Injectable()
export class FbService {
  private FB_APP_ID: number = 713879188793156;
  private permissions: Array<string> = [
                'user_photos',
                'user_friends',
                'user_birthday',
                'user_about_me',
                'user_hometown',
                'user_location',
                'user_religion_politics',
                'user_education_history',
                'user_work_history'
            ];

  constructor(private platform: Platform,
              private fb: FacebookService) {
    this.platform.ready().then(() => {
      // Check If Cordova/Mobile
      if (this.platform.is('cordova')) {
        // Native Facebook sdk
        Facebook.browserInit(this.FB_APP_ID, "v2.8");
      } else {
        // Web Facebook sdk
        this.fb.init({
            appId: '713879188793156',
            version: 'v2.8'
        });
      }
    });
  }

  facebookLogin(): Promise<any> {
    let env = this;
    return new Promise((resolve, reject) => {
        // Check If Cordova/Mobile
        if (this.platform.is('cordova')) {
            console.log("Starting Mobile Facebook login...");
            Facebook.login(env.permissions)
            .then(response => {
                console.log("Mobile Facebook login returned response.");
                resolve(response);
            })
            .catch(error => {
                console.log(error);
                reject(error);
            });
        } else {
            console.log("Starting Core Facebook login...");
            env.fb.login(env.permissions)
            .then(response => {
                console.log("Core Facebook login returned response.");
                resolve(response);
            })
            .catch(error => {
                console.log(error);
                reject(error);
            });
        }
    });
  }

  callFacebookAPI(): Promise<any> {
    let env = this;
    return new Promise((resolve, reject) => {
      // Check If Cordova/Mobile
      if (this.platform.is('cordova')) {
          console.log("Calling mobile Facebook API...");
          Facebook.api('/me?fields=id,name,gender,birthday,education,first_name,location,religion,work,friends', [])
          .then(data => {
            console.log('requesting location data from facebook API');
            let apiStr = '/' + data.location.id + '?fields=location';
            Facebook.api(apiStr, [])
            .then(locData => {
              console.log('location data retrieved from facebook API');
              data.location = locData;
              console.log('Facebook API returned:');
              console.log(data);
              resolve(env.parseFacebookUserData(data));
            })
            .catch(error => {
              console.log(error);
              reject(error);
            });
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
        } else {
          console.log("Calling core Facebook API...");
          env.fb.api('/me?fields=id,name,gender,birthday,education,first_name,location{location},religion,work,friends')
          .then((data) => {
            console.log('Facebook API returned:');
            console.log(data);
            resolve(env.parseFacebookUserData(data));
          }).catch(error => {
            console.log(error);
            reject(error);
          });
        }
    });
  }
    
  parseFacebookUserData(data) {
      let rv = data;
      console.log(rv);
      if (rv.first_name) {
          console.log("rv has first name");
          rv.firstName = rv.first_name;
          delete rv.first_name;
          console.log(rv.firstName);
      }
      if (rv.location) {
          console.log("rv has location");
          if (rv.location.location.city && rv.location.location.country) {
              rv.city = rv.location.location.city;
              rv.country = rv.location.location.country;
              console.log(rv.city);
              console.log(rv.country);
          }
          delete rv.location
      }
      if (rv.education) {
          console.log("rv has school");
          let nSchools = rv.education.length;
          if (nSchools >= 1) {
            rv.school = rv.education[nSchools - 1].school.name;
          }
          if (nSchools >= 2) {
            rv.school2 = rv.education[nSchools - 2].school.name;
          }
          delete rv.education;
          console.log(rv.school);
          console.log(rv.school2);
      }
      if (rv.birthday) {
          console.log("rv has birthday");
          let splitBDay = rv.birthday.split('/');
          var year = parseInt(splitBDay[2]);
          var month = parseInt(splitBDay[0]);
          var day = parseInt(splitBDay[1]);

          let today = new Date();
          let age = today.getFullYear() - year;
          if ( today.getMonth() < (month - 1) ) {
            age--;
          } else if (((month - 1) == today.getMonth()) && (today.getDate() < day)) {
            age--;
          }
          rv.age = age;
          console.log(rv.age);
          rv.birthday = year;
          if (month < 10) {
            rv.birthday += '-0' + month + '-';
          } else {
            rv.birthday += '-' + month + '-';
          }
          if (day < 10) {
            rv.birthday += '0' + day;
          } else {
            rv.birthday += day;
          }
          console.log(rv.birthday);
      }
      if (rv.work) {
          console.log("rv has job");
          let nJobs = rv.work.length;
          if (nJobs >= 1) {
            if (rv.work[0]) {
              if (rv.work[0].position) {
                rv.job = rv.work[0].position.name;
              }
              if (rv.work[0].employer) {
                rv.company = rv.work[0].employer.name;
              }
            }
          }
          delete rv.work;
          console.log(rv.job);
      }

      if (rv.friends) {
        if (rv.friends.data) {
          let idArray = [];
          for (var i=0; i < rv.friends.data.length; i++) {
              idArray.push(rv.friends.data[i]["id"]);
          }
          rv.friends = idArray;
          console.log(rv.friends);
        }
      }
      
      console.log(rv);
      return rv;
  }

  callFacebookPhotoAPI(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check If Cordova/Mobile
      if (this.platform.is('cordova')) {
        console.log("Calling mobile Facebook photo API...");
        Facebook.api('/me/albums', []).then( (data) => {
          console.log('API returned album data:');
          console.log(data);
          var albums = data.data;
          if (albums.length > 0) {
            var albumArr = [];
            var albumCount = 0;
            var insta: any;
            for (var key in albums) {
              console.log(albums[key]);
              let currentAlbum = albums[key];
              this.fetchImagesIn(currentAlbum.id).then(urls => {
                var album = {};
                album['name'] = currentAlbum.name;
                album['urls'] = urls;
                if (urls.length > 0) {
                  if (currentAlbum.name == 'Profile Pictures') {
                    albumArr.splice(0, 0, album);
                  } else if (currentAlbum.name == 'Instagram Photos') {
                    insta = album;
                  } else {
                    albumArr.push(album);
                  }
                }
                albumCount++;
                if (albumCount == albums.length) {
                  if (insta) {
                    albumArr.splice(1, 0, insta);
                  }
                  resolve(albumArr);
                }
              }).catch(error => {
                console.log(error);
                reject(error);
              });
            }
          } else {
            resolve(null);
          }
        }).catch(error => {
            if (error.code == 2500) {
              this.facebookLogin();
            }
            console.log(error);
            reject(error);
        });
      } else {
        console.log("Calling core Facebook photos API...");
        this.fb.api('/me/albums').then((data) => {
          console.log('API returned album data:', data);
          var albums = data.data;
          if (albums.length > 0) {
            var albumArr = [];
            var albumCount = 0;
            var insta: any;
            for (var key in albums) {
              console.log(albums[key]);
              let currentAlbum = albums[key];
              this.fetchImagesIn(currentAlbum.id).then(urls => {
                var album = {};
                album['name'] = currentAlbum.name;
                album['urls'] = urls;
                if (urls.length > 0) {
                  if (currentAlbum.name == 'Profile Pictures') {
                    albumArr.splice(0, 0, album);
                  } else if (currentAlbum.name == 'Instagram Photos') {
                    insta = album;
                  } else {
                    albumArr.push(album);
                  }
                }
                albumCount++;
                if (albumCount == albums.length) {
                  if (insta) {
                    albumArr.splice(1, 0, insta);
                  }
                  resolve(albumArr);
                }
              }).catch(error => {
                console.log(error);
                reject(error);
              });
            }
          } else {
            resolve(null);
          }
        }).catch(error => {
          if (error.code == 2500) {
            this.facebookLogin();
          }
          console.log(error);
          reject(error);
        });
      }
    });
  }

  fetchImagesIn(albumId): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check If Cordova/Mobile
      if (this.platform.is('cordova')) {
        console.log("Fetching album images on mobile...");
        Facebook.api(albumId + '/photos?fields=images', []).then((imageData) => {
          console.log('API returned album image data from Facebook:', imageData);
          var imgArr = imageData.data;
          var urlArr = [];
          for (var key in imgArr) {
            var url = imgArr[key].images[0].source;
            urlArr.push(url);
          }
          resolve(urlArr);
        }).catch(error => {
          if (error.code == 2500) {
            this.facebookLogin();
          }
          console.log(error);
          reject(error);
        });
      } else {
        console.log("Fetching album images on core...");
        this.fb.api(albumId + '/photos?fields=images').then((imageData) => {
          console.log('API returned album image data from Facebook:', imageData);
          var imgArr = imageData.data;
          var urlArr = [];
          for (var key in imgArr) {
            var url = imgArr[key].images[0].source;
            urlArr.push(url);
          }
          resolve(urlArr);
        }).catch(error => {
          if (error.code == 2500) {
            this.facebookLogin();
          }
          console.log(error);
          reject(error);
        });
      }
    });
  }

  signOut() {
    // Check If Cordova/Mobile
      if (this.platform.is('cordova')) {
          // Mobile Facebook logout
          Facebook.logout();
      } else {
          // Core Facebook logout
          this.fb.logout();
      }
      // Firebase logout
      firebase.auth().signOut();
  }

}