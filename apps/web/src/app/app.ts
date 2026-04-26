import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  gridOutline, searchOutline, briefcaseOutline, peopleOutline,
  documentTextOutline, constructOutline, calculatorOutline,
  chatbubblesOutline, mailOutline, settingsOutline,
  search, home, chatbubbles, analytics, business,
  alertCircle, checkmarkCircle, addOutline, trashOutline,
  createOutline, chevronForwardOutline, menuOutline,
  arrowBackOutline,
} from 'ionicons/icons';

addIcons({
  'grid-outline': gridOutline,
  'search-outline': searchOutline,
  'briefcase-outline': briefcaseOutline,
  'people-outline': peopleOutline,
  'document-text-outline': documentTextOutline,
  'construct-outline': constructOutline,
  'calculator-outline': calculatorOutline,
  'chatbubbles-outline': chatbubblesOutline,
  'mail-outline': mailOutline,
  'settings-outline': settingsOutline,
  'search': search,
  'home': home,
  'chatbubbles': chatbubbles,
  'analytics': analytics,
  'business': business,
  'alert-circle': alertCircle,
  'checkmark-circle': checkmarkCircle,
  'add-outline': addOutline,
  'trash-outline': trashOutline,
  'create-outline': createOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'menu-outline': menuOutline,
  'arrow-back-outline': arrowBackOutline,
});

@Component({
  imports: [RouterModule, IonicModule],
  selector: 'r79-root',
  template: `
    <ion-app>
      <router-outlet></router-outlet>
    </ion-app>
  `,
  styles: [`:host { display: block; height: 100%; }`],
})
export class App {}
