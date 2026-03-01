import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: '[appPhoneFormat]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PhoneFormatDirective),
    multi: true
  }]
})
export class PhoneFormatDirective implements ControlValueAccessor {

  private regex: RegExp = /(\d{3})[\.\-\s\)]*(\d{3})[\.\-\s]*(\d{4})/g;
  private format: string = '$1-$2-$3';
  private onChange: (value: string) => void;
  private onTouched: () => void;

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatPhone(input.value);
    this.el.nativeElement.value = formatted;
    this.onChange(formatted);
  }

  private formatPhone(value: string): string {
    // Remove all non-numeric characters
    const cleaned = value.replace(/[^\d]/g, '');
    // Format the cleaned value
    return cleaned.replace(this.regex, this.format);
  }

  writeValue(value: any): void {
    this.el.nativeElement.value = value ? this.formatPhone(value) : '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }
}
