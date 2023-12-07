import { test, expect } from '@playwright/test';
import R3FTestHarness from '../utils/r3fTestHarness';
import { getSceneId, playwrightHelper, tmScene } from '../utils/sceneHelpers';

const TEST_IFRAME = '#root';
const LOCAL_SCENE = '/iframe.html?args=&id=tests-scene-viewer--motion-indicator';
const LOCAL_SCENE_2 = '/iframe.html?args=&id=developer-scene-composer--local-scene';
const CANVAS = '#tm-scene-unselectable-canvas';

test.describe('scene composer', () => {
  test('load page', async ({ page }) => {
    const scenePage = await page.goto(LOCAL_SCENE);
    expect(scenePage).toBeDefined();
  });

  test('visual regression', async ({ page }) => {
    await page.goto(LOCAL_SCENE);
    const frame = page.locator(TEST_IFRAME);
    // check to see if github actions has ability to comment that you're setting up screenshots
    expect(await frame.locator(CANVAS).screenshot()).toMatchSnapshot({ name: 'local-scene-canvas.png', threshold: 1 });
  });

  test('get scene', async ({ page }) => {
    await page.goto(LOCAL_SCENE);
    const frame = page.locator(TEST_IFRAME);
    const sceneId = await getSceneId(frame);
    const scene = await tmScene(frame, sceneId);
    expect(sceneId).toEqual('motion-indicator-view-options');
    expect(scene.type).toEqual('Scene');
  });

  test('get object by name', async ({ page }) => {
    await page.goto(LOCAL_SCENE_2);
    const frame = page.locator(TEST_IFRAME);
    const sceneId = await getSceneId(frame);
    await tmScene(frame, sceneId);

    // TODO: remove setTimeout if sceneLoaded event is updated to reflect when entities are done loading into the canvas
    setTimeout(async () => {
      // find object named 'PalletJack'
      const palletJack = await playwrightHelper({ page, sceneId, callback: async (harness: R3FTestHarness) => {
        return await harness.getObjecByName('PalletJack');
      } });

      // assert expected values on object
      expect(palletJack.isObject3D).toBeTruthy();
      expect(palletJack.type).toEqual('Group');
      expect(palletJack.visible).toBeTruthy();
    }, 6000);
  });

  test('select object', async ({ page }) => {
    await page.goto(LOCAL_SCENE_2);
    const frame = page.locator(TEST_IFRAME);
    const sceneId = await getSceneId(frame);
    await tmScene(frame, sceneId);

    // TODO: remove setTimeout if sceneLoaded event is updated to reflect when entities are done loading into the canvas
    setTimeout(async () => {
      // find object named 'PalletJack'
      const palletJack = await playwrightHelper({ page, sceneId, callback: async (harness: R3FTestHarness) => {
        return await harness.getObjecByName('PalletJack');
      } });

      // select object in hierarchy
      const formattedName = palletJack.name.replace(/([A-Z])/g, ' $1').trim();
      const handle = await page.$(`text=${formattedName}`);
      await handle?.hover();
      await handle?.click();

      // assert that the associated selectedSceneNode.ref was selected in the Inspector Panel
      expect(page.getByTestId('cb85148b-00ca-4006-8b0f-600890eaee46')).toBeDefined();
    }, 6000);
  });
});
