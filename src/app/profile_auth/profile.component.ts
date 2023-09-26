import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileAuthComponent implements OnInit {
  profile: any;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.authService.profile.subscribe(profile => (this.profile = profile));
  }
}
