import { IsNumber, Min } from 'class-validator';

export class AdjustBalanceDto {
  @IsNumber()
  @Min(0)
  allowanceDays: number;
}
