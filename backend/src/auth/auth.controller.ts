import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller()
export class AuthController {
  @Post('auth/login') login(@Body() body: any) { return { accessToken: 'mock', refreshToken: 'mock', mfaRequired: !!body?.username }; }
  @Post('auth/mfa/verify') mfaVerify() { return { ok: true }; }
  @Post('auth/refresh') refresh() { return { accessToken: 'mock-new' }; }
  @Post('auth/logout') logout() { return { ok: true }; }
  @Get('me') me() { return { id: 'u1', role: 'ADMIN' }; }
  @Get('me/sessions') sessions() { return []; }
  @Delete('me/sessions/:id') deleteSession(@Param('id') id: string) { return { revoked: id }; }
}
