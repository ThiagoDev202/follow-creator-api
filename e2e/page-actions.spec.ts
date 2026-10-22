import { expect, test } from './fixtures';
import {
  countViaApi,
  createGate,
  evidencePath,
  failureMessage,
  followButton,
  followViaApi,
  followerCount,
  followingViaApi,
  selectedUser,
  serverError,
  unfollowButton,
  userSelect,
} from './support';

test('FR-019 FR-023: seguir troca o botão para "Deixar de seguir" e a contagem para "1 seguidor"; deixar de seguir volta a "Seguir" e "0 seguidores"', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(followerCount(page, '0 seguidores')).toBeVisible();

  await followButton(page).click();

  await expect(unfollowButton(page)).toBeVisible();
  await expect(followerCount(page, '1 seguidor')).toBeVisible();
  await expect(followButton(page)).toHaveCount(0);
  expect(await countViaApi(request, 1)).toStrictEqual({
    creatorId: 1,
    count: 1,
  });
  await page.screenshot({ path: evidencePath('seguindo.png'), fullPage: true });

  await unfollowButton(page).click();

  await expect(followButton(page)).toBeVisible();
  await expect(followerCount(page, '0 seguidores')).toBeVisible();
  await expect(unfollowButton(page)).toHaveCount(0);
  expect(await countViaApi(request, 1)).toStrictEqual({
    creatorId: 1,
    count: 0,
  });
});

test('FR-022 FR-023: trocar o usuário em "Você é" atualiza o botão e a ação vale para o usuário escolhido', async ({
  page,
  request,
}) => {
  await followViaApi(request, 1, 1);
  await page.goto('/');
  await expect(selectedUser(page, 'Ana')).toHaveCount(1);
  await expect(unfollowButton(page)).toBeVisible();
  await expect(followerCount(page, '1 seguidor')).toBeVisible();

  await userSelect(page).selectOption({ label: 'Bruno' });

  await expect(followButton(page)).toBeVisible();
  await expect(unfollowButton(page)).toHaveCount(0);

  await userSelect(page).selectOption({ label: 'Ana' });

  await expect(unfollowButton(page)).toBeVisible();
  await expect(followButton(page)).toHaveCount(0);

  await userSelect(page).selectOption({ label: 'Bruno' });
  await expect(followButton(page)).toBeVisible();
  await followButton(page).click();

  await expect(unfollowButton(page)).toBeVisible();
  await expect(followerCount(page, '2 seguidores')).toBeVisible();
  expect(await followingViaApi(request, 1, 2)).toStrictEqual({
    following: true,
  });
  expect(await followingViaApi(request, 1, 1)).toStrictEqual({
    following: true,
  });
});

test('FR-025: duplo clique em "Seguir" envia um único POST e nenhum DELETE, com o botão desabilitado e aria-busy durante a ação', async ({
  page,
  request,
}) => {
  const actions: string[] = [];
  page.on('request', (sent) => {
    const { pathname } = new URL(sent.url());
    if (
      pathname.startsWith('/creators/1/followers') &&
      (sent.method() === 'POST' || sent.method() === 'DELETE')
    ) {
      actions.push(sent.method());
    }
  });
  const gate = createGate();
  await page.route('**/creators/1/followers', async (route) => {
    if (route.request().method() === 'POST') {
      await gate.opened;
    }
    await route.fallback();
  });
  await page.goto('/');
  await expect(followButton(page)).toBeEnabled();

  await followButton(page).dblclick();

  await expect(followButton(page)).toBeDisabled();
  await expect(followButton(page)).toHaveAttribute('aria-busy', 'true');

  gate.open();

  await expect(unfollowButton(page)).toBeEnabled();
  await expect(followerCount(page, '1 seguidor')).toBeVisible();
  await expect(unfollowButton(page)).not.toHaveAttribute('aria-busy', 'true');
  expect(actions).toStrictEqual(['POST']);
  expect(await countViaApi(request, 1)).toStrictEqual({
    creatorId: 1,
    count: 1,
  });
});

test('FR-026: falha de rede no POST mostra a mensagem e mantém "0 seguidores" e "Seguir"; a ação seguinte limpa a mensagem', async ({
  page,
}) => {
  await page.route('**/creators/1/followers', async (route) => {
    if (route.request().method() === 'POST') {
      await route.abort('failed');
      return;
    }
    await route.fallback();
  });
  await page.goto('/');
  await expect(followButton(page)).toBeEnabled();

  await followButton(page).click();

  await expect(page.getByRole('alert')).toHaveText(failureMessage);
  await expect(followerCount(page, '0 seguidores')).toBeVisible();
  await expect(followButton(page)).toBeEnabled();
  await expect(followButton(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(unfollowButton(page)).toHaveCount(0);
  await page.screenshot({ path: evidencePath('erro.png'), fullPage: true });

  await page.unroute('**/creators/1/followers');
  await followButton(page).click();

  await expect(unfollowButton(page)).toBeVisible();
  await expect(followerCount(page, '1 seguidor')).toBeVisible();
  await expect(page.getByText(failureMessage, { exact: true })).toHaveCount(0);
});

test('FR-026: resposta 500 no POST mostra a mensagem e mantém "0 seguidores" e "Seguir"', async ({
  page,
  request,
}) => {
  await page.route('**/creators/1/followers', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill(serverError);
      return;
    }
    await route.fallback();
  });
  await page.goto('/');
  await expect(followButton(page)).toBeEnabled();

  await followButton(page).click();

  await expect(page.getByRole('alert')).toHaveText(failureMessage);
  await expect(followerCount(page, '0 seguidores')).toBeVisible();
  await expect(followButton(page)).toBeEnabled();
  await expect(followButton(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(unfollowButton(page)).toHaveCount(0);
  expect(await countViaApi(request, 1)).toStrictEqual({
    creatorId: 1,
    count: 0,
  });
});

test('FR-026: resposta 500 no DELETE mostra a mensagem e mantém "1 seguidor" e "Deixar de seguir"', async ({
  page,
  request,
}) => {
  await followViaApi(request, 1, 1);
  await page.route('**/creators/1/followers/1', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill(serverError);
      return;
    }
    await route.fallback();
  });
  await page.goto('/');
  await expect(unfollowButton(page)).toBeEnabled();
  await expect(followerCount(page, '1 seguidor')).toBeVisible();

  await unfollowButton(page).click();

  await expect(page.getByRole('alert')).toHaveText(failureMessage);
  await expect(followerCount(page, '1 seguidor')).toBeVisible();
  await expect(unfollowButton(page)).toBeEnabled();
  await expect(unfollowButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(followButton(page)).toHaveCount(0);
  expect(await followingViaApi(request, 1, 1)).toStrictEqual({
    following: true,
  });
});

test('FR-026: resposta 500 na releitura da contagem depois de um POST bem-sucedido mostra a mensagem e mantém "0 seguidores" e "Seguir"', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(followButton(page)).toBeEnabled();
  await expect(followerCount(page, '0 seguidores')).toBeVisible();
  await page.route('**/creators/1/followers/count', (route) =>
    route.fulfill(serverError),
  );
  const postResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/creators/1/followers',
  );

  await followButton(page).click();

  expect((await postResponse).status()).toBe(201);
  await expect(page.getByRole('alert')).toHaveText(failureMessage);
  await expect(followerCount(page, '0 seguidores')).toBeVisible();
  await expect(followButton(page)).toBeEnabled();
  await expect(followButton(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(unfollowButton(page)).toHaveCount(0);
  expect(await followingViaApi(request, 1, 1)).toStrictEqual({
    following: true,
  });
});

test('FR-022: trocar de Ana para Bruno enquanto o POST de Ana está retido deixa o botão "Seguir" com aria-pressed false para Bruno, coerente com a API', async ({
  page,
  request,
}) => {
  const gate = createGate();
  await page.route('**/creators/1/followers', async (route) => {
    if (route.request().method() === 'POST') {
      await gate.opened;
    }
    await route.fallback();
  });
  await page.goto('/');
  await expect(selectedUser(page, 'Ana')).toHaveCount(1);
  await expect(followButton(page)).toBeEnabled();
  const postSent = page.waitForRequest(
    (sent) =>
      sent.method() === 'POST' &&
      new URL(sent.url()).pathname === '/creators/1/followers',
  );
  const countAfterPost = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/creators/1/followers/count',
  );

  await followButton(page).click();
  await postSent;

  const brunoStatus = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/creators/1/followers/2',
  );
  if (await userSelect(page).isEnabled()) {
    await userSelect(page).selectOption({ label: 'Bruno' });
    expect((await brunoStatus).status()).toBe(200);
    gate.open();
    expect((await countAfterPost).status()).toBe(200);
  } else {
    gate.open();
    expect((await countAfterPost).status()).toBe(200);
    await expect(userSelect(page)).toBeEnabled();
    await userSelect(page).selectOption({ label: 'Bruno' });
    expect((await brunoStatus).status()).toBe(200);
  }

  await expect(page.getByRole('button')).not.toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expect(selectedUser(page, 'Bruno')).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Seguir', exact: true, pressed: false }),
  ).toBeEnabled();
  await expect(followButton(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(unfollowButton(page)).toHaveCount(0);
  expect(await followingViaApi(request, 1, 2)).toStrictEqual({
    following: false,
  });
  expect(await followingViaApi(request, 1, 1)).toStrictEqual({
    following: true,
  });
});

test('FR-025: dois eventos click despachados na mesma tarefa sobre "Seguir" geram exatamente um POST e nenhum DELETE', async ({
  page,
  request,
}) => {
  const actions: string[] = [];
  page.on('request', (sent) => {
    const { pathname } = new URL(sent.url());
    if (
      pathname.startsWith('/creators/1/followers') &&
      (sent.method() === 'POST' || sent.method() === 'DELETE')
    ) {
      actions.push(sent.method());
    }
  });
  await page.goto('/');
  await expect(followButton(page)).toBeEnabled();

  await followButton(page).evaluate((button) => {
    button.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    button.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
  });

  await expect(unfollowButton(page)).toBeEnabled();
  await expect(followerCount(page, '1 seguidor')).toBeVisible();
  expect(actions).toStrictEqual(['POST']);
  expect(await countViaApi(request, 1)).toStrictEqual({
    creatorId: 1,
    count: 1,
  });
  expect(await followingViaApi(request, 1, 1)).toStrictEqual({
    following: true,
  });
});

test('FR-022 FR-026: a troca para Bruno que falha com 500 mostra a mensagem; a troca seguinte para Carla, bem-sucedida, esvazia a área de erro e mostra "Seguir"', async ({
  page,
  request,
}) => {
  await followViaApi(request, 1, 1);
  await page.route('**/creators/1/followers/2', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill(serverError);
      return;
    }
    await route.fallback();
  });
  await page.goto('/');
  await expect(selectedUser(page, 'Ana')).toHaveCount(1);
  await expect(unfollowButton(page)).toBeEnabled();
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveCount(
    0,
  );

  await userSelect(page).selectOption({ label: 'Bruno' });

  await expect(page.getByRole('alert')).toHaveText(failureMessage);

  const carlaStatus = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/creators/1/followers/3',
  );
  await userSelect(page).selectOption({ label: 'Carla' });
  expect((await carlaStatus).status()).toBe(200);

  await expect(selectedUser(page, 'Carla')).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Seguir', exact: true, pressed: false }),
  ).toBeEnabled();
  await expect(unfollowButton(page)).toHaveCount(0);
  await expect(followerCount(page, '1 seguidor')).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveCount(
    0,
  );
});
