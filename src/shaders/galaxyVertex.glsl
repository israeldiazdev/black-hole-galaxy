attribute float aSize;
attribute float aAlpha;
attribute float aPhase;
attribute float aSpeed;

uniform float uTime;
uniform float uSize;
uniform float uRotationSpeed;
uniform float uPixelRatio;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec3 pos = position;
  float angle = uTime * (aSpeed * uRotationSpeed);
  float cs = cos(angle);
  float sn = sin(angle);

  pos = vec3(
    pos.x * cs - pos.z * sn,
    pos.y,
    pos.x * sn + pos.z * cs
  );

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float twinkle = 0.75 + 0.25 * sin(uTime * 1.75 + aPhase);
  gl_PointSize = aSize * uSize * uPixelRatio * twinkle;
  gl_PointSize *= (1.0 / -mvPosition.z);

  vColor = color;
  vAlpha = aAlpha;
}
