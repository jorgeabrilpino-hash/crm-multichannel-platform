import { Controller, Post, Body, Req, HttpCode, HttpStatus, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    async login(@Body() dto: LoginDto, @Req() req: Request) {
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.authService.login(dto, ipAddress, userAgent);
    }

    @Post('register')
    @ApiOperation({ summary: 'Register new user' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    async refresh(@Body() dto: RefreshTokenDto) {
        if (!dto.refreshToken) {
            throw new BadRequestException('Refresh token is required');
        }
        return this.authService.refreshToken(dto.refreshToken);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User logout' })
    async logout(@CurrentUser() user: any, @Body() dto: RefreshTokenDto) {
        return this.authService.logout(user.id, dto.refreshToken);
    }
}
