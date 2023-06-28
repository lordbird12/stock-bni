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
            name: ['', Validators.required],
            position: [''],
            description: ['', Validators.required],
            phone: [''],
            email: [''],
            facebook: [''],
            line: [''],
            youtube: [''],
            ig: [''],
            rateing: [''],
            image: '',
            history_educate: this._formBuilder.array([]),
            history_traning: this._formBuilder.array([]),
            histroy_work: this._formBuilder.array([]),
            current_postion: this._formBuilder.array([]),
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
        this._Service.getById(this.Id).subscribe((resp: any) => {
            this.itemData = resp.data;
            this.formData.patchValue({
                id: this.itemData.id,
                name: this.itemData.name,
                position: this.itemData.position,
                description: this.itemData.description,
                phone: this.itemData.phone,
                email: this.itemData.email,
                facebook: this.itemData.facebook,
                line: this.itemData.line,
                youtube: this.itemData.youtube,
                ig: this.itemData.ig,
                rateing: this.itemData.rateing,
                image: '',
            });
            this.itemData.history_educate.forEach((element) => {
                this.add_history_educate_with_data(element);
            });

            this.itemData.history_traning.forEach((element) => {
                this.add_history_traning_with_data(element);
            });

            this.itemData.histroy_work.forEach((element) => {
                this.add_histroy_work_with_data(element);
            });

            this.itemData.current_postion.forEach((element) => {
                this.add_current_postion_with_data(element);
            });

            this._changeDetectorRef.detectChanges();
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

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'บันทึกช้อมูลวิทยากร',
            message: 'คุณต้องการบันทึกช้อมูลวิทยากรใช่หรือไม่ ',
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
                        this._fuseConfirmationService.open({
                            title: 'บันทึกข้อมูลสำเร็จ',
                            message: 'ข้อมูลวิทยากรถูกบันทึกสำเร็จ!',
                            icon: {
                                show: true,
                                name: 'heroicons_outline:success',
                                color: 'success',
                            },
                            actions: {
                                confirm: {
                                    show: true,
                                    label: 'ยืนยัน',
                                    color: 'primary',
                                },
                                cancel: {
                                    show: false,
                                    label: 'ยกเลิก',
                                },
                            },
                            dismissible: false,
                        });
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

    update2(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'บันทึกการศึกษา',
            message: 'คุณต้องการบันทึกข้อมูลการศึกษาใช่หรือไม่!',
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
                this.history_educate().value.forEach((element) => {
                    this._Service.update2(element).subscribe({
                        next: (resp: any) => {},
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
                });
                this._fuseConfirmationService.open({
                    title: 'บันทึกข้อมูลสำเร็จ',
                    message: 'ข้อมูลวิทยากรถูกบันทึกสำเร็จ!',
                    icon: {
                        show: true,
                        name: 'heroicons_outline:success',
                        color: 'success',
                    },
                    actions: {
                        confirm: {
                            show: true,
                            label: 'ยืนยัน',
                            color: 'primary',
                        },
                        cancel: {
                            show: false,
                            label: 'ยกเลิก',
                        },
                    },
                    dismissible: false,
                });
            }
        });
    }

    update3(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'บันทึกการศึกษา',
            message: 'คุณต้องการบันทึกข้อมูลการศึกษาใช่หรือไม่!',
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
                this.histroy_work().value.forEach((element) => {
                    this._Service.update3(element).subscribe({
                        next: (resp: any) => {},
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
                });
                this._fuseConfirmationService.open({
                    title: 'บันทึกข้อมูลสำเร็จ',
                    message: 'ข้อมูลวิทยากรถูกบันทึกสำเร็จ!',
                    icon: {
                        show: true,
                        name: 'heroicons_outline:success',
                        color: 'success',
                    },
                    actions: {
                        confirm: {
                            show: true,
                            label: 'ยืนยัน',
                            color: 'primary',
                        },
                        cancel: {
                            show: false,
                            label: 'ยกเลิก',
                        },
                    },
                    dismissible: false,
                });
            }
        });
    }

    update4(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'บันทึกการศึกษา',
            message: 'คุณต้องการบันทึกข้อมูลการศึกษาใช่หรือไม่!',
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
                this.history_traning().value.forEach((element) => {
                    this._Service.update4(element).subscribe({
                        next: (resp: any) => {},
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
                });
                this._fuseConfirmationService.open({
                    title: 'บันทึกข้อมูลสำเร็จ',
                    message: 'ข้อมูลวิทยากรถูกบันทึกสำเร็จ!',
                    icon: {
                        show: true,
                        name: 'heroicons_outline:success',
                        color: 'success',
                    },
                    actions: {
                        confirm: {
                            show: true,
                            label: 'ยืนยัน',
                            color: 'primary',
                        },
                        cancel: {
                            show: false,
                            label: 'ยกเลิก',
                        },
                    },
                    dismissible: false,
                });
            }
        });
    }

    update5(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'บันทึกรายการ',
            message: 'คุณต้องการบันทึกรายการใช่หรือไม่!',
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
                this.current_postion().value.forEach((element) => {
                    this._Service.update5(element).subscribe({
                        next: (resp: any) => {},
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
                });
                this._fuseConfirmationService.open({
                    title: 'บันทึกข้อมูลสำเร็จ',
                    message: 'ข้อมูลวิทยากรถูกบันทึกสำเร็จ!',
                    icon: {
                        show: true,
                        name: 'heroicons_outline:success',
                        color: 'success',
                    },
                    actions: {
                        confirm: {
                            show: true,
                            label: 'ยืนยัน',
                            color: 'primary',
                        },
                        cancel: {
                            show: false,
                            label: 'ยกเลิก',
                        },
                    },
                    dismissible: false,
                });
            }
        });
    }

    // history_educate

    history_educate(): FormArray {
        return this.formData.get('history_educate') as FormArray;
    }

    new_history_educate(): FormGroup {
        return this._formBuilder.group({
            id: '',
            name: '',
            instructor_id: this.Id,
        });
    }

    remove_history_educate(id: any, i: number): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'ลบรายการ',
            message: 'คุณต้องการลบรายการใช่หรือไม่!',
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
                if (id != '') {
                    this._Service.delete2(id).subscribe({
                        next: (resp: any) => {
                            this.history_educate().removeAt(i);
                            this._changeDetectorRef.detectChanges();
                            this._fuseConfirmationService.open({
                                title: 'ลบรายการสำเร็จ',
                                message:
                                    'รายการที่คุณเลือกได้ถูกลบออกจากระบบแล้ว',
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
                        },
                    });
                } else {
                    this.history_educate().removeAt(i);
                    this._changeDetectorRef.detectChanges();
                }
            }
        });
    }

    add_history_educate(): void {
        this.history_educate().push(this.new_history_educate());
    }

    // history_educate with data

    new_history_educate_with_data(item: any): FormGroup {
        return this._formBuilder.group({
            id: item.id,
            name: item.name,
            instructor_id: this.Id,
        });
    }

    add_history_educate_with_data(item: any): void {
        this.history_educate().push(this.new_history_educate_with_data(item));
    }

    // history_traning

    history_traning(): FormArray {
        return this.formData.get('history_traning') as FormArray;
    }

    new_history_traning(): FormGroup {
        return this._formBuilder.group({
            id: '',
            name: '',
            instructor_id: this.Id,
        });
    }

    remove_history_traning(id: any, i: number): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'ลบรายการ',
            message: 'คุณต้องการลบรายการใช่หรือไม่!',
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
                if (id != '') {
                    this._Service.delete4(id).subscribe({
                        next: (resp: any) => {
                            this.history_traning().removeAt(i);
                            this._changeDetectorRef.detectChanges();
                            this._fuseConfirmationService.open({
                                title: 'ลบรายการสำเร็จ',
                                message:
                                    'รายการที่คุณเลือกได้ถูกลบออกจากระบบแล้ว',
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
                        },
                    });
                } else {
                    this.history_traning().removeAt(i);
                    this._changeDetectorRef.detectChanges();
                }
            }
        });
    }

    add_history_traning(): void {
        this.history_traning().push(this.new_history_traning());
    }

    // history_educate with data

    new_history_traning_with_data(item: any): FormGroup {
        return this._formBuilder.group({
            id: item.id,
            name: item.name,
            instructor_id: this.Id,
        });
    }

    add_history_traning_with_data(item: any): void {
        this.history_traning().push(this.new_history_traning_with_data(item));
    }

    // histroy_work

    histroy_work(): FormArray {
        return this.formData.get('histroy_work') as FormArray;
    }

    new_histroy_work(): FormGroup {
        return this._formBuilder.group({
            id: '',
            name: '',
            instructor_id: this.Id,
        });
    }

    remove_histroy_work(id: any, i: number): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'ลบรายการ',
            message: 'คุณต้องการลบรายการใช่หรือไม่!',
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
                if (id != '') {
                    this._Service.delete3(id).subscribe({
                        next: (resp: any) => {
                            this.histroy_work().removeAt(i);
                            this._changeDetectorRef.detectChanges();
                            this._fuseConfirmationService.open({
                                title: 'ลบรายการสำเร็จ',
                                message:
                                    'รายการที่คุณเลือกได้ถูกลบออกจากระบบแล้ว',
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
                        },
                    });
                } else {
                    this.histroy_work().removeAt(i);
                    this._changeDetectorRef.detectChanges();
                }
            }
        });
    }

    add_histroy_work(): void {
        this.histroy_work().push(this.new_histroy_work());
    }

    // histroy_work with data

    new_histroy_work_with_data(item: any): FormGroup {
        return this._formBuilder.group({
            id: item.id,
            name: item.name,
            instructor_id: this.Id,
        });
    }

    add_histroy_work_with_data(item: any): void {
        this.histroy_work().push(this.new_histroy_work_with_data(item));
    }

    // current_postion

    current_postion(): FormArray {
        return this.formData.get('current_postion') as FormArray;
    }

    new_current_postion(): FormGroup {
        return this._formBuilder.group({
            id: '',
            name: '',
            instructor_id: this.Id,
        });
    }

    remove_current_postion(id: any, i: number): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'ลบรายการ',
            message: 'คุณต้องการลบรายการใช่หรือไม่!',
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
                if (id != '') {
                    this._Service.delete5(id).subscribe({
                        next: (resp: any) => {
                            this.current_postion().removeAt(i);
                            this._changeDetectorRef.detectChanges();
                            this._fuseConfirmationService.open({
                                title: 'ลบรายการสำเร็จ',
                                message:
                                    'รายการที่คุณเลือกได้ถูกลบออกจากระบบแล้ว',
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
                        },
                    });
                } else {
                    this.current_postion().removeAt(i);
                    this._changeDetectorRef.detectChanges();
                }
            }
        });
    }

    add_current_postion(): void {
        this.current_postion().push(this.new_current_postion());
    }

    // current_postion with data

    new_current_postion_with_data(item: any): FormGroup {
        return this._formBuilder.group({
            id: item.id,
            name: item.name,
            instructor_id: this.Id,
        });
    }

    add_current_postion_with_data(item: any): void {
        this.current_postion().push(this.new_current_postion_with_data(item));
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
}
