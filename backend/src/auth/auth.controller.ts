import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { RefreshDto } from './dto/refresh.dto';

@ApiTags('auth')
@Controller()
export class AuthController {
  @Post('auth/login')
  @HttpCode(200)
  login(@Body() body: LoginDto) {
    return { accessToken: 'mock', refreshToken: 'mock', mfaRequired: body.username.startsWith('mfa_') };
  }

  @Post('auth/mfa/verify')
  @HttpCode(200)
  mfaVerify(@Body() _body: MfaVerifyDto) {
    return { ok: true };
  }

  @Post('auth/refresh')
  @HttpCode(200)
  refresh(@Body() _body: RefreshDto) {
    return { accessToken: 'mock-new' };
  }

  @Post('auth/logout')
  @HttpCode(200)
  logout() {
    return { ok: true };
  }

  @Get('me') me() { return { id: 'u1', role: 'ADMIN' }; }
  @Get('me/sessions') sessions() { return []; }
  @Delete('me/sessions/:id') deleteSession(@Param('id') id: string) { return { revoked: id }; }
}
