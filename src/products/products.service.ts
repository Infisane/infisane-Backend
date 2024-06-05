import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDocument } from './schema/product.schema';
import { UserDocument } from 'src/users/schema/user.schema';
import { IResponse } from 'src/interfaces';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async addProduct(
    createProductDto: CreateProductDto,
    userId: string,
  ): Promise<IResponse> {
    let response: IResponse;
    const { email, images } = createProductDto;

    this.logger.log('Validating product data...');
    const validationOptions = { groups: ['file'] };
    const errors = await validate(
      plainToClass(CreateProductDto, createProductDto),
      validationOptions,
    );

    if (errors.length > 0) {
      return {
        statusCode: 400,
        message: 'Validation failed',
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors,
        },
      };
    }

    this.logger.log('Looking for a product request with an existing email...');
    const existingProduct = await this.productModel.findOne({ email });

    if (existingProduct) {
      return {
        statusCode: 409,
        message: 'Product with existing email already exists',
        data: null,
        error: {
          code: 'PRODUCT_ALREADY_EXIST',
          message: 'Product with existing email already exists',
        },
      };
    }

    let uploadedImagesUrl = null;
    if (images) {
      try {
        this.logger.log('Uploading images to cloud...');
        const uploadedImages = await this.cloudinary.upload(images);
        uploadedImagesUrl = uploadedImages.secure_url;
      } catch (error) {
        return {
          statusCode: 500,
          message: 'Error uploading images to Cloudinary',
          data: null,
          error: {
            code: 'IMAGE_UPLOAD_ERROR',
            message: 'Error uploading images to Cloudinary',
            details: error.message,
          },
        };
      }
    }

    const newProduct = new this.productModel({
      ...createProductDto,
      images: uploadedImagesUrl,
      owner: userId,
    });
    await newProduct.save();

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.products.push(newProduct._id);
    await user.save();

    response = {
      statusCode: 201,
      message: 'Product saved successfully',
      data: newProduct,
      error: null,
    };

    this.logger.log('Product created successfully', response);
    return response;
  }

  async getSingleProduct(productId: string): Promise<IResponse> {
    try {
      const product = await this.productModel.findById(productId);

      if (!product) {
        return {
          statusCode: 404,
          message: 'Product not found',
          data: null,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        };
      }

      return {
        statusCode: 200,
        message: 'Product retrieved successfully',
        data: product,
        error: null,
      };
    } catch (err) {
      console.error(err);

      this.logger.error(
        `Error retrieving product [${productId}] from the database`,
        JSON.stringify(err, null, 2),
      );

      return {
        statusCode: 500,
        message: 'An error occurred while retrieving product',
        data: null,
        error: err,
      };
    }
  }

  async getAllProducts(): Promise<IResponse> {
    try {
      const productList = await this.productModel.find();

      return {
        statusCode: 200,
        message: 'All products retrieved successfully',
        data: productList,
        error: null,
      };
    } catch (err) {
      console.error(err);

      this.logger.error(
        'Error retrieving all products from the database',
        JSON.stringify(err, null, 2),
      );

      return {
        statusCode: 500,
        message: 'An error occurred while retrieving all products',
        data: null,
        error: err,
      };
    }
  }

  async getYourSingleProduct(
    productId: string,
    userId: string,
  ): Promise<IResponse> {
    try {
      const product = await this.productModel.findById(productId);

      if (!product) {
        return {
          statusCode: 404,
          message: 'Product not found',
          data: null,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        };
      }

      if (product.owner.toString() !== userId.toString()) {
        throw new ForbiddenException(
          'You are not allowed to access this product',
        );
      }

      return {
        statusCode: 200,
        message: 'Product retrieved successfully',
        data: product,
        error: null,
      };
    } catch (err) {
      console.error(err);
      this.logger.error(
        `Error retrieving product [${productId}] from the database`,
        JSON.stringify(err, null, 2),
      );
      return {
        statusCode: 500,
        message: 'An error occurred while retrieving product',
        data: null,
        error: err,
      };
    }
  }

  async getUserProducts(userId: string): Promise<IResponse> {
    try {
      const productList = await this.productModel.find({ owner: userId });

      return {
        statusCode: 200,
        message: 'All user products retrieved successfully',
        data: productList,
        error: null,
      };
    } catch (err) {
      console.error(err);
      this.logger.error(
        'Error retrieving all user products from the database',
        JSON.stringify(err, null, 2),
      );
      return {
        statusCode: 500,
        message: 'An error occurred while retrieving all user products',
        data: null,
        error: err,
      };
    }
  }

  async updateYourProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<IResponse> {
    try {
      const product = await this.productModel.findById(productId);

      if (!product) {
        return {
          statusCode: 404,
          message: 'Product not found',
          data: null,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        };
      }

      if (product.owner.toString() !== userId.toString()) {
        throw new ForbiddenException(
          'You are not allowed to update this product',
        );
      }

      Object.assign(product, updateProductDto);
      await product.save();

      return {
        statusCode: 200,
        message: 'Product updated successfully',
        data: product,
        error: null,
      };
    } catch (err) {
      console.error(err);
      this.logger.error(
        `Error updating product [${productId}] from the database`,
        JSON.stringify(err, null, 2),
      );
      return {
        statusCode: 500,
        message: 'An error occurred while updating product',
        data: null,
        error: err,
      };
    }
  }

  async deleteYourProduct(
    productId: string,
    userId: string,
  ): Promise<IResponse> {
    try {
      const product = await this.productModel.findById(productId);

      if (!product) {
        return {
          statusCode: 404,
          message: 'Product not found',
          data: null,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        };
      }

      if (product.owner.toString() !== userId.toString()) {
        throw new ForbiddenException(
          'You are not allowed to delete this product',
        );
      }

      await this.productModel.deleteOne({ _id: productId });

      return {
        statusCode: 200,
        message: 'Product deleted successfully',
        data: null,
        error: null,
      };
    } catch (err) {
      console.error(err);
      this.logger.error(
        `Error deleting product [${productId}] from the database`,
        JSON.stringify(err, null, 2),
      );
      return {
        statusCode: 500,
        message: 'An error occurred while deleting product',
        data: null,
        error: err,
      };
    }
  }
}
