import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'classic-layout',
    templateUrl: './classic.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ClassicLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: Navigation;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                // console.log(navigation);
                // const user = JSON.parse(localStorage.getItem('user')) || null;

                // // Store the access token in the local storage
                // if (user.role.type == 'marketing') {
                //     AuthService._marketingRole = false;
                //     this.navigation = navigation;
                // } else if (user.role.type == 'supplier') {
                //     AuthService._supplierRole = false;
                //     this.navigation = navigation;
                // } else if (user.role.type == 'store') {
                //     AuthService._storeRole = false;
                //     this.navigation = navigation;
                // } else if (user.role.type == '2nd_approve') {
                //     AuthService._2nd_approver = false;
                //     this.navigation = navigation;
                // } else if (user.role.type == 'authenticated' && user.admin_as == 'marketing') {
                //     AuthService._adminMarketing = false;
                //     this.navigation = navigation;
                // } else if (user.role.type == 'authenticated' && user.admin_as == 'store') {
                //     AuthService._adminStore = false;
                //     this.navigation = navigation;
                // } else if (user.role.type == 'authenticated' && user.admin_as == 'supplier') {
                //     AuthService._adminSupplier = false;
                //     this.navigation = navigation;
                // } else if (user.role.type == 'authenticated' && user.admin_as == 'all') {
                //     AuthService._admin = false;
                //     this.navigation = navigation;
                // }

                this.navigation = navigation;

            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}
