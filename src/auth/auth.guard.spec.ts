import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TEST_API_KEY } from '@src/config/constants/test-constants';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let configService: DeepMocked<ConfigService>;

  beforeEach(() => {
    configService = createMock<ConfigService>();
    configService.getOrThrow.mockReturnValue(TEST_API_KEY);
    authGuard = new AuthGuard(configService);
    authGuard.onModuleInit();
  });
  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  //valid api key
  it('should return true if the api key is valid', async () => {
    const mockedExecuteContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-api-key': TEST_API_KEY,
          },
        }),
      }),
    });

    const result = await authGuard.canActivate(mockedExecuteContext);
    expect(result).toBe(true);
  });

  //invalid api key
  it('should throw unauthorized exception if no key', async () => {
    const mockedExecuteContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    });

    const result = () => authGuard.canActivate(mockedExecuteContext);
    expect(result).toThrow(UnauthorizedException);
  });

  //no api key
  it('should return error if api key is invalid', async () => {
    const mockedExecuteContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-api-key': 'INVALID KEY',
          },
        }),
      }),
    });

    const result = () => authGuard.canActivate(mockedExecuteContext);
    expect(result).toThrow(UnauthorizedException);
  });
});
