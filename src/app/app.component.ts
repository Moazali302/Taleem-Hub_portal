import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from './core/services/loader.service';
import { LoaderComponent } from './shared/components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent],
  template: `
    <router-outlet></router-outlet>
    @if (loaderService.isLoading()) {
      <app-loader />
    }
  `,
})
export class AppComponent {
  protected readonly loaderService = inject(LoaderService);
}
