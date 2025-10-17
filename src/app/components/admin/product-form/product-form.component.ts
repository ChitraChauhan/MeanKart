import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminProductService } from '../../../services/admin-product.service';
import { ModalService } from '../../../services/modal.service';
import { ImageService } from '../../../services/image.service';

type ImageControlValue = string | File | null;

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  imports: [ReactiveFormsModule, RouterLink],
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  loading = false;
  error: string | null = null;
  private blobUrls: Map<string, string> = new Map();
  private modalService = inject(ModalService);

  constructor(
    private fb: FormBuilder,
    private productService: AdminProductService,
    private route: ActivatedRoute,
    private router: Router,
    public imageService: ImageService,
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

  createImageControl(): FormControl<ImageControlValue> {
    return this.fb.control<ImageControlValue>(
      null,
      Validators.required,
    ) as FormControl<ImageControlValue>;
  }

  async getFormData(): Promise<any> {
    const formValue = this.productForm.getRawValue();
    const result = { ...formValue };
    result.imageUrl = [];

    // Process each image control
    for (const control of this.images.controls) {
      const value = control.value;
      if (value instanceof File) {
        // Convert new files to base64
        const base64 = await this.fileToBase64(value);
        result.imageUrl.push({
          fileName: value.name.split('.')[0],
          fileType: value.type,
          base64: base64.split(',')[1],
        });
      } else if (typeof value === 'string') {
        // Keep existing URLs as is
        result.imageUrl.push(value);
      }
    }

    return result;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
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

  async loadProduct(id: string): Promise<void> {
    try {
      this.loading = true;
      const product = await this.productService.getProductById(id).toPromise();
      if (!product) return;

      // Clear existing images
      while (this.images.length) {
        this.images.removeAt(0);
      }

      // Handle image URLs from server
      if (product.imageUrl && Array.isArray(product.imageUrl)) {
        product.imageUrl.forEach((url) => {
          this.images.push(this.fb.control(url, Validators.required));
        });
      }

      // Handle specifications if it's a string
      let specifications = {};
      if (product.specifications) {
        try {
          specifications =
            typeof product.specifications === 'string'
              ? JSON.parse(product.specifications)
              : product.specifications;
        } catch (e) {
          console.error('Error parsing specifications:', e);
          specifications = {};
        }
      }

      this.productForm.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        specifications: specifications,
      });
      this.loading = false;
      // Rest of your form setup...
    } catch (error) {
      console.error('Error loading product:', error);
      this.loading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    try {
      const formData = await this.getFormData();

      if (this.isEditMode && this.productId) {
        this.productService.updateProduct(this.productId, formData).subscribe({
          next: () => {
            this.loading = false;
            this.modalService.showAlert({
              title: 'Success',
              message: 'Product updated successfully!',
            });
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.error = error.error?.message || 'Failed to update product';
            this.loading = false;
          },
        });
      } else {
        this.productService.createProduct(formData).subscribe({
          next: () => {
            this.loading = false;
            this.modalService.showAlert({
              title: 'Success',
              message: 'Product created successfully!',
            });
            this.router.navigate(['/admin/products']);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.error = error.error?.message || 'Failed to create product';
            this.loading = false;
          },
        });
      }
    } catch (error) {
      console.error('Error processing form data:', error);
      this.error = 'Failed to process form data';
      this.loading = false;
    }
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

  // In your component class
  addImage(): void {
    if (this.images.length < 5) {
      // Optional: Limit to 5 images
      this.images.push(this.fb.control(null, Validators.required));
    }
  }

  onFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      // Clean up any existing blob URL for this control
      const currentValue = this.images.at(index).value;
      if (currentValue instanceof File) {
        this.cleanupBlobUrls();
      }

      // Update the form control
      this.images.at(index).setValue(file);
      this.images.at(index).updateValueAndValidity();

      // Reset the file input to allow selecting the same file again
      event.target.value = '';
    }
  }

  removeImage(index: number): void {
    // Clean up blob URL before removing
    const currentValue = this.images.at(index).value;
    if (currentValue instanceof File) {
      this.cleanupBlobUrls();
    }

    this.images.removeAt(index);
    this.productForm.markAsDirty();
  }

  private cleanupBlobUrls(): void {
    this.blobUrls.forEach((url) => URL.revokeObjectURL(url));
    this.blobUrls.clear();
  }

  ngOnDestroy(): void {
    this.cleanupBlobUrls();
  }
}
