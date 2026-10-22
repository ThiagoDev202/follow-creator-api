import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AddressInfo } from 'node:net';
import { AppModule } from '../../src/app.module';

export interface RunningApp {
  app: INestApplication;
  url: string;
}

export async function startApp(): Promise<RunningApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  await app.listen(0);
  const server = app.getHttpServer() as { address(): AddressInfo };
  return { app, url: `http://127.0.0.1:${server.address().port}` };
}
