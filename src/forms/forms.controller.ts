import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { responseFormatter } from 'src/utils/response.formatter';
import { IResponse } from 'src/interfaces';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/file-validation/file-validation.pipe';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @HttpCode(200)
  @Post('add-Form')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 1 }]))
  async addForm(
    @UploadedFiles(new FileValidationPipe())
    file: {
      images?: Express.Multer.File[];
    },
    @Body() createFormDto: CreateFormDto,
  ) {
    console.log('Received file:', file);

    try {
      if (file && file.images && file.images.length > 0) {
        createFormDto.images = file.images[0];
      }

      const newForm = await this.formsService.addForm(createFormDto);
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
  async getSingleForm(@Param('id') formId: string): Promise<IResponse> {
    try {
      const result = await this.formsService.getSingleForm(formId);
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
      const result = await this.formsService.getAllForms();
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
