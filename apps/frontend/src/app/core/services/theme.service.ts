import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { ApiService } from "./api.service";

export type Theme = "default" | "dark";

export interface ThemeConfig {
  name: string;
  displayName: string;
  description: string;
  cssClass: string;
}

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>("default");
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  currentTheme$ = this.currentThemeSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();

  private readonly themes: Record<Theme, ThemeConfig> = {
    default: {
      name: "default",
      displayName: "Default",
      description: "Clean and modern design with blue accents",
      cssClass: "theme-default",
    },
    dark: {
      name: "dark",
      displayName: "Dark",
      description: "Dark mode for comfortable reading",
      cssClass: "theme-dark",
    },
  };

  constructor(private apiService: ApiService) {}

  async waitForInitialization(): Promise<void> {
    return this.initializeTheme();
  }

  private async initializeTheme(): Promise<void> {
    this.isLoadingSubject.next(true);

    // HTML script applies default theme immediately
    // Set service state to match
    this.currentThemeSubject.next("default");

    try {
      // Fetch the admin-configured theme from the API
      const settings = await firstValueFrom(this.apiService.getBlogSettings());
      const theme = settings.theme as Theme;

      if (this.isValidTheme(theme)) {
        // Apply the admin-configured theme
        this.setTheme(theme, false);
      } else {
        // API doesn't have a valid theme, keep default
        // Admin needs to set a theme in blog settings
        console.warn(
          "No valid theme found in blog settings, using default theme"
        );
      }
    } catch (error) {
      // API failed, keep default theme
      console.warn(
        "Failed to load theme from API, using default theme:",
        error
      );
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  setTheme(theme: Theme, updateSettings: boolean = true): void {
    if (!this.isValidTheme(theme)) {
      console.warn(`Invalid theme: ${theme}. Using default theme.`);
      theme = "default";
    }

    const previousTheme = this.currentThemeSubject.value;
    this.currentThemeSubject.next(theme);

    this.applyThemeToDocument(theme, previousTheme);

    if (updateSettings) {
      this.updateBlogSettings(theme);
    }
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  getThemeConfig(theme: Theme): ThemeConfig | undefined {
    return this.themes[theme];
  }

  getAllThemes(): ThemeConfig[] {
    return Object.values(this.themes);
  }

  isValidTheme(theme: string): theme is Theme {
    return theme in this.themes;
  }

  private applyThemeToDocument(newTheme: Theme, previousTheme?: Theme): void {
    const documentElement = document.documentElement;

    if (previousTheme && this.themes[previousTheme]) {
      documentElement.classList.remove(this.themes[previousTheme].cssClass);
    }

    if (this.themes[newTheme]) {
      documentElement.classList.add(this.themes[newTheme].cssClass);
    }

    documentElement.setAttribute("data-theme", newTheme);
  }

  private updateBlogSettings(theme: Theme): void {
    this.apiService.getBlogSettings().subscribe({
      next: (currentSettings) => {
        const updatedSettings = {
          ...currentSettings,
          theme: theme,
        };

        this.apiService.updateBlogSettings(updatedSettings).subscribe({
          next: () => {
            console.log(`Theme updated to: ${theme}`);
          },
          error: (error) => {
            console.error("Failed to update theme in settings:", error);
          },
        });
      },
      error: (error) => {
        console.error(
          "Failed to get current settings for theme update:",
          error
        );
      },
    });
  }

  refreshTheme(): void {
    this.initializeTheme();
  }
}
