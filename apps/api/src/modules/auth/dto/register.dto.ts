import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 10, example: 'secretpass1' })
  @IsString()
  @MinLength(10)
  password!: string;

  @ApiPropertyOptional({ description: 'Optional tenant ID to associate the user with' })
  @IsString()
  @IsOptional()
  tenantId?: string;
}
