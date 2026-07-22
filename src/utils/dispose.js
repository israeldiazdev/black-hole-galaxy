import * as THREE from 'three';

export function disposeObject3D(object) {
  if (!object) {
    return;
  }

  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }

    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => disposeMaterial(material));
      } else {
        disposeMaterial(child.material);
      }
    }

    if (child.texture) {
      child.texture.dispose();
    }
  });
}

function disposeMaterial(material) {
  Object.keys(material).forEach((key) => {
    const value = material[key];
    if (value && value.isTexture) {
      value.dispose();
    }
  });
  material.dispose();
}

export function safeRemove(parent, child) {
  if (parent && child && child.parent === parent) {
    parent.remove(child);
  }
}
