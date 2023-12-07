import { Scene, WebGLRenderer } from 'three';
import { Locator } from '@playwright/test';
import R3FTestHarness from './r3fTestHarness';

declare global {
  interface Window {
    __twinmaker_tests: {
      [key: string]: {
        scene: Scene;
        gl: WebGLRenderer;
      };
    };
  }
}

type SceneLoadedEventDetail = { sceneComposerId: string; scene: Scene; gl: WebGLRenderer };

interface SceneLoadedEvent extends Event {
  detail: SceneLoadedEventDetail;
}

export const getSceneId = async (host: Locator): Promise<string> => {
  const sceneId: string = await host.evaluate(async () => {
    return await new Promise((res, rej) => {
      const timer = setTimeout(
        () => rej(new Error('Timeout, twinmaker:scene-loaded was not reached in reasonable time.')),
        20000,
      );

      window.addEventListener('twinmaker:scene-loaded', (evt: Event) => {
        const { detail } = evt as SceneLoadedEvent;
        const { sceneComposerId, scene, gl } = detail;
        window['__twinmaker_tests'] = window['__twinmaker_tests'] || {};
        window['__twinmaker_tests'][sceneComposerId] = { scene, gl };
        clearTimeout(timer);
        res(sceneComposerId);
      });
    });
  });
  return sceneId;
};

export const tmScene = async (frame: Locator, sceneId: string) => {
  const sceneResult = await frame.evaluate((_element: HTMLElement, sceneId: string) => {
    return Promise.resolve<Scene>(window['__twinmaker_tests'][sceneId].scene);
  }, sceneId);
  return sceneResult;
};

type evaluateProps = {
  sceneId: string;
  callbackString: string;
  TMHarnessClass: string;
};

export const playwrightHelper = async ({ ...props }) => {
  const { page, sceneId, callback } = props;
  return await page.evaluate(
    async ({ sceneId, callbackString, TMHarnessClass }: evaluateProps) => {
      const { scene } = window['__twinmaker_tests'][sceneId];
      if (!scene) {
        throw new Error('Scene is not loaded');
      }
      const HarnessClass = eval('window.TMHarnessClass = ' + TMHarnessClass);
      const harness = await new HarnessClass(scene);
      const cb = new Function(`return (${callbackString}).apply(null, arguments)`);
      return await cb(harness, sceneId);
    },
    { sceneId: sceneId, callbackString: callback.toString(), TMHarnessClass: R3FTestHarness.toString() },
  );
};
