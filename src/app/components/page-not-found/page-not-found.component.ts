import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <div class="text-8xl font-bold text-gray-200 mb-4">404</div>
      <h1 class="text-4xl font-semibold text-gray-800 mb-4">Page Not Found</h1>
      <p class="text-lg text-gray-600 max-w-2xl mb-8">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <a 
        routerLink="/" 
        class="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Back to Home
      </a>
    </div>
  `
})
export class PageNotFoundComponent {}
