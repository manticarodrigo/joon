import { Injectable } from '@angular/core';

@Injectable()
export class RandGuyService {
  getRandGuy(): Promise<string> {
    return Promise.resolve('whaeva');
  }
}