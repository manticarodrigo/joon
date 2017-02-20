import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import firebase from 'firebase';

@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html'
})
export class FeedbackPage {

  constructor(public navCtrl: NavController) {
    
  }

  fixTestUserData(any): any {
    return {};
  }

  createTestUsers() {
    var someTestUsers = [{"gender":"female","name":{"title":"ms","first":"isla","last":"marttila"},"location":{"street":"9656 pirkankatu","city":"teuva","state":"north karelia","postcode":64459},"email":"isla.marttila@example.com","login":{"username":"heavyelephant770","password":"luke","salt":"4pf4oKAX","md5":"adf3ffded4ec10cbbde8dcfb886b92fb","sha1":"cddfb90b2b44e5856e124a96a101745321b5778c","sha256":"9ba63474676b28d5e810335e014415cf9452c375009d4aecb7ddcb78001ae80d"},"dob":"1949-12-19 19:16:32","registered":"2015-03-09 22:42:14","phone":"07-736-408","cell":"043-681-71-30","id":{"name":"HETU","value":"1249-5823"},"picture":{"large":"https://randomuser.me/api/portraits/women/4.jpg","medium":"https://randomuser.me/api/portraits/med/women/4.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/4.jpg"},"nat":"FI"},{"gender":"female","name":{"title":"mrs","first":"anni","last":"kuusisto"},"location":{"street":"1519 pyynikintie","city":"sottunga","state":"ostrobothnia","postcode":23207},"email":"anni.kuusisto@example.com","login":{"username":"ticklishladybug337","password":"shou","salt":"Po5xV1Vh","md5":"2f255d451e98f39acdf1040ffcb6a686","sha1":"1d0176d28c7d739e72c96cdd6eea1f1af98ffa82","sha256":"d3b408536f6b501a87ec6792cf6a4b88fcfa69f12e8ccf1de12d4249ed90d87a"},"dob":"1955-08-14 08:39:15","registered":"2003-04-19 18:19:11","phone":"06-376-210","cell":"044-127-85-30","id":{"name":"HETU","value":"755-390D"},"picture":{"large":"https://randomuser.me/api/portraits/women/40.jpg","medium":"https://randomuser.me/api/portraits/med/women/40.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/40.jpg"},"nat":"FI"},{"gender":"female","name":{"title":"mrs","first":"katherine","last":"jacobs"},"location":{"street":"4831 highfield road","city":"ratoath","state":"longford","postcode":50106},"email":"katherine.jacobs@example.com","login":{"username":"yellowostrich688","password":"kirby","salt":"4ZbQ6LQA","md5":"88a39f5ea44a626743379b70483fa576","sha1":"a878df475d2fe4f70ce9adf6b0f8db1a27d8a793","sha256":"23f7734235e1cc1cafdd322254df047291183c237430bfab5f2e4ab1c8d6cc86"},"dob":"1985-09-03 05:12:50","registered":"2015-10-21 07:55:24","phone":"061-048-2201","cell":"081-668-6591","id":{"name":"PPS","value":"1977100T"},"picture":{"large":"https://randomuser.me/api/portraits/women/30.jpg","medium":"https://randomuser.me/api/portraits/med/women/30.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/30.jpg"},"nat":"IE"},{"gender":"female","name":{"title":"ms","first":"becky","last":"rodriquez"},"location":{"street":"7112 george street","city":"nottingham","state":"herefordshire","postcode":"Q8 8ZQ"},"email":"becky.rodriquez@example.com","login":{"username":"organicelephant161","password":"anime","salt":"cMyStNaa","md5":"5aa48ac8777bc527ff7e61d28b3dcc66","sha1":"97f09ffe1b10386fb532b244580aa8c7a1cfde36","sha256":"d4e87a1459f23a92d23c90872bfef3838a6562942f1ef7a33c565bd7bb2bf348"},"dob":"1955-05-11 09:51:59","registered":"2009-01-10 11:50:47","phone":"020 4338 9505","cell":"0738-040-281","id":{"name":"NINO","value":"WL 84 17 66 P"},"picture":{"large":"https://randomuser.me/api/portraits/women/88.jpg","medium":"https://randomuser.me/api/portraits/med/women/88.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/88.jpg"},"nat":"GB"},{"gender":"female","name":{"title":"miss","first":"nalan","last":"doğan"},"location":{"street":"3364 atatürk sk","city":"kahramanmaraş","state":"artvin","postcode":36171},"email":"nalan.doğan@example.com","login":{"username":"lazyswan804","password":"joecool","salt":"BNr6T6y4","md5":"edc86bac0bd7c932e46b1587fedf217b","sha1":"efe2698df55aeb91c912478cf19e7d0ea6c263ce","sha256":"d2f9ba94f9b686f7f00e99a34cf1190cbfb9c26f22412912666ba187ea4ba255"},"dob":"1957-09-09 20:07:06","registered":"2007-06-02 15:37:08","phone":"(838)-357-3225","cell":"(123)-747-9949","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/women/11.jpg","medium":"https://randomuser.me/api/portraits/med/women/11.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/11.jpg"},"nat":"TR"},{"gender":"female","name":{"title":"ms","first":"yasemin","last":"topçuoğlu"},"location":{"street":"2969 kushimoto sk","city":"trabzon","state":"osmaniye","postcode":35988},"email":"yasemin.topçuoğlu@example.com","login":{"username":"goldenostrich233","password":"trojan","salt":"Tnj5sK8v","md5":"5229b13e8a6a807aaa6a415462097791","sha1":"ebd5d51d6249483cd55ef407de5afabb4307e85a","sha256":"3f391dca6df34366a937427a0130d71e67365440f1ace55dcb5252c678861c21"},"dob":"1950-05-06 18:23:22","registered":"2012-01-15 10:35:14","phone":"(198)-927-4905","cell":"(163)-122-1185","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/women/61.jpg","medium":"https://randomuser.me/api/portraits/med/women/61.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/61.jpg"},"nat":"TR"},{"gender":"female","name":{"title":"miss","first":"isla","last":"leinonen"},"location":{"street":"1068 esplanadi","city":"jomala","state":"åland","postcode":44842},"email":"isla.leinonen@example.com","login":{"username":"beautifulostrich474","password":"curious","salt":"1sCMmJxi","md5":"15e1e1095de90b082b71dd93c81ea225","sha1":"3fd3d5927e7cffb55ecb0b0e43d2713f22972b00","sha256":"cde9beec6013a8417e81551400a1ef79aa226607deaa4a314c40dc27ddd5b015"},"dob":"1969-03-30 17:49:32","registered":"2006-04-22 10:00:38","phone":"06-381-570","cell":"049-953-37-67","id":{"name":"HETU","value":"269-202X"},"picture":{"large":"https://randomuser.me/api/portraits/women/81.jpg","medium":"https://randomuser.me/api/portraits/med/women/81.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/81.jpg"},"nat":"FI"},{"gender":"female","name":{"title":"ms","first":"klara","last":"winter"},"location":{"street":"8740 königsberger straße","city":"donau-ries","state":"rheinland-pfalz","postcode":93910},"email":"klara.winter@example.com","login":{"username":"organicmouse663","password":"151515","salt":"cCpraVuT","md5":"d4254ae31e321ec6adb397d405048fb9","sha1":"af18997fec7c5d9314b88eccd9e9dfb187be3d59","sha256":"fdb934c0a63ad68c1118315ed7cad39c62d3a0c31aaa2636f27c95e0d338c861"},"dob":"1978-02-21 22:33:25","registered":"2008-10-15 06:45:16","phone":"0141-0009776","cell":"0179-0997470","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/women/25.jpg","medium":"https://randomuser.me/api/portraits/med/women/25.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/25.jpg"},"nat":"DE"},{"gender":"female","name":{"title":"mrs","first":"martha","last":"scott"},"location":{"street":"5250 hamilton ave","city":"wagga wagga","state":"victoria","postcode":590},"email":"martha.scott@example.com","login":{"username":"ticklishfish660","password":"jeremy1","salt":"mvimuOlI","md5":"cb16e4222319b26caa4f9e46284a0d9e","sha1":"cf7383d47aae2d7257ac0ea1d875b79644df5661","sha256":"34a065b705ac25a50ca97282ca04b74132e865cade5dd5099fcbfd4f27bce04f"},"dob":"1986-07-13 17:39:48","registered":"2005-08-10 22:39:51","phone":"01-0409-3149","cell":"0419-755-860","id":{"name":"TFN","value":"059722911"},"picture":{"large":"https://randomuser.me/api/portraits/women/37.jpg","medium":"https://randomuser.me/api/portraits/med/women/37.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/37.jpg"},"nat":"AU"},{"gender":"male","name":{"title":"mr","first":"ed","last":"sullivan"},"location":{"street":"1970 o'connell street","city":"roscrea","state":"limerick","postcode":26330},"email":"ed.sullivan@example.com","login":{"username":"tinybutterfly134","password":"paris1","salt":"YVR82X41","md5":"ef56789d15c5f28cf52352b4cbe1c3dd","sha1":"84ca0b1466e53a78739008101af11c80a9de73f3","sha256":"d53d54af728667db2a1854b7ac3db7ec20b44e2c77f6243ccea39f1cf32948c8"},"dob":"1972-06-18 20:48:57","registered":"2002-12-27 19:38:09","phone":"041-654-3631","cell":"081-243-9433","id":{"name":"PPS","value":"3442283T"},"picture":{"large":"https://randomuser.me/api/portraits/men/79.jpg","medium":"https://randomuser.me/api/portraits/med/men/79.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/79.jpg"},"nat":"IE"},{"gender":"male","name":{"title":"mr","first":"oğuzhan","last":"bademci"},"location":{"street":"7464 anafartalar cd","city":"bayburt","state":"eskişehir","postcode":48482},"email":"oğuzhan.bademci@example.com","login":{"username":"crazysnake897","password":"lalala","salt":"v6XZyAMb","md5":"96827ed0225efaa3b65cd33ef1d64d6b","sha1":"8e314b09211b0cb5fb8ff7b6ffc8a85aa96b96ff","sha256":"a1979e9d301f94e814b6da1ed45b58b2ff38426f1ef09b05f166c6e1a23f64fd"},"dob":"1950-03-25 00:15:10","registered":"2006-04-26 07:53:13","phone":"(670)-727-1694","cell":"(500)-311-1148","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/men/73.jpg","medium":"https://randomuser.me/api/portraits/med/men/73.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/73.jpg"},"nat":"TR"},{"gender":"male","name":{"title":"mr","first":"jesse","last":"ranta"},"location":{"street":"4224 suvantokatu","city":"kuhmo","state":"lapland","postcode":72019},"email":"jesse.ranta@example.com","login":{"username":"brownfrog127","password":"thomas1","salt":"UxnBhIbH","md5":"18d1b8186caf378b0ff18ebfec8c2bb8","sha1":"a5c83f14a90c156964735c957c609635192e016e","sha256":"f05670af2fc72e7f5ba68ebb2fd1a7e246933295f7f82ec02751cf220edae9f2"},"dob":"1952-01-05 18:49:24","registered":"2011-06-16 11:03:44","phone":"07-770-066","cell":"040-629-97-45","id":{"name":"HETU","value":"652-919W"},"picture":{"large":"https://randomuser.me/api/portraits/men/9.jpg","medium":"https://randomuser.me/api/portraits/med/men/9.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/9.jpg"},"nat":"FI"},{"gender":"female","name":{"title":"miss","first":"lola","last":"campbell"},"location":{"street":"4262 george street","city":"cork","state":"louth","postcode":82907},"email":"lola.campbell@example.com","login":{"username":"blueswan728","password":"111111","salt":"jD8tGhzw","md5":"7bb03912f8924f0f7c17f408fa752bb9","sha1":"2d49800119333844359f80ad5689492a79bd2b61","sha256":"3582720ebc49963b94fd3337db70424c6094e2b6b069b5ac96851334cfde46d7"},"dob":"1964-07-30 22:49:59","registered":"2014-05-25 05:02:14","phone":"061-997-1303","cell":"081-669-9845","id":{"name":"PPS","value":"9396825T"},"picture":{"large":"https://randomuser.me/api/portraits/women/54.jpg","medium":"https://randomuser.me/api/portraits/med/women/54.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/54.jpg"},"nat":"IE"},{"gender":"male","name":{"title":"mr","first":"mamede","last":"da mota"},"location":{"street":"1148 rua alagoas ","city":"pindamonhangaba","state":"ceará","postcode":58785},"email":"mamede.damota@example.com","login":{"username":"ticklishtiger150","password":"sherlock","salt":"W1V46IHk","md5":"5e69d2e12ff68adc9ea00b2b1e670fea","sha1":"cfde9dd585bd3c0717878b723f2617e0d7ef994e","sha256":"fbb4ae0b5c35bc9b0fe48a43b7e0a7eb4c516a6292d749e99cf3985c3d134673"},"dob":"1970-11-17 19:55:33","registered":"2011-12-26 14:39:32","phone":"(80) 9205-9168","cell":"(44) 3466-3406","id":{"name":"","value":null},"picture":{"large":"https://randomuser.me/api/portraits/men/68.jpg","medium":"https://randomuser.me/api/portraits/med/men/68.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/68.jpg"},"nat":"BR"},{"gender":"male","name":{"title":"mr","first":"mille","last":"johansen"},"location":{"street":"7745 hadsundvej","city":"vesterborg","state":"hovedstaden","postcode":72680},"email":"mille.johansen@example.com","login":{"username":"blackbutterfly169","password":"juanita","salt":"BbRoJ79g","md5":"57d3ebfee9c6323303695a7e1d389339","sha1":"ba975550d9ed5b4d1d5114e42ec834a0ad107955","sha256":"3eaded928f78498172d8810817e631b6454bf2d00fafe6eb9cda59ef41cf0a34"},"dob":"1966-03-02 15:22:47","registered":"2003-11-11 05:35:15","phone":"46100579","cell":"96347402","id":{"name":"CPR","value":"770616-8292"},"picture":{"large":"https://randomuser.me/api/portraits/men/88.jpg","medium":"https://randomuser.me/api/portraits/med/men/88.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/88.jpg"},"nat":"DK"},{"gender":"male","name":{"title":"mr","first":"cecil","last":"rhodes"},"location":{"street":"9526 north road","city":"belfast","state":"gloucestershire","postcode":"W46 5UE"},"email":"cecil.rhodes@example.com","login":{"username":"blackfrog136","password":"jenjen","salt":"hlbAAFWm","md5":"33cf1baba51ca55fd52f58598ef73ef5","sha1":"38e3544276eb69d58ad15df70c17cbbc0a4ea0ce","sha256":"f33428f66032e191eb9707117e563aad35f00647a8517072cf326ae781d8ad42"},"dob":"1981-04-07 05:27:04","registered":"2008-04-12 21:10:46","phone":"015395 07957","cell":"0708-660-908","id":{"name":"NINO","value":"HW 32 99 21 E"},"picture":{"large":"https://randomuser.me/api/portraits/men/10.jpg","medium":"https://randomuser.me/api/portraits/med/men/10.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/10.jpg"},"nat":"GB"},{"gender":"male","name":{"title":"mr","first":"allen","last":"chambers"},"location":{"street":"9429 marsh ln","city":"addison","state":"nevada","postcode":20102},"email":"allen.chambers@example.com","login":{"username":"yellowbear895","password":"jjjjj","salt":"5UlRVlyb","md5":"14de32777edb1088d05f23118b6f9e0a","sha1":"0b1d3ccd73497d2d4a4c07d03e56b3f1bc2fe640","sha256":"cc1352c53574af07e2c8082480d1ced43d02851761256b5dc74e625c25ded640"},"dob":"1960-09-15 20:48:39","registered":"2009-12-02 07:05:11","phone":"(755)-756-8888","cell":"(860)-889-5521","id":{"name":"SSN","value":"932-27-4182"},"picture":{"large":"https://randomuser.me/api/portraits/men/91.jpg","medium":"https://randomuser.me/api/portraits/med/men/91.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/91.jpg"},"nat":"US"},{"gender":"male","name":{"title":"monsieur","first":"ilan","last":"fleury"},"location":{"street":"1268 rue andré-gide","city":"froideville","state":"neuchâtel","postcode":2008},"email":"ilan.fleury@example.com","login":{"username":"organicgoose587","password":"faith","salt":"GoCv9GYb","md5":"c02b52c95115571f53c9cf538975bafb","sha1":"9e7be1c070db9e319625b349e84cbf40b4930012","sha256":"cd10ae9ffb5acdda2534430ee58b874536e5cae3595a0a47bb11571320914fcb"},"dob":"1947-03-15 13:07:17","registered":"2008-08-15 13:35:48","phone":"(949)-406-2176","cell":"(794)-953-9147","id":{"name":"AVS","value":"756.JJTD.VUIT.81"},"picture":{"large":"https://randomuser.me/api/portraits/men/23.jpg","medium":"https://randomuser.me/api/portraits/med/men/23.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/23.jpg"},"nat":"CH"},{"gender":"male","name":{"title":"monsieur","first":"aurélien","last":"nicolas"},"location":{"street":"9637 quai charles-de-gaulle","city":"peney-le-jorat","state":"zürich","postcode":5263},"email":"aurélien.nicolas@example.com","login":{"username":"orangedog235","password":"dalejr","salt":"kLAyqVRC","md5":"fb6aa053748bf91afcfafb8f191ec7e4","sha1":"a9e1d84ca8e99789c38cfd82cf56eecb60569199","sha256":"dd8bdb00fdd4199cf5cc738c0eba99c3a19f75fd8d103bcc4f95b7bf714e361c"},"dob":"1948-03-01 14:47:34","registered":"2004-10-01 20:21:17","phone":"(498)-473-7653","cell":"(317)-448-2382","id":{"name":"AVS","value":"756.FFPH.NGAT.17"},"picture":{"large":"https://randomuser.me/api/portraits/men/84.jpg","medium":"https://randomuser.me/api/portraits/med/men/84.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/men/84.jpg"},"nat":"CH"},{"gender":"female","name":{"title":"mrs","first":"begoña","last":"marin"},"location":{"street":"5822 avenida de américa","city":"bilbao","state":"región de murcia","postcode":36032},"email":"begoña.marin@example.com","login":{"username":"brownpanda830","password":"millwall","salt":"0zIuyLH5","md5":"3f658abf7081aebb76b7a61f4d287168","sha1":"dd422cb749aef07595134cc44efce5c2fc636e47","sha256":"1f82a6c460d1fbf88f5c4c08c11e6848f966086c8695ec0e634ad548ff952aba"},"dob":"1972-03-10 03:15:29","registered":"2015-04-24 23:11:21","phone":"952-054-918","cell":"683-048-412","id":{"name":"DNI","value":"58921759-E"},"picture":{"large":"https://randomuser.me/api/portraits/women/48.jpg","medium":"https://randomuser.me/api/portraits/med/women/48.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/48.jpg"},"nat":"ES"}];
    let uid = 1000000000 + Math.random() * 1000000000;
    let ref = firebase.database().ref('users/' + uid);
    for (var i = 0; i < someTestUsers.length; i++) {
      ref.set(this.fixTestUserData(someTestUsers[i]));
    }
  }

  shallowEraseTestUsers() {
    // delete all level 2 nodes with values < 9000000000
  }

}