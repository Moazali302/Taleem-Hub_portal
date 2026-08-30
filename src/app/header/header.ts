import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, LanguageOption } from '../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input({ required: true }) currentUser!: User;
  @Input() languages: LanguageOption[] = [{ code: 'en', label: 'English' }];
  @Input() activeLanguage = 'en';
  @Input() searchPlaceholder = 'Search...';

  /** Set to true on pages that need the search input; hidden by default to match this layout */
  @Input() showSearch = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() languageChange = new EventEmitter<string>();

  isLanguageMenuOpen = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  onSearchInput(value: string): void {
    this.searchChange.emit(value);
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  selectLanguage(language: LanguageOption): void {
    this.isLanguageMenuOpen = false;
    this.languageChange.emit(language.code);
  }

  get activeLanguageLabel(): string {
    return this.languages.find((lang) => lang.code === this.activeLanguage)?.label ?? '';
  }

  // @HostListener('document:click', ['$event.target'])
  // onDocumentClick(target: HTMLElement): void {
  //   if (this.isLanguageMenuOpen && !this.elementRef.nativeElement.contains(target)) {
  //     this.isLanguageMenuOpen = false;
  //   }
  // }
}