#version 330 core

in vec2 position;

uniform float iGlobalTime;
uniform float iSampleRate;
uniform float iWidth;

void main()
{
    gl_Position = vec4(2.0*position-1.0, 0.0, 1.0);
}
