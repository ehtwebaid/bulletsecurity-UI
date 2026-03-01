import { Directive,HostListener } from '@angular/core';

@Directive({
  selector: '[appDecimalinput]'
})
export class DecimalinputDirective {

  constructor() { }
  @HostListener('keypress', ['$event'])
  onInput(event: any) {
    const pattern = /^\d*\.?\d{0,2}$/g; // without ., for integer only
    let inputChar = String.fromCharCode(event.which ? event.which : event.keyCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
      return false;
    }
    return true;
  }
}
