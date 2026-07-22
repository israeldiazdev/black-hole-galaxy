uniform float uTime;
uniform float uGlow;
uniform float uDistortion;
uniform vec3 uHotColor;
uniform vec3 uCoolColor;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float r = length(uv);
  float angle = atan(uv.y, uv.x);

  float warp = sin(angle * 7.0 - uTime * 2.3) * 0.08 * uDistortion;
  float band = smoothstep(0.95 + warp, 0.55 + warp, r) - smoothstep(0.6 + warp, 0.35 + warp, r);

  float streak = pow(max(0.0, sin(angle * 9.0 + uTime * 4.0)), 3.5);
  float turbulence = hash(uv * 12.0 + uTime * 0.03) * 0.3;
  float heat = clamp(streak + turbulence, 0.0, 1.0);

  vec3 col = mix(uCoolColor, uHotColor, heat);
  float alpha = band * (0.28 + heat * 0.9) * uGlow;

  if (alpha < 0.01) {
    discard;
  }

  gl_FragColor = vec4(col, alpha);
}
