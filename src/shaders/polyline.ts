export const vertexShader = `#version 300 es
in vec2 a_position;
in float a_thickness;
in float a_miter;
in vec2 a_normal;
in vec3 a_color;
in float a_distance;
out vec3 v_color;
out vec2 v_normal;
out float v_feather;
flat out float v_distance;
uniform mat4 u_matrix;

void main(){
    v_distance = a_distance;
    v_color = a_color;
    v_normal = a_normal;
    v_feather = 1.0 / a_thickness;
    gl_Position = u_matrix * vec4((a_position + a_normal * a_thickness / 2.0 * a_miter), 0, 1);
}`;

export const fragmentShader = `#version 300 es
precision highp float;
in vec3 v_color;
in vec2 v_normal;
in float v_feather;
flat in float v_distance;
out vec4 outColor;
void main() {
    float lineUMod = mod(v_distance, 1.0/15.0) * 15.0; 
    float dash = smoothstep(0.2, 0.2+0.01, length(lineUMod-0.5));
    outColor = vec4(v_color, 1.0);
}`;
