import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
    @ApiProperty({ description: 'Refresh token' })
    @IsString()
    @IsOptional()
    refreshToken?: string;
}
