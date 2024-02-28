import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form } from './schema';
import { CreateFormDto } from './dto/create-form.dto';
import { IResponse } from 'src/interfaces';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    @InjectModel('Form')
    private readonly formModel: Model<Form>,
  ) {}

  async addForm(createFormDto: CreateFormDto) {
    let response: IResponse;
    const { email } = createFormDto;

    this.logger.log('Looking for gallery with existing title');
    const existingForm = await this.formModel.findOne({ email });

    if (existingForm) {
      return (response = {
        statusCode: 409,
        message: 'Form with existing email already exists',
        data: null,
        error: {
          code: 'FORM_ALREADY_EXIST',
          message: 'Form with existing email already exists',
        },
      });
    } else {
      const newForm = await this.formModel.create({
        ...createFormDto,
      });

      await newForm.save();

      response = {
        statusCode: 201,
        message: 'Form saved successfully',
        data: newForm,
        error: null,
      };
    }
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
