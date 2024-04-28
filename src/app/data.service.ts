import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private citiesByState: { [key: string]: string[] } = {
    'State 1': ['City A1', 'City B1', 'City C1'],
    'State 2': ['City A2', 'City B2', 'City C2'],
    'State 3': ['City A3', 'City B3', 'City C3']
  };

  private currencies: string[] = ['USD', 'EUR', 'BRL', 'JPY'];


  constructor() { }

  getStates(): Observable<string[]> {
    const states = Object.keys(this.citiesByState);
    return of(states);
  }

  getCurrencies(): Observable<string[]> {
    return of(this.currencies);
  }
  
  getCities(state: string): Observable<string[]> {
    const cities = this.citiesByState[state];
    if (!cities) {
      throw new Error(`No cities found for state: ${state}`);
    }
    return of(cities);
  }
}
