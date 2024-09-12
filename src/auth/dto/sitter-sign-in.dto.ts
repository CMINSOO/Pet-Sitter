import { PickType } from '@nestjs/swagger';
import { Sitter } from 'src/sitter/entities/sitter.entity';

export class SitterSignInDto extends PickType(Sitter, ['email', 'password']) {}
