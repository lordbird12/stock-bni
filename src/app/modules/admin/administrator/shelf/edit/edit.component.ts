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
import { EditFloorsComponent } from '../edit-floors/edit-floors.component';
import { NewFloorsComponent } from '../new-floors/new-floors.component';
import { EditChanelComponent } from '../edit-chanel/edit-chanel.component';
import { ViewProductComponent } from '../view-product/view-product.component';
import { NewChanelComponent } from '../new-chanel/new-chanel.component';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';

@Component({
    selector: 'edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    animations: fuseAnimations,
})
export class EditComponent implements OnInit, AfterViewInit, OnDestroy {

    public dtOptions: DataTables.Settings = {};
    public dataRow: any[];

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    files: File[] = [];
    files2: File[] = [];

    blogData: any = [];
    statusData: any = [
        { value: true, name: 'เปิดใช้งาน' },
        { value: false, name: 'ปิดใช้งาน' },
    ];

    notifyData: any = [
        { value: true, name: 'เปิดแจ้งเตือน' },
        { value: false, name: 'ไม่แจ้งเตือน' },
    ];

    Id: string;
    itemData: any = [];

    formData: FormGroup;
    flashErrorMessage: string;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    selectedProduct: any | null = null;
    filterForm: FormGroup;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    env_path = environment.API_URL;
    url_path: string;
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
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService
    ) {
        this.formData = this._formBuilder.group({
            id: ['', Validators.required],
            name: '',
            detail: '',
            image: '',
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // this.getBlogCategory();
        this.Id = this._activatedRoute.snapshot.paramMap.get('id');
        this._Service.getById(this.Id).subscribe((resp: any) => {
            this.itemData = resp.data;
            this.dataRow = resp.data.floors;
            console.log('resp', this.itemData.image);
            this.formData.patchValue({
                id: this.itemData.id,
                name: this.itemData.name,
                detail: this.itemData.detail,
                image: ''
            });
            this.url_path = this.itemData.image
            this._changeDetectorRef.detectChanges();
            for (let i = 0; i < this.dataRow.length; i++) {
                for (let j = 0; j < this.dataRow[i].channels.length; j++) {
                    this.dataRow[i].channels.isExpanded = false;
                    console.log()
                }
            }
        });
    }

    // getBlogCategory(): void {
    //     this._Service.getCategory().subscribe((resp) => {
    //         this.blogData = resp.data;
    //     });
    // }
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

    update(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;
        const confirmation = this._fuseConfirmationService.open({
            title: 'แก้ไขรายการ',
            message: 'คุณต้องการแก้ไขรายการใช่หรือไม่ ',
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
                    formData.append(key, value);
                });
                // Disable the form
                this._Service.update(formData).subscribe({
                    next: (resp: any) => {
                        this._router
                            .navigateByUrl('shelf/list')
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
                        // console.log(err.error.message)
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
        this.formData.patchValue({
            image: this.files[0],
        });
    }

    onRemove(event) {
        this.files.splice(this.files.indexOf(event), 1);
        this.formData.patchValue({
            image: '',
        });
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

    editData(data: any): void {
        this._matDialog
            .open(EditFloorsComponent, {
                autoFocus: false,
                data: {
                    data
                },
            })
            .afterClosed()
            .subscribe(() => {
                this._Service.getById(this.Id).subscribe((resp: any) => {
                    this.itemData = resp.data;
                    this.dataRow = resp.data.floors;
                    console.log('resp', this.dataRow);
                    this.formData.patchValue({
                        id: this.itemData.id,
                        name: this.itemData.name,
                        detail: this.itemData.detail,
                        image: this.env_path + this.itemData.image,
                    });
                    this.url_path = this.itemData.image
                    this._changeDetectorRef.detectChanges();
                });
            });
    }
    editChanel(data: any): void {
        this._matDialog
            .open(EditChanelComponent, {
                autoFocus: false,
                data: {
                    data
                },
            })
            .afterClosed()
            .subscribe(() => {
                this._Service.getById(this.Id).subscribe((resp: any) => {
                    this.itemData = resp.data;
                    this.dataRow = resp.data.floors;
                    console.log('resp', this.dataRow);
                    this.formData.patchValue({
                        id: this.itemData.id,
                        name: this.itemData.name,
                        detail: this.itemData.detail,
                        image: this.env_path + this.itemData.image,
                    });
                    this.url_path = this.itemData.image
                    this._changeDetectorRef.detectChanges();
                });
            });
    }
    newFloor(data: any): void {
        this._matDialog
            .open(NewFloorsComponent, {
                autoFocus: false,
                data: {
                    data
                },
            })
            .afterClosed()
            .subscribe(() => {
                this._Service.getById(this.Id).subscribe((resp: any) => {
                    this.itemData = resp.data;
                    this.dataRow = resp.data.floors;
                    console.log('resp', this.dataRow);
                    this.formData.patchValue({
                        id: this.itemData.id,
                        name: this.itemData.name,
                        detail: this.itemData.detail,
                        image: this.itemData.image,
                    });
                    this.url_path =  this.itemData.image
                    this._changeDetectorRef.detectChanges();
                });
            });
    }
    newChanel(data: any): void {
        console.log(data)

        this._matDialog
            .open(NewChanelComponent, {
                autoFocus: false,
                data: {
                    data
                },
            })
            .afterClosed()
            .subscribe(() => {
                this._Service.getById(this.Id).subscribe((resp: any) => {
                    this.itemData = resp.data;
                    this.dataRow = resp.data.floors;
                    console.log('resp', this.dataRow);
                    this.formData.patchValue({
                        id: this.itemData.id,
                        name: this.itemData.name,
                        detail: this.itemData.detail,
                        image: this.itemData.image,
                    });
                    this.url_path =  this.itemData.image
                    this._changeDetectorRef.detectChanges();
                });
            });
    }
    viewProduct(data: any): void {
        this._matDialog
            .open(ViewProductComponent, {
                autoFocus: false,
                data: {
                    data
                },
            })
            .afterClosed()
            .subscribe(() => {
                this._Service.getById(this.Id).subscribe((resp: any) => {
                    this.itemData = resp.data;
                    this.dataRow = resp.data.floors;
                    console.log('resp', this.dataRow);
                    this.formData.patchValue({
                        id: this.itemData.id,
                        name: this.itemData.name,
                        detail: this.itemData.detail,
                        image: this.itemData.image,
                    });
                    this.url_path = this.itemData.image
                    this._changeDetectorRef.detectChanges();
                });
            });
    }


    expandFunction(): void {
        console.log(this.dataRow[0].channels)
        for (let i = 0; i < this.dataRow.length; i++) {
          if (this.dataRow[i].channels.isExpanded != true) {
            this.dataRow[i].channels.isExpanded = true;
          } else {
            this.dataRow[i].channels.isExpanded = false;
          }
        }
      }
}
