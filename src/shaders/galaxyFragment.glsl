varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float d = length(uv);
  float soft = smoothstep(0.5, 0.05, d);
  float core = smoothstep(0.2, 0.0, d) * 0.45;
  float alpha = (soft + core) * vAlpha;

  if (alpha < 0.01) {
    discard;
  }

  gl_FragColor = vec4(vColor, alpha);
}
