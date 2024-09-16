import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sitter } from './entities/sitter.entity';
import { Repository, DataSource } from 'typeorm';
import { FindAllSitterDto } from './dto/find-all-sitter.dto';
import { User } from 'src/user/entities/user.entity';
import { Recommend } from './entities/recommend-sitter.entity';
import { UpdateSitterInfoDto } from './dto/update-sitter-info.dto';
import { Booking } from 'src/booking/entities/booking.entity';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class SitterService {
  constructor(
    @InjectRepository(Sitter)
    private readonly sitterRepository: Repository<Sitter>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recommend)
    private readonly recommendRepository: Repository<Recommend>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly dataSource: DataSource,
    private readonly awsService: AwsService,
  ) {}

  async findAll(findAllSitterDto: FindAllSitterDto) {
    const { sortBy, orderBy } = findAllSitterDto;

    const orderOption = sortBy || 'recommendCount';
    const sitters = await this.sitterRepository.find({
      where: { deletedAt: null },
      order: { [orderOption]: orderBy },
    });

    if (!sitters) {
      throw new NotFoundException('시터 를 불러오는데 실패하였습니다');
    }

    const mappedSitters = sitters.map((item) => ({
      id: item.id,
      email: item.email,
      profileUrl: item.profileUrl,
      nickname: item.nickname,
      description: item.description,
      recommendCount: item.recommendCount,
    }));

    return mappedSitters;
  }

  async findOne(id: number) {
    const sitter = await this.sitterRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!sitter) {
      throw new NotFoundException('시터 상세조회에 실패하였습니다');
    }

    const returnValue = {
      id: sitter.id,
      email: sitter.email,
      profileUrl: sitter.profileUrl,
      nickname: sitter.nickname,
      description: sitter.description,
    };

    return returnValue;
  }

  async recommend(id: number, email: string) {
    const sitter = await this.sitterRepository.findOne({
      where: { id, deletedAt: null },
    });
    if (!sitter) {
      throw new NotFoundException('시터를 찾을수 없습니다');
    }
    const user = await this.userRepository.findOne({
      where: { email, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('유저 정보를 찾을수 없습니다.');
    }

    const existRecommend = await this.recommendRepository.findOne({
      where: { sitterId: id, userId: user.id },
    });
    if (existRecommend) {
      throw new ConflictException('이미 추천한 시터입니다');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.increment(Sitter, { id }, 'recommendCount', 1);

      const recommendData = this.recommendRepository.create({
        userId: user.id,
        sitterId: id,
      });
      await queryRunner.manager.save(Recommend, recommendData);
      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException('서버에 에러가 발생했습니다');
    }
  }

  async updateInfo(
    updateSitterInfoDto: UpdateSitterInfoDto,
    email: string,
    file: Express.Multer.File,
  ) {
    const { nickname, description, profileUrl } = updateSitterInfoDto;
    const sitter = await this.sitterRepository.findOne({
      where: { email },
    });
    if (!sitter) {
      throw new NotFoundException('시터 정보를 찾을수 없습니다');
    }

    const updateData: Partial<Sitter> = {};
    if (file) {
      const uploadResult = await this.awsService.saveImage(file);
      updateData.profileUrl = uploadResult.imageUrl;
    } else if (profileUrl) {
      updateData.profileUrl = profileUrl;
    }

    if (nickname) {
      updateData.nickname = nickname;
    }

    if (description) {
      updateData.description = description;
    }

    const returnValue = await this.sitterRepository.update(
      sitter.id,
      updateData,
    );

    return returnValue;
  }

  async myInfo(email: string) {
    const sitter = await this.sitterRepository.findOne({
      where: { email },
    });
    if (!sitter) {
      throw new NotFoundException('시터 정보를 불러오는데 실패하였습니다');
    }

    return sitter;
  }

  async findMyBook(userId: number, userEmail: string) {
    const sitter = await this.sitterRepository.findOne({
      where: { id: userId, email: userEmail },
    });
    if (!sitter) {
      throw new UnauthorizedException('접근 권한이 없는 예약정보입니다.');
    }
    const returnValue = await this.bookingRepository.find({
      where: { sitterId: sitter.id },
    });

    if (returnValue.length == 0) {
      throw new NotFoundException('예약이 존재하지 않습니다.');
    }
    return returnValue;
  }

  async readMyBooking(userId: number, userEmail: string, bookingId: number) {
    const sitter = await this.sitterRepository.findOne({
      where: { id: userId, email: userEmail },
    });
    if (!sitter) {
      throw new UnauthorizedException('접근 권한이 없는 예약정보입니다.');
    }
    const bookingData = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });
    if (bookingData.sitterId !== sitter.id) {
      throw new UnauthorizedException('접근 권한이 없는 예약정보입니다.');
    }

    return bookingData;
  }
}
