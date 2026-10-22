import { expect, test } from './fixtures';
import {
  countViaApi,
  followButton,
  followerCount,
  selectedUser,
  unfollowButton,
  userSelect,
} from './support';

test('FR-024 FR-023: com Ana e Bruno na página vendo "0 seguidores", Ana segue e depois Bruno segue sem recarregar e vê "2 seguidores"', async ({
  page,
  browser,
  baseURL,
  request,
}) => {
  const brunoContext = await browser.newContext({ baseURL });
  try {
    const brunoPage = await brunoContext.newPage();

    await page.goto('/');
    await expect(selectedUser(page, 'Ana')).toHaveCount(1);
    await expect(followButton(page)).toBeEnabled();
    await expect(followerCount(page, '0 seguidores')).toBeVisible();

    await brunoPage.goto('/');
    await expect(followButton(brunoPage)).toBeEnabled();
    const brunoStatus = brunoPage.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/creators/1/followers/2',
    );
    await userSelect(brunoPage).selectOption({ label: 'Bruno' });
    expect((await brunoStatus).status()).toBe(200);
    await expect(selectedUser(brunoPage, 'Bruno')).toHaveCount(1);
    await expect(followButton(brunoPage)).toBeEnabled();
    await expect(followerCount(brunoPage, '0 seguidores')).toBeVisible();

    await followButton(page).click();
    await expect(unfollowButton(page)).toBeVisible();
    await expect(followerCount(page, '1 seguidor')).toBeVisible();

    await followButton(brunoPage).click();

    await expect(unfollowButton(brunoPage)).toBeVisible();
    await expect(followerCount(brunoPage, '2 seguidores')).toBeVisible();
    expect(await countViaApi(request, 1)).toStrictEqual({
      creatorId: 1,
      count: 2,
    });
  } finally {
    await brunoContext.close();
  }
});
