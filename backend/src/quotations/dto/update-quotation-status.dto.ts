import { IsEnum } from 'class-validator'

export enum QuotationStatusEnum {
  draft = 'draft',
  sent = 'sent',
  approved = 'approved',
  rejected = 'rejected',
}

export class UpdateQuotationStatusDto {
  @IsEnum(QuotationStatusEnum)
  status: QuotationStatusEnum
}
