import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Form {
  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  contactNo: string;

  @Prop({ required: false })
  emailAddress: string;

  @Prop({ enum: ['Instant Messaging (WhatsApp)', 'Email', 'Call'] })
  methodOfCommunication: string;
}

export const FormSchema = SchemaFactory.createForClass(Form);

export type FormDocument = HydratedDocument<Form>;
