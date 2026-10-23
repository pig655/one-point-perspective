import { describe, it, expect } from 'vitest';
import {
  createCarGeometry,
  createBusGeometry,
  createTruckGeometry,
  createStreetlightGeometry,
  createSkyscraperGeometry,
  createStoreGeometry,
  createBenchGeometry,
  createHydrantGeometry,
  createDogGeometry,
  createCatGeometry,
  getGeometryModel,
  projectSceneObject
} from './geometry';
import { SceneObject, PerspectiveCamera } from '../models/types';

describe('10 New 3D Realistic Geometry Models', () => {
  const models = [
    { type: 'car', fn: () => createCarGeometry(120, 75, 220) },
    { type: 'bus', fn: () => createBusGeometry(140, 130, 360) },
    { type: 'truck', fn: () => createTruckGeometry(130, 120, 280) },
    { type: 'streetlight', fn: () => createStreetlightGeometry(60, 210, 60) },
    { type: 'skyscraper', fn: () => createSkyscraperGeometry(180, 320, 160) },
    { type: 'store', fn: () => createStoreGeometry(170, 160, 150) },
    { type: 'bench', fn: () => createBenchGeometry(120, 65, 55) },
    { type: 'hydrant', fn: () => createHydrantGeometry(35, 60, 35) },
    { type: 'dog', fn: () => createDogGeometry(40, 55, 70) },
    { type: 'cat', fn: () => createCatGeometry(30, 45, 55) }
  ];

  const camera: PerspectiveCamera = {
    vpX: 500,
    vpY: 350,
    focalLength: 500,
    canvasWidth: 1000,
    canvasHeight: 700
  };

  models.forEach(({ type, fn }) => {
    it(`should create a valid geometry model for ${type}`, () => {
      const model = fn();
      const vCount = model.localVertices.length;
      expect(vCount).toBeGreaterThan(0);
      expect(model.faces.length).toBeGreaterThan(0);
      expect(model.edges.length).toBeGreaterThan(0);

      // Verify all face indices are valid
      for (const face of model.faces) {
        expect(face.vertexIndices.length).toBeGreaterThanOrEqual(3);
        for (const idx of face.vertexIndices) {
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThan(vCount);
        }
      }

      // Verify all edge indices are valid
      for (const [v1, v2] of model.edges) {
        expect(v1).toBeGreaterThanOrEqual(0);
        expect(v1).toBeLessThan(vCount);
        expect(v2).toBeGreaterThanOrEqual(0);
        expect(v2).toBeLessThan(vCount);
      }

      // Verify guideline indices are valid
      for (const g of model.guidelineVertices || []) {
        expect(g).toBeGreaterThanOrEqual(0);
        expect(g).toBeLessThan(vCount);
      }
    });

    it(`should project ${type} with perspective camera without errors`, () => {
      const obj: SceneObject = {
        id: `test-${type}`,
        name: type,
        category: 'vehicle',
        x: 400,
        y: 450,
        z: 100,
        dimensions: { width: 100, height: 100, depth: 100 },
        color: '#2563EB',
        geometryType: type,
        order: 1
      };

      const projected = projectSceneObject(obj, camera, false);
      expect(projected.projectedVertices.length).toBeGreaterThan(0);
      expect(projected.faces.length).toBeGreaterThan(0);
      expect(projected.edges.length).toBeGreaterThan(0);
      expect(projected.boundingBox.width).toBeGreaterThan(0);
      expect(projected.boundingBox.height).toBeGreaterThan(0);
    });
  });

  it('should resolve all 10 geometry types through getGeometryModel', () => {
    models.forEach(({ type }) => {
      const dummy: SceneObject = {
        id: `dummy-${type}`,
        name: type,
        category: 'vehicle',
        x: 0,
        y: 0,
        z: 0,
        dimensions: { width: 50, height: 50, depth: 50 },
        color: '#000000',
        geometryType: type,
        order: 0
      };
      const model = getGeometryModel(dummy);
      expect(model.localVertices.length).toBeGreaterThan(0);
    });
  });
});
