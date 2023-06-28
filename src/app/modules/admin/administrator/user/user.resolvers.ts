import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
// import { UserService } from 'app/modules/admin/marketing/brief-plan/brief-plan.service';
import { AssetCategory } from 'app/shared/asset-category';
import { UserService, } from './user.service';
import { AssetType, Chat, Division, UserPagination, UserProduct, UserProductDetail, Store, StoreType } from './user.types';
// import { UserDetail } from '../user/user.types';

@Injectable({
    providedIn: 'root'
})
export class ChatChatsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        // private _Service: UserService,
        private _Service: UserService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Chat[]> | any {
        return this._Service.getChatById('f73a5a34-a723-4b35-8439-5289e0164c83')
            .pipe(
                // Error here means the requested chat is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}

@Injectable({
    providedIn: 'root'
})
export class ChatChatResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _Service: UserService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Chat> {
        return this._Service.getChatById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested chat is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}


@Injectable({
    providedIn: 'root'
})
export class PermissionProductResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _Service: UserService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserProductDetail> {
        return this._Service.getProductById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested product is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}

@Injectable({
    providedIn: 'root'
})
export class PermissionProductsOsmResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _Service: UserService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ meta: UserPagination; data: UserProduct[] }> {
        // return this._Service.getProductsOsm();
        return;
    }
}

@Injectable({
    providedIn: 'root'
})
export class PermissionProductsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _Service: UserService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ meta: UserPagination; data: UserProduct[] }> {
        return;
    }
}

@Injectable({
    providedIn: 'root'
})


@Injectable({
    providedIn: 'root'
})



@Injectable({
    providedIn: 'root'
})
export class AssetTypeResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _Service: UserService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AssetType[]> {
        return this._Service.getAssetType();
    }
}


@Injectable({
    providedIn: 'root'
})
export class SeasonResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _Service: UserService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._Service.getSeason();
    }
}



@Injectable({
    providedIn: 'root'
})
export class StoreTypeResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _Service: UserService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<StoreType[]> {
        return this._Service.getStoreType();
    }
}


@Injectable({
    providedIn: 'root'
})
export class StoreResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _Service: UserService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Store[]> {
        return this._Service.getStore();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DivisionResolver implements Resolve<any>
{
    constructor(private _Service: UserService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Division[]> {
        return this._Service.getDivision();
    }
}

@Injectable({
    providedIn: 'root'
})
export class AssetCategoryResolver implements Resolve<any>
{
    constructor(private _Service: UserService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AssetCategory[]> {
        return this._Service.getAssetCategory();
    }
}

@Injectable({
    providedIn: 'root'
})
export class Permission2ndResolver implements Resolve<any>
{
    user: any | null;

    constructor(private _Service: UserService) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ meta: UserPagination; data: UserProduct[] }> {

        this.user = JSON.parse(localStorage.getItem('user')) || null;

        return this._Service.getProductsND(
            0,
            10,
            'updatedAt',
            'desc',
            null,
            null,
            null,
            this.user.id,
        );
    }
}
