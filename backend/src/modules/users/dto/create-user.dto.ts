import { IsEmail, IsString, MinLength, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsString()
    lastName: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty()
    @IsUUID()
    companyId: string;

    @ApiProperty({ required: false, type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    roleIds?: string[];
}
