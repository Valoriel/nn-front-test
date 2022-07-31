import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as moment from 'moment';

export interface CurrencyInterface {
  CharCode: string;
  ID: string;
  Name: string;
  Nominal: number;
  NumCode: string;
  Previous: number;
  Value: number;
}

export interface ResponseInterface {
  Date: string;
  PreviousDate: string;
  PreviousURL: string;
  Timestamp: string;
  Valute: {
    [key: string]: CurrencyInterface;
  };
}

export interface HandledResponseInterface {
  date: string;
  values: CurrencyInterface[];
}

export interface LatestResponseInterface {
  date: string;
  rates: {
    [key: string]: number;
  }
}

@Injectable({
  providedIn: 'root'
})
export class CurrenciesService {
  private daily: HandledResponseInterface;

  constructor(
    private http: HttpClient,
  ) { }

  public getDailyCurrencies(): Observable<HandledResponseInterface> {
    return this.http.get('https://www.cbr-xml-daily.ru/daily_json.js')
    .pipe(
      map((response: ResponseInterface) => ({
        date: moment(response.Date).format('YYYY MM DD'),
        values: Object.values(response.Valute),
      })),
      tap(data => { this.daily = data; })
    );
  }

  public getLatest(): Observable<HandledResponseInterface> {
    return this.http.get('https://www.cbr-xml-daily.ru/latest.js')
      .pipe(
        map((response: LatestResponseInterface) => ({
          ...this.daily,
          date: moment(response.date).format('YYYY MM DD'),
          values: this.daily.values.map((currency: CurrencyInterface) => {
            const currentRate = Object.entries(response.rates).find(([key]) => key === currency.CharCode)[1];
            const newValue = currency.Nominal / currentRate;
            return {
              ...currency,
              Value: Number(newValue.toFixed(4)),
              Previous: currency.Value,
            };
          })
        }))
      );
  }
}
