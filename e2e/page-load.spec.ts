import { expect, test } from './fixtures';
import {
  createGate,
  creatorHeading,
  evidencePath,
  followButton,
  followerCount,
  selectedUser,
  unfollowButton,
  userSelect,
} from './support';

test('FR-019 FR-022 FR-023: estado inicial mostra Luna Prado, "0 seguidores", Ana selecionada em "Você é" e o botão "Seguir"', async ({
  page,
}) => {
  await page.goto('/');

  await expect(creatorHeading(page, 'Luna Prado')).toBeVisible();
  await expect(followerCount(page, '0 seguidores')).toBeVisible();
  await expect(userSelect(page)).toBeVisible();
  await expect(userSelect(page).getByRole('option')).toHaveText([
    'Ana',
    'Bruno',
    'Carla',
  ]);
  await expect(selectedUser(page, 'Ana')).toHaveCount(1);
  await expect(followButton(page)).toBeVisible();
  await expect(followButton(page)).toBeEnabled();
  await expect(unfollowButton(page)).toHaveCount(0);

  await page.screenshot({ path: evidencePath('inicial.png'), fullPage: true });
});

test('FR-020: ?creatorId=2 mostra Mel Duarte com "0 seguidores" e o botão "Seguir"', async ({
  page,
}) => {
  await page.goto('/?creatorId=2');

  await expect(creatorHeading(page, 'Mel Duarte')).toBeVisible();
  await expect(followerCount(page, '0 seguidores')).toBeVisible();
  await expect(followButton(page)).toBeVisible();
  await expect(creatorHeading(page, 'Luna Prado')).toHaveCount(0);
});

test('FR-020: ?creatorId= vazio usa a criadora 1 (Luna Prado)', async ({
  page,
}) => {
  await page.goto('/?creatorId=');

  await expect(creatorHeading(page, 'Luna Prado')).toBeVisible();
  await expect(followerCount(page, '0 seguidores')).toBeVisible();
  await expect(followButton(page)).toBeVisible();
});

for (const creatorId of ['999', 'abc', '0', '2147483648']) {
  test(`FR-021: ?creatorId=${creatorId} mostra "Criadora não encontrada." sem seletor e sem botão`, async ({
    page,
  }) => {
    await page.goto(`/?creatorId=${creatorId}`);

    await expect(page.getByRole('alert')).toHaveText(
      'Criadora não encontrada.',
    );
    await expect(page.getByRole('button')).toHaveCount(0);
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await expect(page.getByText('Carregando…', { exact: true })).toHaveCount(0);
  });
}

test('FR-027: mostra "Carregando…" sem botão enquanto os dados iniciais não chegam e o esconde quando chegam', async ({
  page,
}) => {
  const gate = createGate();
  await page.route(
    (url) => url.pathname === '/users' || url.pathname.startsWith('/creators/'),
    async (route) => {
      await gate.opened;
      await route.fallback();
    },
  );

  await page.goto('/', { waitUntil: 'commit' });

  await expect(page.getByText('Carregando…', { exact: true })).toBeVisible();
  await expect(page.getByRole('button')).toHaveCount(0);

  gate.open();

  await expect(followButton(page)).toBeVisible();
  await expect(creatorHeading(page, 'Luna Prado')).toBeVisible();
  await expect(followerCount(page, '0 seguidores')).toBeVisible();
  await expect(page.getByText('Carregando…', { exact: true })).toBeHidden();
});
