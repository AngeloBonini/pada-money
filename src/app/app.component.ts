import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  invoiceForm: FormGroup;
  states: string[] = [];
  cities: string[] = [];
  currencies: string[] = []; // Ensure this is added to store currencies

  constructor(private formBuilder: FormBuilder, private dataService: DataService) {
    this.invoiceForm = this.formBuilder.group({
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{3})?$')]],
      invoicingCompany: ['', Validators.required],
      invoicingCompanyEmail: ['', [Validators.required, Validators.email]],
      amount: ['', Validators.required],
      currency: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStates();
    this.loadCurrencies();

    // Safe check for form control
    this.invoiceForm.get('state')?.valueChanges.subscribe(state => {
      this.loadCities(state);
    });
  }

  loadStates(): void {
    this.dataService.getStates().subscribe(states => {
      this.states = states;
    });
  }

  loadCities(state: string): void {
    this.dataService.getCities(state).subscribe(cities => {
      this.cities = cities;
    });
  }

  loadCurrencies(): void {
    this.dataService.getCurrencies().subscribe(currencies => {
      this.currencies = currencies;
    });
  }

  onSubmit(): void {
    if (this.invoiceForm.valid) {
      console.log(this.invoiceForm.value);
      // Handle the form submission, e.g., send data to the backend
    }
  }
}
