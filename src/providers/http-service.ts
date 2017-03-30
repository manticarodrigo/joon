import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { HTTP } from 'ionic-native';
import { Http, ResponseContentType, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
// import {Http, Response, URLSearchParams} from '@angular/http';
// import 'rxjs/Rx';

import { UserService } from './user-service';

@Injectable()
export class HttpService {

  constructor(private http: Http,
              private platform: Platform,
              private userS: UserService) {
    HTTP.setHeader("access_token", this.userS.user.accessToken);
    HTTP.acceptAllCerts(true);
    HTTP.enableSSLPinning(true);
  }

  getImageStringFrom(url): Promise<any> {
    console.log("Http image get request for:");
    console.log(url);
    return new Promise((resolve, reject) => {
        this.http.get(url, { responseType: ResponseContentType.Blob })
        .map(res => res.blob())
        .subscribe(blob => {
            console.log("Http request returned blob:")
            console.log(blob);
            var reader = new FileReader();
            reader.readAsDataURL(blob); 
            reader.onloadend = function() {
                console.log("Converted blob to base64 string!");
                var base64String = this.result.split('base64,')[1];               
                console.log(base64String);
                resolve(base64String);
            };
        });
        /* Check If Cordova/Mobile
        if (this.platform.is('cordova')) {
            HTTP.get(url, {}, {})
            .then(data => {
                console.log("Http request returned data:")
                console.log(data);
                var reader = new FileReader();
                reader.readAsDataURL(data.data); 
                reader.onloadend = function() {
                    console.log("Converted blob to base64 string!");
                    var base64String = this.result.split('base64,')[1];               
                    console.log(base64String);
                    resolve(base64String);
                };
            })
            .catch(error => {
                console.log(error);
            });
        } else {
        
        }*/
    });
  }

}

/* Check If Cordova/Mobile
if (this.platform.is('cordova')) {
    console.log("Getting image file on mobile from url:");
    console.log(url);
    var fileTransfer = new Transfer();
    var fileName = new Date().getTime().toString() + '.png';
    fileTransfer.download(url, env.storageDirectory + fileName)
        .then((entry)=>{
            console.log('download complete: ' + entry.toURL());
            entry.file(function (file) {
                console.log("Extracted file:")
                console.log(file);
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = function() {
                    console.log("Successful file read: " + reader.result);
                    var base64String = reader.result.split('base64,')[1];               
                    console.log(base64String);
                    resolve(base64String);
                };
            });
        }).catch(error => {
            console.log(error);
            reject(error);
    }).catch(error => {
        console.log(error);
        reject(error);
    });
} else {
    
}*/
