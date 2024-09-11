import { Controller } from '@nestjs/common';
import { SitterService } from './sitter.service';

@Controller('sitter')
export class SitterController {
  constructor(private readonly sitterService: SitterService) {}
}
