import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {AuthService} from '../../auth/auth.service';
import {SettingsService} from '../../shared/services/settings-service';

@Component({
  selector: 'pricing',
  templateUrl: 'pricing.html',
  styleUrls: ['pricing.css']
})
export class PricingComponent {
  @Input() source: number = 0; // 0 - From Navbar (Default)
                               // 1 - From Settings Page
                               // 2 - From Pro Pages
                               // 3 - Build Wizard

  @Input() plan: number = null;
  @Input() nickname: string = null;
  @Input() quantity: number = null;

  private auth0Client: Auth0Client;

  period: number = 0;
  periodStrLong = ['quarterly', 'yearly']
  periodPlan = ['Quarterly', 'Yearly']
  planStr = ['Basic', 'Pro']

  streamSubscribe: number = 0;

  constructor(private router: Router,
              private authService: AuthService,
              private settingsService: SettingsService) {  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();
  }

  async planUpdate(type: number) { // Free / PRO
    const mode: number = 0; // User / Lab / Company / Department
    const period: number = this.period; // Monthly / Yearly

    this.streamSubscribe = 3;
    const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, null);

    if (type==0) {
      window.location.reload();
    } else {
      stripe.redirectToCheckout({
        sessionId: plan.id
      }).then(function (result) {
        this.router.navigate(result.success_url);
        this.streamSubscribe = 0;
      });
    }
  }

  async login() {
    await this.auth0Client.loginWithRedirect({
      redirect_uri: `${window.location.origin}/callback`,
      // appState: { target: 'build' }
    });
  }

  featuresBasicShort: string[] = [
    // 'For academics',
    'Beautiful personal academic profile',
    'Promote your lab',
    'Conduct lightweight lab research'
  ];

  featuresBasicIncludes: string[] = [
    'Build your academic profile',
    'Basic lab overview',
    'Basic labs comparison',
    '3 search filters',
    '1 saved search',
    'First 6 results per search',
    'Follow up to 50 labs',
    'Apply to labs jobs and manage your applications',
    'Make requests for lab services and manage your requests',
    'Support and chat'
    // Competitors data
    // Recent labs funding data
    // Recent labs collaborations data

    // Bulk export
    // API
    // Integrations
  ];

  featuresProShort: string[] = [
    // 'For academics',
    'Robust labs search tools',
    'Rich personalized labs alerts',
    'Conduct in-depth labs analyses',
  ];

  featuresProIncludes: string[] = [
    'Complete labs data',
    '25 search filters',
    '1,000 results per search',
    'Stay updated with up to 10,000 labs',
    'Export search results (up to 1,000 each time)',
    'Who watched your profile',
    'Priority support and chat'
    // Search results view customization
    // Search insights
    // Labs funding data
    // Labs collaborations data
    // Import lists to auto-find labs
    // Our special gurantee - 10K biology labs, 20K chemistry labs, etc
    // Send messages to members outside your network with InMail
    // Domain
    // Lab jobs insight: Rank yourself against other applicants
    // Your chances to get a lab position, see averages of other candidates,
  ];

  // Academic Research Tools
  // Results view customization
  // Activity-specific results view

  // Compare Tools:
  // Insights on curated lists
  // Charts on lab profiles
  // Profile layout customization
  // Import list of labs

  // Monitoring Tools
  // Saved lists
  // Shareable lists
  // Shareable searches
}
