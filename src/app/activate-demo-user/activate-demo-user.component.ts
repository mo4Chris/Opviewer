import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/common.service';
import { AlertService } from '@app/supportModules/alert.service';
import { RouterService } from '@app/supportModules/router.service';

@Component({
  selector: 'app-activate-demo-user'
})
export class ActivateDemoUserComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    public routerService: RouterService,
    public alert: AlertService,
    private newService: CommonService,
  ) {
  }

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get("token");
    const isValidToken = this.validateTokenParameter(token);
    this.loginHandler(isValidToken, token)
  }

  private loginHandler(isValidToken: boolean, token: string | null): void {
    if(isValidToken) {
      this.activateDemoUser(token)
    } else {
      this.rerouteToLogin('danger', 'No token has been provided to activate a demo user')
    }
  }

  validateTokenParameter(token: string | null) : boolean {
   return token !== null;
  }

  activateDemoUser(token) {
    this.newService.activateDemoUser(token).subscribe(statusObject => {
      const status = statusObject.status;
      const statusMessage = statusObject.statusMessage;

      this.rerouteToLogin(status, statusMessage);
    });
  }

  //Kan beter in een algemeen document gestopt worden.
  rerouteToLogin(status, message: string): void {
    this.alert.sendAlert({ type: status, text: message });
    this.routerService.route(['login', {status: status, message: message}]);
  }
}


