import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form } from './schema';
import { CreateFormDto } from './dto/create-form.dto';
import { IResponse } from 'src/interfaces';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    @InjectModel('Form')
    private readonly formModel: Model<Form>,
    private readonly cloudinary: CloudinaryService,
  ) {}
  async addForm(createFormDto: CreateFormDto) {
    let response: IResponse;
    const { email, images } = createFormDto;

    const validationOptions = { groups: ['file'] };
    const errors = await validate(
      plainToClass(CreateFormDto, createFormDto),
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

    this.logger.log('Looking for a form with an existing email');
    const existingForm = await this.formModel.findOne({ email });

    if (existingForm) {
      return {
        statusCode: 409,
        message: 'Form with existing email already exists',
        data: null,
        error: {
          code: 'FORM_ALREADY_EXIST',
          message: 'Form with existing email already exists',
        },
      };
    }

    if (images) {
      try {
        this.logger.log(`Uploading images to cloud...`);
        const uploadedImages = await this.cloudinary.upload(images);
        createFormDto.images = uploadedImages.secure_url;
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

    // Create and save the form
    const newForm = await this.formModel.create(createFormDto);
    await newForm.save();

    response = {
      statusCode: 201,
      message: 'Form saved successfully',
      data: newForm,
      error: null,
    };

    return response;
  }

  async getSingleForm(formId: string): Promise<IResponse> {
    try {
      const form = await this.formModel.findById(formId);

      if (!form) {
        return {
          statusCode: 404,
          message: 'Form not found',
          data: null,
          error: {
            code: 'FORM_NOT_FOUND',
            message: 'Form not found',
          },
        };
      }

      return {
        statusCode: 200,
        message: 'form retrieved successfully',
        data: form,
        error: null,
      };
    } catch (err) {
      console.error(err);

      this.logger.error(
        `Error retrieving form [${formId}] from the database`,
        JSON.stringify(err, null, 2),
      );

      return {
        statusCode: 500,
        message: 'An error occurred while retrieving form',
        data: null,
        error: err,
      };
    }
  }

  async getAllForms(): Promise<IResponse> {
    try {
      const formList = await this.formModel.find();

      return {
        statusCode: 200,
        message: 'All forms retrieved successfully',
        data: formList,
        error: null,
      };
    } catch (err) {
      console.error(err);

      this.logger.error(
        'Error retrieving all forms from the database',
        JSON.stringify(err, null, 2),
      );

      return {
        statusCode: 500,
        message: 'An error occurred while retrieving all forms',
        data: null,
        error: err,
      };
    }
  }
}
