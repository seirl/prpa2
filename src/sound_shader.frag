#version 330 core

out vec4 fragColor;

uniform float iGlobalTime;
uniform float iSampleRate;
uniform vec2 iResolution;

#define tau 6.2831853071
#define freqcoef 1.059463094359

float total = 0.;

float notefreq(float n)
{
    return 440. * pow(freqcoef, n);
}

vec2 ding(float time, float note)
{
    float freq = 350.;
    float y = 0.0;

    y += 32.*sin(4.*tau*freq*time)*exp(-0.01*freq*time);
    y += 16.*sin(8.*tau*freq*time)*exp(-0.012*freq*time);
    y += 8.*sin(16.*tau*freq*time)*exp(-0.014*freq*time);
    y += 4.*sin(32.*tau*freq*time)*exp(-0.016*freq*time);
    y += 2.*sin(128.*tau*freq*time)*exp(-0.018*freq*time);
    y /= 30.;

    total += exp(-0.01*freq*time);

    return vec2(y);
}

vec2 vibra(float t, float note)
{
    float f = notefreq(note);

    float v = 0.5*sin(tau*f*t);
    v += 0.3*sin(tau*f*exp2(1.)*t);
    v += 0.2*sin(tau*f*exp2(2.)*t);

    float env = exp(-pow(2.*t-0.5, 2.));
    v *= env;
    total += env;
    return vec2(v);
}

vec2 kick(float t, float note)
{
    float env = 0.5 * exp(-pow(note*t-0.5, 2.));
    total += env;
    return vec2(sin(80.*tau*t)) * env;
}

float noise( float x )
{
    return fract(sin(1371.1*x)*43758.5453);
}

vec2 snare(float t, float note)
{
    float env = 0.3 * exp(-pow(note*t-0.5, 2.));
    total += env;
    return vec2(sin(noise(t))) * env;
}

#define PLAY(ins, st, note) if (t > st) v += ins(t - st, note);

vec2 mainSound(float time)
{
    vec2 v = vec2(0.);
    total = 0.;

    float t = mod(time, 32.2);

    // 1st part
    if (t < 12.8)
        t = mod(t, 6.4);
    float base = 5.;
    PLAY(vibra, 0., base);
    PLAY(vibra, 0.2, base-3.);
    PLAY(vibra, 0.4, base-7.);
    PLAY(vibra, 0.6, base-8.);
    t -= 1.6;
    base = 7.;
    PLAY(vibra, 0., base);
    PLAY(vibra, 0.2, base-3.);
    PLAY(vibra, 0.4, base-7.);
    PLAY(vibra, 0.6, base-8.);
    t -= 1.6;
    PLAY(vibra, 0., base);
    PLAY(vibra, 0.2, base-3.);
    PLAY(vibra, 0.4, base-7.);
    PLAY(vibra, 0.6, base-8.);
    t -= 1.6;
    base = 5.;
    PLAY(vibra, 0., base);
    PLAY(vibra, 0.2, base-3.);
    PLAY(vibra, 0.4, base-7.);
    PLAY(vibra, 0.6, base-8.);
    t -= 1.6 + 6.4;

    //2nd part
    if (t >= 0.)
        t = mod(t, 9.7);
    base = 8.;
    PLAY(vibra, 0., base);
    PLAY(vibra, 0.9, base-2.);
    PLAY(vibra, 1.1, base-4.);
    PLAY(vibra, 1.5, base-5.);
    PLAY(vibra, 2.3, base-7.);
    t -= 2.9;
    base = 3.;
    PLAY(vibra, 0., base);
    PLAY(vibra, 0.9, base-2.);
    PLAY(vibra, 1.1, base-4.);
    PLAY(vibra, 1.5, base-5.);
    PLAY(vibra, 2.3, base-7.);
    t -= 2.9;
    base = 0.;
    PLAY(vibra, 0., base);
    PLAY(vibra, 0.9, base-2.);
    PLAY(vibra, 1.1, base-4.);
    PLAY(vibra, 1.5, base-5.);
    PLAY(vibra, 2.3, base-7.);
    PLAY(vibra, 2.8, base-5.);

    // drums
    t = mod(time, 3.);
    PLAY(snare, 0.02, 5.);
    PLAY(snare, 0.52, 10.);
    PLAY(snare, 0.72, 10.);
    PLAY(snare, 1.3, 5.);
    PLAY(snare, 1.7, 5.);
    PLAY(snare, 2.1, 10.);
    PLAY(snare, 2.3, 10.);
    PLAY(kick, 0., 5.);
    PLAY(kick, 0.5, 10.);
    PLAY(kick, 0.7, 10.);

    // ding
    t = mod(time, 5.);
    PLAY(ding, 0., 42.);

    total = max(3., total);
    return clamp(v/total, -1., 1.);
}

void main()
{
    float t = iGlobalTime + 4.*(gl_FragCoord.y * iResolution.x + gl_FragCoord.x) / iSampleRate;
    vec4 r = vec4(mainSound(t).x,
                  mainSound(t + 1.0 / iSampleRate).x,
                  mainSound(t + 2.0 / iSampleRate).x,
                  mainSound(t + 3.0 / iSampleRate).x);
    fragColor = (r+1.0)/2.0;
}
