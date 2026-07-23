import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('ping')
  ping() {
    return { status: 'success', message: 'pong' };
  }
}
