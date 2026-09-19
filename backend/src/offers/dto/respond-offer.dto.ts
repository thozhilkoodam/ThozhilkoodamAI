import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class RespondOfferDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['accept', 'decline'])
  action: 'accept' | 'decline';

  @IsString()
  @IsOptional()
  reason?: string;
}
