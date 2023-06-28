import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    styles: [
        /* language=SCSS */
        `
            @screen md {
                .max-w-6xl {
                    width: 50% !important;
                }

                .light {
                    background: #2a2e45 !important;
                }
            }

            @screen lg {
                .max-w-6xl {
                    width: 50% !important;
                }

                .light {
                    background: #2a2e45 !important;
                }
            }

            .fuse-mat-button-large {
                border-radius: 5px !important;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: FormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            // identifier: ['', Validators.required],
            username: ['admin', Validators.required],
            password: ['admin', Validators.required],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe({
            complete: () => {
                // console.log('1')
                // let redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                // if (redirectURL === '/signed-in-redirect') {
                let redirectURL = 'shelf/list';
                // }
                this._router.navigateByUrl(redirectURL);
            },
            error: (error: HttpErrorResponse) => {
                // console.log('2')

                this.signInForm.enable();
                this.signInNgForm.resetForm();

                let errorMsg = '';

                switch (error.error['error']['message']) {
                    case 'Invalid identifier or password':
                        errorMsg = 'Invalid username or password';
                        break;

                    default:
                        errorMsg = error.error['error']['message'];
                        break;
                }

                this.alert = {
                    type: 'error',
                    message: errorMsg,
                };
                this.showAlert = true;
            },
        });
    }
}
