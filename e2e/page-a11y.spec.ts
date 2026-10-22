import { Locator } from '@playwright/test';
import { expect, test } from './fixtures';
import {
  creatorHeading,
  followButton,
  followViaApi,
  followerCount,
  followingViaApi,
  selectedUser,
  unfollowButton,
  userSelect,
} from './support';

function liveRegionPoliteness(locator: Locator): Promise<string | null> {
  return locator.evaluate((element) => {
    for (
      let node: Element | null = element;
      node !== null;
      node = node.parentElement
    ) {
      const politeness = node.getAttribute('aria-live');
      if (politeness !== null) {
        return politeness;
      }
    }
    return null;
  });
}

test('FR-028: só com teclado, Tab foca "Você é", seta troca para Bruno, Tab chega ao botão e Enter segue', async ({
  page,
  request,
}) => {
  await followViaApi(request, 1, 1);
  await page.goto('/');
  await expect(unfollowButton(page)).toBeEnabled();
  await expect(followerCount(page, '1 seguidor')).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(userSelect(page)).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(selectedUser(page, 'Bruno')).toHaveCount(1);
  await expect(followButton(page)).toBeEnabled();

  await page.keyboard.press('Tab');
  await expect(followButton(page)).toBeFocused();

  await page.keyboard.press('Enter');

  await expect(unfollowButton(page)).toBeVisible();
  await expect(followerCount(page, '2 seguidores')).toBeVisible();
  expect(await followingViaApi(request, 1, 2)).toStrictEqual({
    following: true,
  });
});

test('FR-028: só com teclado, Tab até o botão e Espaço segue', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(followButton(page)).toBeEnabled();

  await page.keyboard.press('Tab');
  await expect(userSelect(page)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(followButton(page)).toBeFocused();

  await page.keyboard.press('Space');

  await expect(unfollowButton(page)).toBeVisible();
  await expect(followerCount(page, '1 seguidor')).toBeVisible();
  expect(await followingViaApi(request, 1, 1)).toStrictEqual({
    following: true,
  });
});

test('FR-029: o botão expõe aria-pressed false/true e a contagem fica numa região aria-live="polite" antes e depois de seguir', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Seguir', exact: true, pressed: false }),
  ).toBeVisible();
  await expect(followButton(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(followerCount(page, '0 seguidores')).toBeVisible();
  expect(await liveRegionPoliteness(followerCount(page, '0 seguidores'))).toBe(
    'polite',
  );

  await followButton(page).click();

  await expect(
    page.getByRole('button', {
      name: 'Deixar de seguir',
      exact: true,
      pressed: true,
    }),
  ).toBeVisible();
  await expect(unfollowButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(followerCount(page, '1 seguidor')).toBeVisible();
  expect(await liveRegionPoliteness(followerCount(page, '1 seguidor'))).toBe(
    'polite',
  );
});

for (const viewport of [
  { width: 375, height: 812 },
  { width: 1280, height: 800 },
]) {
  test(`FR-030: em ${viewport.width}x${viewport.height} nome, contagem, seletor e botão ficam visíveis sem rolagem horizontal`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const content = [
      creatorHeading(page, 'Luna Prado'),
      followerCount(page, '0 seguidores'),
      userSelect(page),
      followButton(page),
    ];
    for (const locator of content) {
      await expect(locator).toBeVisible();
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? Infinity)).toBeLessThanOrEqual(
        viewport.width,
      );
    }
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(viewport.width);
  });
}

for (const key of ['Enter', 'Space']) {
  test(`FR-028 FR-029: depois de seguir com ${key} o botão continua focado com aria-pressed true e um segundo ${key} deixa de seguir, com o foco mantido e aria-pressed false`, async ({
    page,
    request,
  }) => {
    await page.goto('/');
    await expect(followButton(page)).toBeEnabled();
    await page.keyboard.press('Tab');
    await expect(userSelect(page)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(followButton(page)).toBeFocused();

    await page.keyboard.press(key);

    await expect(unfollowButton(page)).toBeEnabled();
    await expect(followerCount(page, '1 seguidor')).toBeVisible();
    await expect(unfollowButton(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(unfollowButton(page)).toBeFocused();
    expect(await followingViaApi(request, 1, 1)).toStrictEqual({
      following: true,
    });

    await page.keyboard.press(key);

    await expect(followButton(page)).toBeEnabled();
    await expect(followerCount(page, '0 seguidores')).toBeVisible();
    await expect(followButton(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(followButton(page)).toBeFocused();
    await expect(unfollowButton(page)).toHaveCount(0);
    expect(await followingViaApi(request, 1, 1)).toStrictEqual({
      following: false,
    });
  });
}
