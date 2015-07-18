#version 330 core

in vec2 inPos;

uniform vec2 iResolution;
uniform float iGlobalTime;

void main()
{
    gl_Position = vec4(inPos.xy, 1.0, 1.0);
}
