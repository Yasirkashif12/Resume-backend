import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import type { Response } from 'express'; // ✅ Changed to 'import type'
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async register(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<void> {
    return this.authService.signup(authCredentialsDto);
  }

  @Post('/login')
  async login(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response,
    //passthrough set cookies without it we have to have manually call this by doing res.json
  ): Promise<{ message: string }> {
    const token = await this.authService.signin(authCredentialsDto);

    res.cookie('token', token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { message: 'Logged in successfully' };
  }
  @Post('/logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    res.clearCookie('token');
    return { message: 'Logged out successfully' };
  }
}
//Hello