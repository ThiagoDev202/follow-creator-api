import { join } from 'node:path';
import { APIRequestContext, Locator, Page, expect } from '@playwright/test';

export const failureMessage =
  'Não foi possível concluir a ação. Tente novamente.';

export const serverError = {
  status: 500,
  contentType: 'application/json',
  body: JSON.stringify({
    error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' },
  }),
};

export function userSelect(page: Page): Locator {
  return page.getByRole('combobox', { name: 'Você é', exact: true });
}

export function selectedUser(page: Page, name: string): Locator {
  return userSelect(page).getByRole('option', {
    name,
    exact: true,
    selected: true,
  });
}

export function followButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Seguir', exact: true });
}

export function unfollowButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Deixar de seguir', exact: true });
}

export function creatorHeading(page: Page, name: string): Locator {
  return page.getByRole('heading', { level: 1, name, exact: true });
}

export function followerCount(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true });
}

export function evidencePath(fileName: string): string {
  return join(
    __dirname,
    '..',
    'specs',
    '001-seguir-criadora',
    'evidence',
    fileName,
  );
}

export interface Gate {
  opened: Promise<void>;
  open: () => void;
}

export function createGate(): Gate {
  let release: () => void = () => undefined;
  const opened = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { opened, open: () => release() };
}

export async function followViaApi(
  request: APIRequestContext,
  creatorId: number,
  userId: number,
): Promise<void> {
  const response = await request.post(`/creators/${creatorId}/followers`, {
    data: { userId },
  });
  expect(response.status()).toBe(201);
}

export async function countViaApi(
  request: APIRequestContext,
  creatorId: number,
): Promise<unknown> {
  const response = await request.get(`/creators/${creatorId}/followers/count`);
  expect(response.status()).toBe(200);
  return response.json();
}

export async function followingViaApi(
  request: APIRequestContext,
  creatorId: number,
  userId: number,
): Promise<unknown> {
  const response = await request.get(
    `/creators/${creatorId}/followers/${userId}`,
  );
  expect(response.status()).toBe(200);
  return response.json();
}
