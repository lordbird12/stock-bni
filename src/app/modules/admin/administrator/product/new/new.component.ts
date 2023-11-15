import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
    debounceTime,
    map,
    merge,
    Observable,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { sortBy, startCase } from 'lodash-es';
import { AssetType, Pagination } from '../page.types';
import { Service } from '../page.service';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';

@Component({
    selector: 'new',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.scss'],

    animations: fuseAnimations,
})
export class NewComponent implements OnInit, AfterViewInit, OnDestroy {
    files: File[] = [];
    files2: File[] = [];

    statusData: any = [
        { value: true, name: 'เปิดใช้งาน' },
        { value: false, name: 'ปิดใช้งาน' },
    ];

    notifyData: any = [
        { value: true, name: 'เปิดแจ้งเตือน' },
        { value: false, name: 'ไม่แจ้งเตือน' },
    ];

    formData: FormGroup;
    formData2: FormGroup;

    max: boolean = false;

    flashErrorMessage: string;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    selectedProduct: any | null = null;
    filterForm: FormGroup;
    tagsEditMode: boolean = false;
    env_path = environment.API_URL;

    item1Data: any = [];
    item2Data: any = [];

    itemMaxData: any = [];
    blogData: any = [];
    shelfData: any = [];
    shelfId: any;
    floorData: any = [];
    chanelData: any = [];

    // me: any | null;
    // get roleType(): string {
    //     return 'marketing';
    // }

    supplierId: string | null;
    pagination: Pagination;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _Service: Service,
        private _router: Router) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    async ngOnInit(): Promise<void> {
        this.formData = this._formBuilder.group({
            category_product_id: '',
            name: '',
            detail: '',
            qty: '',
            client_code: '',
            code: '',
            shelve_id: '',
            floor_id: '',
            channel_id: '',
            year: '',
            images: [],
        });
        this.GetCate();
        this.GetShelf();
    }

    onChangeShelf(event: any) {
        this.shelfId = event
        this.GetFloor(event)
    }
    onChangeFloor(event: any) {

        this.GetChanel(this.shelfId, event)
    }

    GetCate(): void {
        this._Service.getCategoryProduct().subscribe((resp) => {
            this.blogData = resp.data;
        });
    }

    GetShelf(): void {
        this._Service.getShelf().subscribe((resp) => {
            this.shelfData = resp.data;
        });
    }

    GetFloor(id: any): void {
        this._Service.getFloor(id).subscribe((resp) => {
            this.floorData = resp.data;
        });
    }

    GetChanel(id: any, f_id: any): void {
        this._Service.getChanel(id, f_id).subscribe((resp) => {
            this.chanelData = resp.data;
        });
    }
    discard(): void { }

    /**
     * After view init
     */
    ngAfterViewInit(): void { }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
    }

    getItem(): void {
        this._Service.getCategory().subscribe((resp) => {
            this.item1Data = resp.data;
        });
    }

    getItem1(): void {
        this._Service.getCategory1().subscribe((resp) => {
            this.item1Data = resp.data;
        });
    }

    getItem2(): void {
        this._Service.getCategory1().subscribe((resp) => {
            this.item2Data = resp.data;
        });
    }

    getItem3(): void {
        this._Service.getCategory3().subscribe((resp) => {
            this.itemMaxData = resp.data.sizes;
        });
    }

    create(): void {
        console.log(this.formData.value.image)

        this.flashMessage = null;
        this.flashErrorMessage = null;

        const confirmation = this._fuseConfirmationService.open({
            title: 'สร้างรายการใหม่',
            message: 'คุณต้องการสร้างรายการใหม่ใช่หรือไม่ ',
            icon: {
                show: false,
                name: 'heroicons_outline:exclamation',
                color: 'warning',
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'ยืนยัน',
                    color: 'primary',
                },
                cancel: {
                    show: true,
                    label: 'ยกเลิก',
                },
            },
            dismissible: true,
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                let formValue = this.formData.value;
                const formData = new FormData();

                Object.entries(formValue).forEach(([key, value]: any[]) => {
                    if (key != 'images') {
                        formData.append(key, value);
                    }
                });
                for (var i = 0; i < this.files.length; i++) {
                    formData.append('images[]', this.files[i]);
                }

                for (var i = 0; i < this.files2.length; i++) {
                    formData.append('images[]', this.files2[i]);
                }

                this._Service.create(formData).subscribe({
                    next: () => {
                        this._router
                            .navigateByUrl('product/list')
                            .then(() => { });
                    },
                    error: (err: any) => {
                        this._fuseConfirmationService.open({
                            title: 'กรุณาระบุข้อมูล',
                            message: err.error.message,
                            icon: {
                                show: true,
                                name: 'heroicons_outline:exclamation',
                                color: 'warning',
                            },
                            actions: {
                                confirm: {
                                    show: false,
                                    label: 'ยืนยัน',
                                    color: 'primary',
                                },
                                cancel: {
                                    show: false,
                                    label: 'ยกเลิก',
                                },
                            },
                            dismissible: true,
                        });
                        // console.log(err.error.message);
                    },
                });
            }
        });
    }

    onSelect(event) {
        this.files.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);

    }

    onRemove(event) {
        this.files.splice(this.files.indexOf(event), 1);
        this.formData.patchValue({
            image: '',
        });
    }

    onSelect2(event) {
        this.files2.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
    }

    onRemove2(event) {
        this.files2.splice(this.files2.indexOf(event), 1);
    }

    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {
            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }
}
