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
    startWith,
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
import moment from 'moment';

@Component({
    selector: 'edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    animations: fuseAnimations,
})
export class EditComponent implements OnInit, AfterViewInit, OnDestroy {
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
    formSave: FormGroup;
    formData: FormGroup;
    formDataIron: FormGroup;
    formDataCleanIron: FormGroup;
    formDataCompression: FormGroup;
    flashErrorMessage: string;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    filterForm: FormGroup;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    env_path = environment.API_URL;

    // me: any | null;
    // get roleType(): string {
    //     return 'marketing';
    // }

    supplierId: string | null;
    pagination: Pagination;
    shelfData: any = [];
    shelfId: any;
    floorData: any = [];
    chanelData: any = [];
    userData: any = [];
    customerData: any = [];
    productData: any[] = [];
    status: any[] = [
        'เปิดใบสั่งงาน',
        'แผนกปั้มเหล็ก',
        'แผนกล้างเหล็ก+ยิงทราย',
        'แผนกอัดชิ้นงาน',
        'แผนกQC',
        'รอส่ง',
        'จัดส่งสำเร็จ',
    ];

    ProductControl = new FormControl('');
    ClientControl = new FormControl('');

    filteredOptionsProduct: Observable<string[]>;
    filteredOptionsClient: Observable<string[]>;

    selectedProduct: string = '';
    selectedClient: string = '';

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
            id: '',
            date: '',
            product_id: '',
            client_id: '',
            user_id: '',
            year: '',
            remark: '',
            name: '',
            qty: '',
            shelf:'',
            floor:'',
            channel:'',
            images: [],
            status: '',
        });

        this.formDataIron = this._formBuilder.group({
            order_id: '',
            date: '',
            order: '',
            client: '',
            qty: '',
            iron_use: '',
            pad_iron: '',
            pum: '',
            owner: '',
        });

        this.formDataCleanIron = this._formBuilder.group({
            order_id: '',
            yod_pum_dai: '',
            yod_nub_dai: '',
            owner: '',
        });

        this.formDataCompression = this._formBuilder.group({
            order_id: '',
            machine: '',
            yang_1: '',
            yang_2: '',
            hot_1: '',
            hot_2: '',
            time: '',
            qty: '',
            weight: '',
            wang_yang_1: '',
            wang_yang_2: '',
            wang_yang_3: '',
            wang_yang_4: '',
            wang_yang_5: '',
            wang_yang_6: '',
            wang_yang_7: '',
            wang_yang_8: '',
            wang_yang_9: '',
            wang_yang_10: '',
            wang_son_1: '',
            wang_son_2: '',
            wang_son_3: '',
            wang_son_4: '',
            wang_son_5: '',
            wang_son_6: '',
            wang_son_7: '',
            wang_son_8: '',
            wang_son_9: '',
            wang_son_10: '',
            lock_roll: '',
        });

        this.formSave = this._formBuilder.group({
            id: '',
            order_id: '',
            date: '',
            print_use: '',
            qty: '',
            good: '',
            fail: '',
            employee: '',
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.Id = this._activatedRoute.snapshot.paramMap.get('id');

        this.GetCustomer();
        this.GetProduct();
        this.GetUser();
        this.reload();

        this.filteredOptionsProduct = this.ProductControl.valueChanges.pipe(
            startWith(''),
            map((value) => this._filterProduct(value || ''))
        );

        this.filteredOptionsClient = this.ClientControl.valueChanges.pipe(
            startWith(''),
            map((value) => this._filterClient(value || ''))
        );

        // this._changeDetectorRef.detectChanges();
    }

    displayProduct(subject) {
        if (!subject) return '';
        let index = this.productData.findIndex(
            (state) => state.id === parseInt(subject)
        );
        return this.productData[index].name;
    }

    displayClient(subject) {
        if (!subject) return '';
        let index = this.customerData.findIndex(
            (state) => state.id === parseInt(subject)
        );
        return this.customerData[index].name;
    }

    private _filterProduct(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.productData.filter((option) =>
            option.name.toLowerCase().includes(filterValue)
        );
    }

    private _filterClient(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.customerData.filter((option) =>
            option.name.toLowerCase().includes(filterValue)
        );
    }

    reload(): void {
        this._Service.getById(this.Id).subscribe((resp: any) => {
            this.itemData = resp.data;
            this.formData.patchValue({
                id: this.Id,
                product_id:
                    this.itemData.product_id != null
                        ? +this.itemData.product_id
                        : null,
                client_id:
                    this.itemData.client_id != null
                        ? +this.itemData.client_id
                        : null,
                user_id:
                    this.itemData.user_id != null
                        ? +this.itemData.user_id
                        : null,
                year: this.itemData.year != null ? this.itemData.year : '-',
                remark:
                    this.itemData.remark != null ? this.itemData.remark : '-',
                status:
                    this.itemData.status != null ? this.itemData.status : null,
                date: this.itemData.date != null ? this.itemData.date : null,
                name: this.itemData.name != null ? this.itemData.name : null,
                qty: this.itemData.qty != null ? this.itemData.qty : null,
                shelf: this.itemData.shelf != null ? this.itemData.shelf.name : null,
                floor: this.itemData.floor != null ? this.itemData.floor.name : null,
                channel: this.itemData.channel != null ? this.itemData.channel.name : null,
            });
            this.formDataIron.patchValue({
                ...this.itemData.iron,
            });
            this.formDataCleanIron.patchValue({
                ...this.itemData.clear_iron,
            });
            this.formDataCompression.patchValue({
                ...this.itemData.aud_item,
            });
            this.formSave.patchValue({
                date: this.itemData.date,
            });

            setTimeout(() => {
                this.ProductControl.setValue(this.itemData.product_id);
                this.ClientControl.setValue(this.itemData.client_id);
                this._changeDetectorRef.detectChanges();
            },2000);
            this._changeDetectorRef.detectChanges();
        });
    }

    GetCustomer(): void {
        this._Service.getCustomer().subscribe((resp) => {
            this.customerData = resp.data;
        });
    }
    GetUser(): void {
        this._Service.getUser().subscribe((resp) => {
            this.userData = resp.data;
        });
    }

    GetProduct(): void {
        this._Service.getProduct().subscribe((resp) => {
            this.productData = resp.data;
        });
    }

    onChangeShelf(event: any) {
        this.shelfId = event;
        this.GetFloor(event);
    }
    onChangeFloor(event: any) {
        this.GetChanel(this.shelfId, event);
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

    /**
     * After view init
     */
    ngAfterViewInit(): void {}

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
    }

    update(): void {
  
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
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
                formValue.date = moment(formValue.date).format('YYYY-MM-DD');
                formValue.product_id = this.ProductControl.value;
                formValue.client_id = this.ClientControl.value;
                this.formData.patchValue({
                    images: [],
                });
                const formData = new FormData();
                Object.entries(formValue).forEach(([key, value]: any[]) => {
                    formData.append(key, value);
                });

                this._Service.update(formData).subscribe({
                    next: (resp: any) => {
                        this._router.navigateByUrl('order/list').then(() => {});
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
    updateIron(): void {
        this.formDataIron.patchValue({
            order_id: this.Id,
        });
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
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
                let formValue = this.formDataIron.value;
                // Disable the form
                this._Service.updateIron(formValue).subscribe({
                    next: (resp: any) => {
                        this._router.navigateByUrl('order/list').then(() => {});
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
    updateformDataCleanIron(): void {
        this.formDataCleanIron.patchValue({
            order_id: this.Id,
        });
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
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
                let formValue = this.formDataCleanIron.value;
                // Disable the form
                this._Service.updateClearIron(formValue).subscribe({
                    next: (resp: any) => {
                        this._router.navigateByUrl('order/list').then(() => {});
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
    updateformAudItem(): void {
        this.formDataCompression.patchValue({
            order_id: this.Id,
        });
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
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
                let formValue = this.formDataCompression.value;
                // Disable the form
                this._Service.updateAudItem(formValue).subscribe({
                    next: (resp: any) => {
                        this._router.navigateByUrl('order/list').then(() => {});
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

    updateformDataSave(): void {
        this.formSave.patchValue({
            order_id: this.Id,
        });
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
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
                let formValue = this.formSave.value;
                formValue.date = moment(formValue.date).format('YYYY-MM-DD');
                // Disable the form

                this._Service.updateSave(formValue).subscribe({
                    next: (resp: any) => {
                        this.reload();
                        this.formSave.reset();
                        this._changeDetectorRef.detectChanges();
                        window.scrollTo(0, document.body.scrollHeight);
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

    editClear(item: any): void {
        console.log(item);
        this.formSave.patchValue({
            id: item.id,
            order_id: item.order_id,
            date: item.date,
            print_use: item.print_use,
            qty: item.qty,
            good: item.good,
            fail: item.fail,
            employee: item.employee,
        });

        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
    }
}
