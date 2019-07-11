import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { CommonService } from '../../common.service';
import { Router } from '../../../../node_modules/@angular/router';
import { map, catchError } from 'rxjs/operators';
import { UserService } from '../../shared/services/user.service';
import { StringMutationService } from '../../shared/services/stringMutation.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    animations: [routerTransition()]
})
export class UsersComponent implements OnInit {
    constructor(private newService: CommonService, private _router: Router, private userService: UserService, private stringMutationService: StringMutationService ) { }
    errData;
    userData;
    tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    userPermission = this.tokenInfo.userPermission;
    alert = { type: '', message: '' };
    timeout;
    showAlert = false;
    sortedData;
    sort = { active: '', isAsc: true };

    ngOnInit() {
        if (this.userPermission != "admin") {
            if (this.userPermission != "Logistics specialist") {
                this._router.navigate(['/access-denied']);
            } else {
                this.newService.getUsersForCompany([{ client: this.tokenInfo.userCompany }]).subscribe(data => this.userData = data, err => this.errData = err);
            }
        } else {
            this.newService.getUsers().subscribe(data => this.userData = data, err => this.errData = err);
        }
    }

    redirectManageBoats(username) {
        this._router.navigate(['usermanagement', { username: username }]);
    }

    resetPassword(id) {
        this.newService.resetPassword({ _id: id }).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
    }

    setActive(id) {
        this.newService.setActive({ _id: id }).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
    }

    setInactive(id) {
        this.newService.setInactive({ _id: id }).pipe(
            map(
                (res) => {
                    this.alert.type = 'success';
                    this.alert.message = res.data;
                }
            ),
            catchError(error => {
                this.alert.type = 'danger';
                this.alert.message = error;
                throw error;
            })
        ).subscribe(_ => {
            clearTimeout(this.timeout);
            this.showAlert = true;
            this.timeout = setTimeout(() => {
                this.showAlert = false;
            }, 7000);
        });
    }

    sortData(sort) {
        this.sort = sort;
        const data = this.userData.slice();
        if (!sort.active || sort.isAsc === '') {
            this.sortedData = data;
            return;
        }

        this.sortedData = data.sort((a, b) => {
            const isAsc = sort.isAsc;
            switch (sort.active) {
                case 'permissions': return this.stringMutationService.compare(a.permissions, b.permissions, isAsc);
                case 'client': return this.stringMutationService.compare(a.client, b.client, isAsc);
                case 'username': return this.stringMutationService.compare(a.username, b.username, isAsc);
                default: return 0;
            }
        });
        this.userData = this.sortedData;
    }
}
