import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { responseFormatter } from 'src/utils/response.formatter';
import { IResponse } from 'src/interfaces';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/file-validation/file-validation.pipe';
import { JwtGuard } from 'src/guards';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class FormsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('request')
  @UseGuards(new JwtGuard(['user']))
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 1 }]))
  async addForm(
    @UploadedFiles(new FileValidationPipe())
    file: {
      images?: Express.Multer.File[];
    },
    @Body() createFormDto: CreateProductDto,
    @Req() req,
  ): Promise<IResponse> {
    console.log('Received file:', file);

    try {
      const userId = req.user._id;

      if (file && file.images && file.images.length > 0) {
        createFormDto.images = file.images[0];
      }

      const newForm = await this.productsService.addProduct(
        {
          ...createFormDto,
        },
        userId,
      );
      return responseFormatter(newForm);
    } catch (error) {
      console.error('Error in addForm:', error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: null,
        error: error.message,
      };
    }
  }

  @HttpCode(200)
  @Get('/:id')
  async getSingleForm(@Param('id') productId: string): Promise<IResponse> {
    try {
      const result = await this.productsService.getSingleProduct(productId);
      return result;
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: null,
        error: error.message,
      };
    }
  }

  @HttpCode(200)
  @Get()
  async getAllForms(): Promise<IResponse> {
    try {
      const result = await this.productsService.getAllProducts();
      return result;
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: null,
        error: error.message,
      };
    }
  }

  @HttpCode(200)
  @Get('/user/logo')
  @UseGuards(new JwtGuard(['user']))
  async getUserForms(@Req() req): Promise<IResponse> {
    try {
      const userId = req.user._id;
      const result = await this.productsService.getUserProducts(userId);
      return result;
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: null,
        error: error.message,
      };
    }
  }

  @HttpCode(200)
  @Get('/user/:id')
  @UseGuards(new JwtGuard(['user']))
  async getYourSingleForm(
    @Param('id') productId: string,
    @Req() req,
  ): Promise<IResponse> {
    try {
      const userId = req.user._id;
      const result = await this.productsService.getYourSingleProduct(
        productId,
        userId,
      );
      return result;
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: null,
        error: error.message,
      };
    }
  }

  @HttpCode(200)
  @Patch('/user/:id')
  @UseGuards(new JwtGuard(['user']))
  async updateYourForm(
    @Param('id') productId: string,
    @Body() updateFormDto: UpdateProductDto,
    @Req() req,
  ): Promise<IResponse> {
    try {
      const userId = req.user._id;
      const result = await this.productsService.updateYourProduct(
        productId,
        updateFormDto,
        userId,
      );
      return result;
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: null,
        error: error.message,
      };
    }
  }

  @HttpCode(200)
  @Delete('/user/:id')
  @UseGuards(new JwtGuard(['user']))
  async deleteYourForm(
    @Param('id') productId: string,
    @Req() req,
  ): Promise<IResponse> {
    try {
      const userId = req.user._id;
      const result = await this.productsService.deleteYourProduct(
        productId,
        userId,
      );
      return result;
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: null,
        error: error.message,
      };
    }
  }
}
