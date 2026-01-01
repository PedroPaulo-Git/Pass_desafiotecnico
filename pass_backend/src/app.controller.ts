import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'pass-backend-api'
    };
  }

  @Get()
  getHello() {
    return {
      message: 'Pass Fleet Management API is running',
      docs: '/api'
    };
  }
}
