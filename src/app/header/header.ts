import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {User, LanguageOption } from '../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  /** Currently logged-in user, passed from the layout/auth state */
  @Input({ required: true }) currentUser!: User;

  /** Available languages for the language switcher */
  @Input() languages: LanguageOption[] = [{ code: 'en', label: 'English' }];

  /** Currently active language code */
  @Input() activeLanguage = 'en';

  /** Placeholder text for the search input */
  @Input() searchPlaceholder = 'Search';

  /** Emits the search term as the user types (debouncing handled by consumer if needed) */
  @Output() searchChange = new EventEmitter<string>();

  /** Emits the selected language code when changed */
  @Output() languageChange = new EventEmitter<string>();

  isLanguageMenuOpen = false;

  onSearchInput(value: string): void {
    this.searchChange.emit(value);
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  selectLanguage(language: LanguageOption): void {
    this.activeLanguage = language.code;
    this.isLanguageMenuOpen = false;
    this.languageChange.emit(language.code);
  }

  get activeLanguageLabel(): string {
    return this.languages.find((lang) => lang.code === this.activeLanguage)?.label ?? '';
  }
}