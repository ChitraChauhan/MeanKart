import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminProductService } from '../../../services/admin-product.service';
import { ModalService } from '../../../services/modal.service';
import { Product } from '../../../models/product.model';
import { environment } from '../../../../../environment';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  imports: [ReactiveFormsModule, RouterLink],
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  loading = false;
  error: string | null = null;
  ASSET_BASE_URL = environment.assetsBaseUrl || 'assets/';

  private modalService = inject(ModalService);

  constructor(
    private fb: FormBuilder,
    private productService: AdminProductService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      imageUrl: this.fb.array([this.createImageControl()]),
      specifications: this.fb.group({
        brand: [''],
        model: [''],
        color: [''],
        size: [''],
        weight: [''],
      }),
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id');
      if (this.productId) {
        this.isEditMode = true;
        this.loadProduct(this.productId);
      }
    });
  }

  get images() {
    return this.productForm.get('imageUrl') as FormArray;
  }

  createImageControl() {
    return this.fb.control('', Validators.required);
  }

  addImage() {
    this.images.push(this.createImageControl());
  }

  removeImage(index: number) {
    this.images.removeAt(index);
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product: any) => {
        while (this.images.length) {
          this.images.removeAt(0);
        }

        product.imageUrl.forEach((image: any) => {
          this.images.push(this.fb.control(image, Validators.required));
        });

        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          specifications: product.specifications || {},
        });

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading product:', err);
        this.error = 'Failed to load product details';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const productData: Product = {
      ...this.productForm.value,
    };

    if (this.isEditMode && this.productId) {
      productData._id = this.productId;
    }

    const productObservable =
      this.isEditMode && this.productId
        ? this.productService.updateProduct(this.productId, productData)
        : this.productService.createProduct(productData);

    productObservable.subscribe({
      next: () => {
        this.router.navigate(['/admin/products']);
      },
      error: (err: any) => {
        console.error('Error saving product:', err);
        this.error = 'Failed to save product. Please try again.';
        this.loading = false;
      },
    });
  }

  async onCancel(): Promise<void> {
    const hasChanges = this.productForm.dirty;

    if (!hasChanges) {
      this.router.navigate(['/admin/products']);
      return;
    }
    const confirmed: boolean = await this.modalService.showConfirm({
      title: 'Discard Changes',
      message:
        'You have unsaved changes. Are you sure you want to leave this page?',
      confirmText: 'Discard Changes',
      cancelText: 'Continue Editing',
    });

    if (confirmed) {
      this.router.navigate(['/admin/products']);
    }
  }
}
