import { Directive,ElementRef  } from '@angular/core';

@Directive({
  selector: '[appTreeDropdown]'
})
export class TreeDropdownDirective {

  constructor(private eleRef: ElementRef) { 
  eleRef.nativeElement.style.color = 'red';
  }

}
