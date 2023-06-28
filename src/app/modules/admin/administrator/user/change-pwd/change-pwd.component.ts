import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { sortBy, startCase } from 'lodash-es';
import { AssetType, UserPagination } from '../user.types';
import { UserService } from '../user.service';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';

@Component({
  selector: 'app-change-pwd',
  templateUrl: './change-pwd.component.html',
  styleUrls: ['./change-pwd.component.scss'],
  animations: fuseAnimations
})

export class ChangePwdComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;


  statusData = [
    { id: 0, name: 'ปิดการใช้งาน' },
    { id: 1, name: 'เปิดการใช้งาน' },
  ]

  positionId: string
  positionData: any = [];


  formData: FormGroup
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
  pagination: UserPagination;

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private _formBuilder: FormBuilder,
    private _Service: UserService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
  ) {

    this.formData = this._formBuilder.group({
      id: '',
      password: ['', Validators.required],
      new_password: ['', Validators.required],
      confirm_new_password: ['', Validators.required],
    })

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.formData.reset();
    this._activatedRoute.params.subscribe(params => {
      const id = params.id;
      this.formData.patchValue({
        id: id,
      })
      console.log('id',id)
      // this._Service.getUserbyId(id).subscribe((resp: any) => {
      //     this.DatabyId = resp.data
      //     this.formData.patchValue({
      //         id: this.DatabyId.id,
      //         user_id: this.DatabyId.user_id,
      //         branch_id: this.DatabyId.branch_id,
      //         department_id: this.DatabyId.department_id,
      //         email: this.DatabyId.email,
      //         first_name: this.DatabyId.first_name,
      //         last_name: this.DatabyId.last_name,
      //         permission_id: this.DatabyId.permission_id,
      //         position_id: this.DatabyId.position_id,
      //         // image: this.DatabyId.image,
      //         status: this.DatabyId.status,
      //     })
      //     console.log('DatabyId', this.DatabyId)

      // })
      // this.image(this.DatabyId.image)

  });



  }

  discard(): void {

  }


  /**
   * After view init
   */
  ngAfterViewInit(): void {

  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions

  }


  ChangePwd(): void {
    this.flashMessage = null;
    this.flashErrorMessage = null;
    // Return if the form is invalid
    if (this.formData.invalid) {
      return;
    }
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      "title": "เปลี่ยนรหัสผ่าน",
      "message": "คุณต้องการยืนยันการเปลี่ยนรหัสผ่านใช่หรือไม่ ",
      "icon": {
        "show": false,
        "name": "heroicons_outline:exclamation",
        "color": "warning"
      },
      "actions": {
        "confirm": {
          "show": true,
          "label": "ยืนยัน",
          "color": "primary"
        },
        "cancel": {
          "show": true,
          "label": "ยกเลิก"
        }
      },
      "dismissible": true
    });

    // Subscribe to the confirmation dialog closed action
    confirmation.afterClosed().subscribe((result) => {

      if (result === 'confirmed') {

        this._Service.changepassword(this.formData.value, this.formData.value.id).subscribe((resp: any) => {
          this.showFlashMessage('success');
          this._router.navigateByUrl('user/list').then(() => {
            window.location.reload();
          });
        })


      }
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
