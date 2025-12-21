import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { hashPassword, comparePasswords } from './utils/password.util';
import { generateAccessToken } from './utils/jwt.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Public API
  async signup(dto: AuthCredentialsDto): Promise<void> {
    await this.ensureEmailIsUnique(dto.email);
    const hashedPassword = await this.hashPasswordAsync(dto.password);
    const user = this.createUserEntity(dto.email, hashedPassword);
    await this.saveUser(user);
  }

  async signin(dto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const user = await this.validateCredentials(dto.email, dto.password);
    const token = this.generateJwt(user);
    return { accessToken: token };
  }

  // ----------------------
  // Private helpers
  // ----------------------

  private async ensureEmailIsUnique(email: string): Promise<void> {
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already exists');
  }

  private async hashPasswordAsync(password: string): Promise<string> {
    return hashPassword(password); // password util
  }

  private createUserEntity(email: string, password: string): User {
    return this.userRepository.create({ email, password });
  }

  private async saveUser(user: User): Promise<void> {
    await this.userRepository.save(user);
  }

  private async validateCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.findUserByEmail(email);
    await this.verifyPassword(password, user.password);
    return user;
  }

  private async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  private async verifyPassword(plain: string, hashed: string): Promise<void> {
    const isValid = await comparePasswords(plain, hashed);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
  }

  private generateJwt(user: User): string {
    const payload: JwtPayload = { id: user.id, email: user.email };
    return generateAccessToken(this.jwtService, payload);
  }
}
