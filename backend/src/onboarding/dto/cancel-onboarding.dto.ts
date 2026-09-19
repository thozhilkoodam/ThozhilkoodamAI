import { IsNotEmpty, IsString } from 'class-validator';

export class CancelOnboardingDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
