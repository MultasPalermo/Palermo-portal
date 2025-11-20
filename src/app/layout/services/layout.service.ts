import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LayoutState {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
}

export interface LayoutConfig {
  menuMode: 'static' | 'overlay';
  darkTheme: boolean;
  primary: string;
  surface: string;
  preset: string;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private configSignal = signal<LayoutConfig>({
    menuMode: 'static',
    darkTheme: false,
    primary: 'emerald',
    surface: 'slate',
    preset: 'Aura'
  });

  private stateSubject = new BehaviorSubject<LayoutState>({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    staticMenuMobileActive: false,
    menuHoverActive: false
  });

  private overlayOpenSubject = new BehaviorSubject<any>(null);

  layoutConfig = this.configSignal;

  layoutState() {
    return this.stateSubject.value;
  }

  get overlayOpen$() {
    return this.overlayOpenSubject.asObservable();
  }

  updateState(updates: Partial<LayoutState>) {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...updates });
  }



  toggleMenu() {
  const state = this.layoutState();

  if (this.layoutConfig().menuMode === 'overlay') {
      this.updateState({ overlayMenuActive: !state.overlayMenuActive });
  } else {
      this.updateState({ staticMenuDesktopInactive: !state.staticMenuDesktopInactive });
  }
}


}
