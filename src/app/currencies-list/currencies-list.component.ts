import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { CurrenciesService, CurrencyInterface } from '../services/currencies.service';

export interface PeriodicElement {
  charCode: string;
  value: number;
}


@Component({
  selector: 'app-currencies-list',
  templateUrl: './currencies-list.component.html',
  styleUrls: ['./currencies-list.component.scss']
})

export class CurrenciesListComponent implements OnInit {
  date: string;
  checked$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  refreshTimer;
  amount: number;

  constructor(
    private currenciesService: CurrenciesService
  ) { }

  ngOnInit(): void {
    this.currenciesService.getDailyCurrencies().subscribe((response) => {
      console.log(response);
      this.date = response.date;
      this.dataSource = new MatTableDataSource(response.values);
    });
    this.checked$.subscribe(checked => {
      if (checked) {
        console.log('checked', checked)
        this.refresh();
        this.refreshTimer = setInterval(() => this.refresh(), 10000);
        return;
      }
      clearInterval(this.refreshTimer);
    })
  }

  displayedColumns: (keyof CurrencyInterface | string)[] = ['CharCode','Value', 'Amount'];
  dataSource = new MatTableDataSource(null);

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  refresh() {
    this.currenciesService.getLatest()
      .subscribe(response => {
        console.log('Latest', response);
        this.date = response.date;
        this.dataSource = new MatTableDataSource(response.values);
      });
  }

  countAmount(item: CurrencyInterface) {
    const rate = item.Nominal / item.Value;
    return Number((this.amount * rate).toFixed(2));
  }
}
