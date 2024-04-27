import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  invoiceForm!: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
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

  // convenience getter for easy access to form fields
  get f() { return this.invoiceForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.invoiceForm.invalid) {
        return;
    }

    // display form values on success
    alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.invoiceForm.value, null, 4));
  }

  onReset() {
    this.submitted = false;
    this.invoiceForm.reset();
  }
}
