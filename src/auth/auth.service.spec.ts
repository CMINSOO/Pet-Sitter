import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sitter } from 'src/sitter/entities/sitter.entity';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

const MockUserRepository = () => ({
  findOne: jest.fn(),
});

const MockSitterRepository = () => ({
  findOne: jest.fn(),
});

const MockJwtService = () => ({
  sign: jest.fn(),
});

const MockConfigService = () => ({
  get: jest.fn(),
});

const MockCacheManager = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository<User>;
  let sitterRepository: MockRepository<Sitter>;
  let jwtService: JwtService;
  let cacheManger: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: MockUserRepository(),
        },
        {
          provide: getRepositoryToken(Sitter),
          useValue: MockSitterRepository(),
        },
        { provide: JwtService, useFactory: MockJwtService },
        { provide: ConfigService, useFactory: MockConfigService },
        { provide: CACHE_MANAGER, useFactory: MockCacheManager },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    sitterRepository = module.get<MockRepository<Sitter>>(
      getRepositoryToken(Sitter),
    );
  });

  describe('checkEmail', () => {
    it('throw conflict Error if Existing email', async () => {
      userRepository.findOne.mockResolvedValue({ email: 'test@example.com' });
      sitterRepository.findOne.mockResolvedValue({ email: 'test@exmaple.com' });

      await expect(service.checkEmail('test@example.com')).rejects.toThrow(
        ConflictException,
      );
    });
    it('return true if no exist email', async () => {
      userRepository.findOne.mockResolvedValue(null);
      sitterRepository.findOne.mockResolvedValue(null);
      const result = await service.checkEmail('test@exmaple.com');

      expect(result).toBe(true);
    });
  });
  describe('crossCheckPassword', () => {
    it('throw BadRequestException Error if password is not Correct', async () => {
      const password = 'Test1234!';
      const confirmPassword = 'Test4321!';

      const result = service.crossCheckPassword(password, confirmPassword);
      expect(result).rejects.toThrow(BadRequestException);
    });
    it('show return true if password matched', async () => {
      const password = 'Test1234!';
      const confirmPassword = 'Test1234!';

      const result = await service.crossCheckPassword(
        password,
        confirmPassword,
      );
      expect(result).toBe(true);
    });
  });
});
