import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sitter } from 'src/sitter/entities/sitter.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { UserType } from './types/user-type';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const MockUserRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
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
  let configService: ConfigService;

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
    jwtService = module.get<JwtService>(JwtService);
    cacheManger = module.get(CACHE_MANAGER);
    configService = module.get<ConfigService>(ConfigService);
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

  describe('findUserById', () => {
    it('should return Unauthorized Error if no User', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.findUserById(1)).rejects.toThrow(NotFoundException);
    });
    it('should return userId if user exist', async () => {
      const mockUser = { id: 1 };
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findUserById(1);
      expect(result).toBe(1);
    });
  });

  describe('findUserByEmail', () => {
    it('should throw Unauthorized Error if no User', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(
        service.findUserByEmail('test@example.com', UserType.USER),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('show throw Unauthorized Error if no Sitter', async () => {
      sitterRepository.findOne.mockResolvedValue(null);
      await expect(
        service.findUserByEmail('test@example.com', UserType.SITTER),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('should return user if exist User', async () => {
      const mockUser = {
        id: 1,
        email: 'test@exmaple.com',
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findUserByEmail(
        'test@exmaple.com',
        UserType.USER,
      );
      expect(result).toBe(mockUser);
    });
    it('should return sitter if exist Sitter', async () => {
      const mockSitter = {
        id: 2,
        email: 'sitter@exmaple.com',
      };
      sitterRepository.findOne.mockResolvedValue(mockSitter);
      const result = await service.findUserByEmail(
        'sitter@exmaple.com',
        UserType.SITTER,
      );
      expect(result).toBe(mockSitter);
    });
  });
  describe('checkNickname', () => {
    it('should throw Conflict Error if Exist User Nickname', async () => {
      userRepository.findOne.mockResolvedValue('user1');
      sitterRepository.findOne.mockResolvedValue('user1');

      await expect(service.checkNickname('user1')).rejects.toThrow(
        ConflictException,
      );
    });
    it('should return true if Nickname is not used', async () => {
      userRepository.findOne.mockResolvedValue(null);
      sitterRepository.findOne.mockResolvedValue(null);

      const result = await service.checkNickname('used3');
      expect(result).toBe(true);
    });
  });
  describe('validateUser', () => {
    it('should throw NotFound Error if no such user', async () => {
      const mockSignInDto = {
        email: 'test@exmaple.com',
        password: 'Test1234!',
        userType: UserType.USER,
      };
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.validateUser(mockSignInDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  it('should throw Unauthorized Error if Password not Matched', async () => {
    const mockUser = {
      id: 1,
      password: 'Test1234!',
    };
    const mockSignInDto = {
      email: 'test@exmaple.com',
      password: 'Test1234!',
      userType: UserType.USER,
    };
    userRepository.findOne.mockResolvedValue(mockUser);
    // hash password 를 비교하는 상황을 시뮬레이션을 돌리는것
    (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

    expect(service.validateUser(mockSignInDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('should return userId if validated', async () => {
    const mockUser = {
      id: 1,
      password: 'Test1234!',
    };
    const mockSignInDto = {
      email: 'test@exmaple.com',
      password: 'Test1234!',
      userType: UserType.USER,
    };
    userRepository.findOne.mockResolvedValue(mockUser);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

    const result = await service.validateUser(mockSignInDto);
    expect(result.id).toBe(mockUser.id);
  });
  describe('signUp', () => {
    it('should return userData if pass every validation', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const emailResult = await service.checkEmail('test@example.com');
      expect(emailResult).toBe(true);

      const password = 'Test1234!';
      const confirmPassword = 'Test1234!';

      const passwordResult = await service.crossCheckPassword(
        password,
        confirmPassword,
      );
      expect(passwordResult).toBe(true);

      userRepository.findOne.mockResolvedValue(null);
      const mockNickname = 'test';
      const resultNickname = await service.checkNickname(mockNickname);

      expect(resultNickname).toBe(true);

      const createUserDto = {
        email: 'test@example.com',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
        nickname: 'test',
      };

      // 이메일, 닉네임 중복 확인에서 null을 반환 (즉, 중복되지 않음)
      userRepository.findOne.mockResolvedValueOnce(null);
      userRepository.findOne.mockResolvedValueOnce(null);

      // bcrypt.hashSync를 모킹하여 암호화된 비밀번호를 반환
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashedPassword');

      const mockUser = {
        id: 1,
        email: createUserDto.email,
        password: 'hashedPassword',
        nickname: createUserDto.nickname,
      };

      // create와 save 메서드를 모킹
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      // signUp 메서드 호출
      const result = await service.signUp(createUserDto);

      // 이메일과 닉네임 중복 체크가 호출되었는지 확인
      expect(userRepository.findOne).toHaveBeenCalledTimes(4);

      // 비밀번호가 해싱되었는지 확인
      expect(bcrypt.hashSync).toHaveBeenCalledWith(createUserDto.password, 10);

      // UserRepository.create 및 save가 호출되었는지 확인
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: 'hashedPassword',
        nickname: createUserDto.nickname,
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);

      // 최종 반환 값이 올바른지 확인
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        nickname: mockUser.nickname,
      });
    });
  });
  describe('createToken', () => {
    it('show return access,refresh token ', async () => {
      const mockUserId = 1;
      const mockEmail = 'test@example.com';
      const mockUserType = 'USER';

      // spyon 을 사용해서 특정메소드를 흉내내기
      // configService get이 제대로 작동하는지 확인하는 테스트
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'ACCESS_TOKEN_SECRET') return 'access-secret';
        if (key === 'ACCESS_TOKEN_EXPIRES') return '1h';
        if (key === 'REFRESH_TOKEN_SECRET') return 'refresh-secret';
        if (key === 'REFRESH_TOKEN_EXPIRES') return '7d';
        if (key === 'HASH_ROUND') return 10;
        return null;
      });

      jest.spyOn(jwtService, 'sign').mockReturnValue('fakeAccessToken');

      const result = await service.createToken(
        mockUserId,
        mockEmail,
        mockUserType,
      );

      // jwt sign메서드가 조건에맞는 파라미터들과 함께 불렸는지 체크하는 테스트
      expect(jwtService.sign).toHaveBeenCalledWith(
        { id: mockUserId, email: mockEmail, userType: mockUserType },
        { secret: 'access-secret', expiresIn: '1h' },
      );

      // 토큰은 반환하는지 확인하는 함수
      expect(result).toEqual({
        accessToken: 'fakeAccessToken',
        refreshToken: expect.any(String), // assuming refresh token is generated later
      });
    });
  });
  //   이 코드의 테스트 시나리오:
  // JWT 토큰 생성 확인: jwtService.sign()이 올바르게 호출되었는지 확인해야 합니다.
  // configService.get() 값 검증: ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, HASH_ROUND 등의 설정 값이 제대로 불러와지는지 검증합니다.
  // 리프레시 토큰 해싱: bcrypt.hashSync()이 호출되고, 리프레시 토큰이 해싱되는지 확인합니다.
  // Redis 캐시 확인 및 갱신: cacheManager.get()과 cacheManager.set()이 올바르게 호출되고, 리프레시 토큰이 제대로 저장되는지 검증해야 합니다.
});
