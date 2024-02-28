import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { responseFormatter } from 'src/utils/response.formatter';
import { IResponse } from 'src/interfaces';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @HttpCode(200)
  @Post('add-Form')
  async addForm(@Body() createFormDto: CreateFormDto) {
    const newForm = await this.formsService.addForm({
      ...createFormDto,
    });

    return responseFormatter(newForm);
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
