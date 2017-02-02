import { Facebook } from 'ionic-native';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable }  from 'rxjs/Rx';

@Injectable()
export class FacebookService {

  // private accessToken = '<your app token>';

  // private graphUrl = 'https://graph.facebook.com/';
  // private graphQuery = `?access_token=${this.accessToken}&date_format=U&fields=posts{from,created_time,message,attachments}`;

  // private loggedIn = false;

  constructor(private http: Http) {
    ;
  }


  // fields = 'first_name,gender,location,religion,birthday,education,work'

  // getPosts(pageName: string): Observable<any[]> {
  //   let url = this.graphUrl + pageName + this.graphQuery;

  //   return this.http
  //       .get(url)
  //       .map(response => response.json().posts.data);
  //  }
}